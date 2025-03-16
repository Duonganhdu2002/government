import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../datasources/user_local_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final UserLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<bool> isAuthenticated() async {
    try {
      final user = await remoteDataSource.getCurrentUser();
      return user != null;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<Either<Failure, User>> login({
    required String username,
    required String password,
    required String userType,
  }) async {
    try {
      final user = await remoteDataSource.login(username, password, userType);
      return Right(user);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> register({
    required String fullName,
    required String identificationNumber,
    String address = '',
    String phoneNumber = '',
    String email = '',
    required String username,
    required String password,
    int areaCode = 1,
  }) async {
    try {
      final user = await remoteDataSource.register(
        fullName,
        identificationNumber,
        address,
        phoneNumber,
        email,
        username,
        password,
        areaCode,
      );
      return Right(user);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> logout() async {
    try {
      await remoteDataSource.logout();
      await localDataSource.clearUser();
      return const Right(true);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User?>> getCurrentUser() async {
    try {
      final user = await remoteDataSource.getCurrentUser();
      return Right(user);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
