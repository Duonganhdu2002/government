part of 'user_bloc.dart';

abstract class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object?> get props => [];
}

class LoadUserEvent extends UserEvent {
  const LoadUserEvent();

  @override
  List<Object?> get props => [];
}

class UpdateUserProfileEvent extends UserEvent {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phoneNumber;

  const UpdateUserProfileEvent({
    this.firstName,
    this.lastName,
    this.email,
    this.phoneNumber,
  });

  @override
  List<Object?> get props => [firstName, lastName, email, phoneNumber];
}

class UploadUserAvatarEvent extends UserEvent {
  final String avatarPath;

  const UploadUserAvatarEvent({required this.avatarPath});

  @override
  List<Object?> get props => [avatarPath];
}

class UpdateUserPasswordEvent extends UserEvent {
  final String currentPassword;
  final String newPassword;

  const UpdateUserPasswordEvent({
    required this.currentPassword,
    required this.newPassword,
  });

  @override
  List<Object?> get props => [currentPassword, newPassword];
}

class DeleteUserAccountEvent extends UserEvent {
  const DeleteUserAccountEvent();

  @override
  List<Object?> get props => [];
}
