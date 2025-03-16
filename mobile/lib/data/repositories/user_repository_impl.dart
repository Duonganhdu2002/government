import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/utils/failure.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/user_local_data_source.dart';
import '../models/user_model.dart';

class UserRepositoryImpl implements UserRepository {
  final Dio dio;
  final UserLocalDataSource localDataSource;

  UserRepositoryImpl({
    required this.dio,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final userModel = await localDataSource.getUser();
      if (userModel != null) {
        return Right(userModel);
      }
      return const Left(CacheFailure(message: 'User not found in cache'));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> updateUserProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
  }) async {
    try {
      final userModel = await localDataSource.getUser();
      if (userModel == null) {
        return const Left(CacheFailure(message: 'User not found in cache'));
      }

      // Prepare data for API request
      final Map<String, dynamic> data = {};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (email != null) data['email'] = email;
      if (phoneNumber != null) data['phoneNumber'] = phoneNumber;

      // Make API request
      final response = await dio.put(
        '${ApiConstants.baseUrl}${ApiConstants.updateProfileEndpoint}',
        data: data,
      );

      if (response.statusCode == 200) {
        // Update local data
        final updatedUser = UserModel.fromJson(response.data['user']);
        await localDataSource.cacheUser(updatedUser);
        return Right(updatedUser);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to update profile',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to update profile',
        code: e.response?.statusCode,
      ));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, User>> uploadUserAvatar({
    required String avatarPath,
  }) async {
    try {
      // Create FormData for file upload
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(avatarPath),
      });

      // Make API request
      final response = await dio.post(
        '${ApiConstants.baseUrl}${ApiConstants.uploadAvatarEndpoint}',
        data: formData,
      );

      if (response.statusCode == 200) {
        // Update local data
        final updatedUser = UserModel.fromJson(response.data['user']);
        await localDataSource.cacheUser(updatedUser);
        return Right(updatedUser);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to upload avatar',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to upload avatar',
        code: e.response?.statusCode,
      ));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> updateUserPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      // Make API request
      final response = await dio.put(
        '${ApiConstants.baseUrl}${ApiConstants.changePasswordEndpoint}',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode == 200) {
        return const Right(true);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to update password',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to update password',
        code: e.response?.statusCode,
      ));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> deleteUserAccount() async {
    try {
      // Make API request
      final response = await dio.delete(
        '${ApiConstants.baseUrl}${ApiConstants.userProfileEndpoint}',
      );

      if (response.statusCode == 200) {
        // Clear local data
        await localDataSource.clearUser();
        return const Right(true);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to delete account',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to delete account',
        code: e.response?.statusCode,
      ));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
