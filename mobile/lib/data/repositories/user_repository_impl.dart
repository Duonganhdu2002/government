import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/api_constants.dart';
import '../../core/constants/app_constants.dart';
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

  @override
  Future<Either<Failure, User>> updateProfile({
    required String fullName,
    required String email,
    required String phoneNumber,
    String address = '',
    String identificationNumber = '',
    int? areaCode,
  }) async {
    try {
      final userModel = await localDataSource.getUser();
      if (userModel == null) {
        return const Left(CacheFailure(
            message: 'Người dùng không tìm thấy trong bộ nhớ cache'));
      }

      // Get token from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.tokenKey);

      if (token == null || token.isEmpty) {
        return const Left(ServerFailure(
            message: 'Không có token xác thực. Vui lòng đăng nhập lại.'));
      }

      // Prepare data for API request
      final Map<String, dynamic> data = {
        'fullname': fullName,
        'email': email,
        'phonenumber': phoneNumber,
        'address': address,
        'identificationnumber': identificationNumber,
      };
      if (areaCode != null) data['areacode'] = areaCode;

      final String url = '${ApiConstants.baseUrl}/api/citizens/${userModel.id}';

      // Make API request with token in headers
      final response = await dio.patch(
        url,
        data: data,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Extract user data from response
        final responseData = response.data;
        Map<String, dynamic> userData;

        try {
          if (responseData is Map<String, dynamic>) {
            if (responseData['data'] != null &&
                responseData['data']['user'] != null) {
              userData = responseData['data']['user'];
            } else if (responseData['data'] != null &&
                responseData['data'] is Map<String, dynamic>) {
              userData = responseData['data'];
            } else if (responseData['user'] != null) {
              userData = responseData['user'];
            } else {
              // If we can't find user data in the response, use the original user data
              // with the updated fields
              userData = userModel.toJson();
              userData['fullname'] = fullName;
              userData['email'] = email;
              userData['phonenumber'] = phoneNumber;
              userData['address'] = address;
              userData['identificationnumber'] = identificationNumber;
              if (areaCode != null) userData['areacode'] = areaCode;
            }
          } else {
            userData = userModel.toJson();
            userData['fullname'] = fullName;
            userData['email'] = email;
            userData['phonenumber'] = phoneNumber;
            userData['address'] = address;
            userData['identificationnumber'] = identificationNumber;
            if (areaCode != null) userData['areacode'] = areaCode;
          }
        } catch (e) {
          // Fallback to using existing user data with updated fields
          userData = userModel.toJson();
          userData['fullname'] = fullName;
          userData['email'] = email;
          userData['phonenumber'] = phoneNumber;
          userData['address'] = address;
          userData['identificationnumber'] = identificationNumber;
          if (areaCode != null) userData['areacode'] = areaCode;
        }

        // Ensure we have at least the ID from existing user if not in response
        if (!userData.containsKey('id')) {
          userData['id'] = userModel.id;
        }

        // Create updated user from response data
        final updatedUser = UserModel(
          id: userData['id'] ?? userModel.id,
          username: userData['username'] ?? userModel.username,
          fullName: userData['fullname'] ?? fullName,
          email: userData['email'] ?? email,
          phoneNumber: userData['phonenumber'] ?? phoneNumber,
          address: userData['address'] ?? address,
          identificationNumber:
              userData['identificationnumber'] ?? identificationNumber,
          areaCode: userData['areacode'] ?? areaCode ?? userModel.areaCode,
        );

        // Cache the updated user data
        await localDataSource.cacheUser(updatedUser);
        return Right(updatedUser);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ??
              'Không thể cập nhật thông tin cá nhân',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return Left(ServerFailure(
          message: 'Hết thời gian kết nối đến máy chủ. Vui lòng thử lại sau.',
          code: e.response?.statusCode,
        ));
      }

      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Không thể kết nối đến máy chủ',
        code: e.response?.statusCode,
      ));
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return Left(ServerFailure(message: 'Lỗi: ${e.toString()}'));
    }
  }
}
