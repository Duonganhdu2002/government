import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/user.dart';
import '../../repositories/user_repository.dart';

class UpdateUserProfileUseCase
    implements UseCase<User, UpdateUserProfileParams> {
  final UserRepository repository;

  UpdateUserProfileUseCase(this.repository);

  @override
  Future<Either<Failure, User>> call(UpdateUserProfileParams params) async {
    return await repository.updateUserProfile(
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phoneNumber: params.phoneNumber,
    );
  }
}

class UpdateUserProfileParams extends Equatable {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phoneNumber;

  const UpdateUserProfileParams({
    this.firstName,
    this.lastName,
    this.email,
    this.phoneNumber,
  });

  @override
  List<Object?> get props => [firstName, lastName, email, phoneNumber];
}
