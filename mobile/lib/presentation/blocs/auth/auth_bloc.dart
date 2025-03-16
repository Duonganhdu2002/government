import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../domain/entities/user.dart';
import '../../../domain/usecases/auth/login_usecase.dart';
import '../../../domain/usecases/auth/register_usecase.dart';
import '../../../domain/usecases/auth/logout_usecase.dart';
import '../../../core/utils/usecase.dart';
import '../../../core/utils/failure.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
  }) : super(AuthInitialState()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<LogoutEvent>(_onLogout);
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
    on<CancelLoginEvent>(_onCancelLogin);
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
      print('Lỗi khi đăng nhập: $e');
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
    emit(AuthLoadingState());

    // This would typically check if a token exists and validate it
    // For now, we'll just use the repository's getCurrentUser method

    // Simulating a delay for demo purposes
    await Future.delayed(const Duration(seconds: 1));

    // For demo purposes, we'll assume not authenticated
    emit(AuthInitialState());
  }

  Future<void> _onCancelLogin(
      CancelLoginEvent event, Emitter<AuthState> emit) async {
    // Đơn giản chỉ chuyển từ trạng thái loading về trạng thái khởi tạo
    emit(AuthInitialState());
  }
}
