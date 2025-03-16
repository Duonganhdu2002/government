import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<bool> isAuthenticated();

  Future<Either<Failure, User>> login({
    required String username,
    required String password,
    required String userType,
  });

  Future<Either<Failure, User>> register({
    required String fullName,
    required String identificationNumber,
    String address,
    String phoneNumber,
    String email,
    required String username,
    required String password,
    int areaCode,
  });

  Future<Either<Failure, bool>> logout();

  Future<Either<Failure, User?>> getCurrentUser();
}
