import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../domain/entities/user.dart';
import '../../../domain/usecases/user/get_user_profile_usecase.dart';
import '../../../domain/usecases/user/update_user_profile_usecase.dart';
import '../../../core/utils/usecase.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserProfileUseCase getUserProfileUseCase;
  final UpdateUserProfileUseCase updateUserProfileUseCase;

  UserBloc({
    required this.getUserProfileUseCase,
    required this.updateUserProfileUseCase,
  }) : super(UserInitialState()) {
    on<LoadUserEvent>(_onLoadUser);
    on<UpdateUserProfileEvent>(_onUpdateUserProfile);
    on<UploadUserAvatarEvent>(_onUploadUserAvatar);
    on<UpdateUserPasswordEvent>(_onUpdateUserPassword);
    on<DeleteUserAccountEvent>(_onDeleteUserAccount);
  }

  Future<void> _onLoadUser(
    LoadUserEvent event,
    Emitter<UserState> emit,
  ) async {
    emit(UserLoadingState());

    final result = await getUserProfileUseCase(NoParams());

    result.fold(
      (failure) => emit(UserErrorState(message: failure.message)),
      (user) => emit(UserLoadedState(user: user)),
    );
  }

  Future<void> _onUpdateUserProfile(
    UpdateUserProfileEvent event,
    Emitter<UserState> emit,
  ) async {
    emit(UserUpdatingState());

    final result = await updateUserProfileUseCase(
      UpdateProfileParams(
        fullName: "${event.firstName ?? ''} ${event.lastName ?? ''}".trim(),
        email: event.email ?? '',
        phoneNumber: event.phoneNumber ?? '',
        address: '',
        identificationNumber: '',
      ),
    );

    result.fold(
      (failure) => emit(UserErrorState(message: failure.message)),
      (user) => emit(UserUpdatedState(user: user)),
    );
  }

  Future<void> _onUploadUserAvatar(
    UploadUserAvatarEvent event,
    Emitter<UserState> emit,
  ) async {
    emit(UserUpdatingState());

    // Since we don't have this use case yet, emit an error state
    emit(const UserErrorState(message: 'Avatar upload not implemented yet'));
  }

  Future<void> _onUpdateUserPassword(
    UpdateUserPasswordEvent event,
    Emitter<UserState> emit,
  ) async {
    emit(UserUpdatingState());

    // Since we don't have this use case yet, emit an error state
    emit(const UserErrorState(message: 'Password update not implemented yet'));
  }

  Future<void> _onDeleteUserAccount(
    DeleteUserAccountEvent event,
    Emitter<UserState> emit,
  ) async {
    emit(UserDeletingState());

    // Since we don't have this use case yet, emit an error state
    emit(const UserErrorState(message: 'Account deletion not implemented yet'));
  }
}
