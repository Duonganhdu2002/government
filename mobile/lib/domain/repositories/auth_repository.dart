import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<bool> isAuthenticated();

  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, User>> register({
    required String fullName,
    required String email,
    required String password,
  });

  Future<Either<Failure, bool>> logout();

  Future<Either<Failure, User?>> getCurrentUser();
}
