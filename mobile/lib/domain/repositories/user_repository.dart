import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/user.dart';

abstract class UserRepository {
  Future<Either<Failure, User>> getCurrentUser();

  Future<Either<Failure, User>> updateUserProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
  });

  Future<Either<Failure, User>> updateProfile({
    required String fullName,
    required String email,
    required String phoneNumber,
    String address,
    String identificationNumber,
    int? areaCode,
  });

  Future<Either<Failure, User>> uploadUserAvatar({
    required String avatarPath,
  });

  Future<Either<Failure, bool>> updateUserPassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<Either<Failure, bool>> deleteUserAccount();
}
