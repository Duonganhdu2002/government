import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../domain/entities/user.dart';
import '../../../domain/usecases/auth/login_usecase.dart';
import '../../../domain/usecases/auth/register_usecase.dart';
import '../../../domain/usecases/auth/logout_usecase.dart';
import '../../../domain/usecases/auth/get_current_user_usecase.dart';
import '../../../domain/usecases/auth/change_password_usecase.dart';
import '../../../core/utils/usecase.dart';
import '../../../core/utils/failure.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final ChangePasswordUseCase changePasswordUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.getCurrentUserUseCase,
    required this.changePasswordUseCase,
  }) : super(AuthInitialState()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<LogoutEvent>(_onLogout);
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
    on<CancelLoginEvent>(_onCancelLogin);
    on<ChangePasswordEvent>(_onChangePassword);
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());

    try {
      // Thêm timeout để tránh chờ vô hạn
      final result = await loginUseCase(LoginParams(
        username: event.username,
        password: event.password,
        userType: event.userType,
      )).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          throw const ServerFailure(
              message: 'Đăng nhập thất bại: Kết nối quá thời gian');
        },
      );

      result.fold(
        (failure) => emit(AuthErrorState(message: failure.message)),
        (user) => emit(AuthenticatedState(user: user)),
      );
    } catch (e) {
      // Đảm bảo luôn thoát khỏi LoadingState khi có bất kỳ lỗi nào
      String errorMessage = 'Lỗi khi đăng nhập';

      if (e is ServerFailure) {
        errorMessage = e.message;
      } else if (e is TimeoutException) {
        errorMessage = 'Kết nối quá thời gian, vui lòng thử lại sau';
      } else {
        errorMessage = 'Đăng nhập thất bại: ${e.toString()}';
      }

      emit(AuthErrorState(message: errorMessage));
    }
  }

  Future<void> _onRegister(RegisterEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());

    final params = RegisterParams(
      fullName: event.fullName,
      identificationNumber: event.identificationNumber,
      address: event.address,
      phoneNumber: event.phoneNumber,
      email: event.email,
      username: event.username,
      password: event.password,
      areaCode: event.areaCode,
    );

    final result = await registerUseCase(params);

    result.fold(
      (failure) => emit(AuthErrorState(message: failure.message)),
      (user) => emit(AuthenticatedState(user: user)),
    );
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());

    final result = await logoutUseCase(NoParams());

    result.fold(
      (failure) => emit(AuthErrorState(message: failure.message)),
      (_) => emit(AuthInitialState()),
    );
  }

  Future<void> _onCheckAuthStatus(
      CheckAuthStatusEvent event, Emitter<AuthState> emit) async {
    // Chỉ emit LoadingState nếu là lần kiểm tra đầu tiên
    if (state is AuthInitialState) {
      emit(AuthLoadingState());
    }

    try {
      // Kiểm tra user data từ token đã được lưu
      final result = await getCurrentUserUseCase(NoParams());

      await result.fold(
        (failure) async {
          // Nếu có lỗi khi lấy dữ liệu user, đăng xuất và chuyển về trạng thái khởi tạo
          print('Không thể lấy thông tin người dùng: ${failure.message}');
          await logoutUseCase(NoParams());
          emit(AuthInitialState());
        },
        (user) async {
          if (user != null) {
            // Nếu có user data, chuyển sang trạng thái đã xác thực
            emit(AuthenticatedState(user: user));
          } else {
            // Nếu không có user data nhưng có token, thử đăng xuất để xóa token
            print(
                'Có token nhưng không lấy được dữ liệu người dùng, đăng xuất');
            await logoutUseCase(NoParams());
            emit(AuthInitialState());
          }
        },
      );
    } catch (e) {
      print('Lỗi khi kiểm tra trạng thái xác thực: $e');
      // Nếu có lỗi, đăng xuất và chuyển về trạng thái khởi tạo
      await logoutUseCase(NoParams());
      emit(AuthInitialState());
    }
  }

  Future<void> _onCancelLogin(
      CancelLoginEvent event, Emitter<AuthState> emit) async {
    // Đơn giản chỉ chuyển từ trạng thái loading về trạng thái khởi tạo
    emit(AuthInitialState());
  }

  Future<void> _onChangePassword(
      ChangePasswordEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());

    try {
      final result = await changePasswordUseCase(ChangePasswordParams(
        currentPassword: event.currentPassword,
        newPassword: event.newPassword,
      ));

      result.fold(
        (failure) => emit(PasswordChangeFailureState(message: failure.message)),
        (success) => emit(PasswordChangeSuccessState()),
      );
    } catch (e) {
      emit(PasswordChangeFailureState(
          message: 'Lỗi khi đổi mật khẩu: ${e.toString()}'));
    } finally {
      // Ensure we complete the state cycle
      final currentState = state;
      if (currentState is AuthLoadingState) {
        // If still in loading state, force to failure state
        emit(PasswordChangeFailureState(
            message: 'Thao tác hết hạn, vui lòng thử lại'));
      }
    }
  }
}
