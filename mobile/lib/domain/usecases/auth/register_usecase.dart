import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/user.dart';
import '../../repositories/auth_repository.dart';

class RegisterUseCase implements UseCase<User, RegisterParams> {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  @override
  Future<Either<Failure, User>> call(RegisterParams params) async {
    return await repository.register(
      fullName: params.fullName,
      identificationNumber: params.identificationNumber,
      address: params.address,
      phoneNumber: params.phoneNumber,
      email: params.email,
      username: params.username,
      password: params.password,
      areaCode: params.areaCode,
    );
  }
}

class RegisterParams extends Equatable {
  final String fullName;
  final String identificationNumber;
  final String address;
  final String phoneNumber;
  final String email;
  final String username;
  final String password;
  final int areaCode;

  const RegisterParams({
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
