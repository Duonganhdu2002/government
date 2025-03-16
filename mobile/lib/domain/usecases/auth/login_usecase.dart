import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/user.dart';
import '../../repositories/auth_repository.dart';

class LoginUseCase implements UseCase<User, LoginParams> {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  @override
  Future<Either<Failure, User>> call(LoginParams params) async {
    return await repository.login(
      username: params.username,
      password: params.password,
      userType: params.userType,
    );
  }
}

class LoginParams extends Equatable {
  final String username;
  final String password;
  final String userType;

  const LoginParams({
    required this.username,
    required this.password,
    this.userType = 'citizen',
  });

  @override
  List<Object> get props => [username, password, userType];
}
