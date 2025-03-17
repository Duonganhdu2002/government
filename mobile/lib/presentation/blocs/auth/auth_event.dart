part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginEvent extends AuthEvent {
  final String username;
  final String password;
  final String userType;

  const LoginEvent({
    required this.username,
    required this.password,
    this.userType = 'citizen',
  });

  @override
  List<Object> get props => [username, password, userType];
}

class RegisterEvent extends AuthEvent {
  final String fullName;
  final String identificationNumber;
  final String address;
  final String phoneNumber;
  final String email;
  final String username;
  final String password;
  final int areaCode;

  const RegisterEvent({
    required this.fullName,
    required this.identificationNumber,
    this.address = '',
    this.phoneNumber = '',
    this.email = '',
    required this.username,
    required this.password,
    this.areaCode = 1,
  });

  @override
  List<Object> get props => [
        fullName,
        identificationNumber,
        address,
        phoneNumber,
        email,
        username,
        password,
        areaCode,
      ];
}

class LogoutEvent extends AuthEvent {
  const LogoutEvent();
}

class CheckAuthStatusEvent extends AuthEvent {
  const CheckAuthStatusEvent();
}

class CancelLoginEvent extends AuthEvent {
  const CancelLoginEvent();
}

class ChangePasswordEvent extends AuthEvent {
  final String currentPassword;
  final String newPassword;

  const ChangePasswordEvent({
    required this.currentPassword,
    required this.newPassword,
  });

  @override
  List<Object> get props => [currentPassword, newPassword];
}
