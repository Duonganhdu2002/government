import 'package:dartz/dartz.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/user.dart';
import '../../repositories/user_repository.dart';

class UpdateProfileParams {
  final String fullName;
  final String email;
  final String phoneNumber;
  final String address;
  final String identificationNumber;
  final int? areaCode;

  UpdateProfileParams({
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    this.address = '',
    this.identificationNumber = '',
    this.areaCode,
  });
}

class UpdateUserProfileUseCase implements UseCase<User, UpdateProfileParams> {
  final UserRepository repository;

  UpdateUserProfileUseCase(this.repository);

  @override
  Future<Either<Failure, User>> call(UpdateProfileParams params) async {
    return await repository.updateProfile(
      fullName: params.fullName,
      email: params.email,
      phoneNumber: params.phoneNumber,
      address: params.address,
      identificationNumber: params.identificationNumber,
      areaCode: params.areaCode,
    );
  }
}
