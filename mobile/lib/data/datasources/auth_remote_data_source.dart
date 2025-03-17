import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/api_constants.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/failure.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String username, String password, String userType);
  Future<UserModel> register(
    String fullName,
    String identificationNumber,
    String address,
    String phoneNumber,
    String email,
    String username,
    String password,
    int areaCode,
  );
  Future<bool> logout();
  Future<UserModel?> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;
  final SharedPreferences sharedPreferences;

  AuthRemoteDataSourceImpl({
    required this.dio,
    required this.sharedPreferences,
  });

  @override
  Future<UserModel> login(
      String username, String password, String userType) async {
    try {
      // Log chi tiết để debug

      // Thêm timeout cụ thể cho request
      final options = Options(
        headers: ApiConstants.headers,
        sendTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      );

      // Ensure we're using the full URL instead of just the endpoint
      final String fullUrl =
          '${ApiConstants.baseUrl}${ApiConstants.loginEndpoint}';

      final response = await dio
          .post(
        fullUrl,
        data: {
          'username': username,
          'password': password,
          'userType': userType,
        },
        options: options,
      )
          .timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          throw DioException(
            requestOptions: RequestOptions(path: ApiConstants.loginEndpoint),
            error: 'Đăng nhập thất bại: Kết nối quá thời gian',
            type: DioExceptionType.connectionTimeout,
          );
        },
      );


      if (response.statusCode == 200 || response.statusCode == 201) {
        // Handle different response structures
        final data = response.data;
        String? token;
        Map<String, dynamic>? userData;

        if (data['tokens'] != null) {
          token = data['tokens']['accessToken'];
          userData = data['user'];
        } else if (data['data'] != null && data['data']['tokens'] != null) {
          token = data['data']['tokens']['accessToken'];
          userData = data['data']['user'];
        } else if (data['token'] != null) {
          // Hỗ trợ định dạng API cũ
          token = data['token'];
          userData = data['user'];
        } else if (data is String) {
          // Trường hợp server trả về string token trực tiếp
          token = data;
          userData = {'username': username};
        }

        if (token != null) {
          await sharedPreferences.setString(AppConstants.tokenKey, token);
          // Verify token was saved successfully
          sharedPreferences.getString(AppConstants.tokenKey);

          UserModel user;
          if (userData != null) {
            try {
              user = UserModel.fromJson(userData);
            } catch (e) {
              // Tạo user model tối thiểu nếu không parse được
              user = UserModel(
                id: 0,
                username: username,
                fullName: userData['fullname'] ?? userData['name'] ?? '',
              );
            }
            await _cacheUser(user);
            return user;
          } else {
            // Tạo user tối thiểu nếu không có userData
            user = UserModel(
              id: 0,
              username: username,
              fullName: '',
            );
            await _cacheUser(user);
            return user;
          }
        }

        throw const ServerFailure(
            message: 'Không tìm thấy token trong phản hồi');
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Đăng nhập thất bại',
          code: response.statusCode,
        );
      }
    } on DioException catch (e) {

      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        code: e.response?.statusCode,
      );
    } catch (e) {

      throw ServerFailure(message: 'Đăng nhập thất bại: ${e.toString()}');
    }
  }

  @override
  Future<UserModel> register(
    String fullName,
    String identificationNumber,
    String address,
    String phoneNumber,
    String email,
    String username,
    String password,
    int areaCode,
  ) async {
    try {
      final response = await dio.post(
        ApiConstants.registerEndpoint,
        data: {
          'fullname': fullName,
          'identificationnumber': identificationNumber,
          'address': address,
          'phonenumber': phoneNumber,
          'email': email,
          'username': username,
          'password': password,
          'areacode': areaCode,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // For registration, we might not get a user back immediately
        // We'll just return a basic user model with the username
        final UserModel user = UserModel(
          id: 0, // Will be updated when they login
          username: username,
          fullName: fullName,
          identificationNumber: identificationNumber,
          address: address,
          phoneNumber: phoneNumber,
          email: email,
          areaCode: areaCode,
        );

        return user;
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Đăng ký thất bại',
          code: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Đăng ký thất bại',
        code: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: 'Đăng ký thất bại: ${e.toString()}');
    }
  }

  @override
  Future<bool> logout() async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token != null) {
        try {
          // Try to call logout API
          await dio.post(
            ApiConstants.logoutEndpoint,
            options: Options(
              headers: {
                'Authorization': 'Bearer $token',
              },
            ),
          );
        } catch (_) {
          // Ignore API errors during logout
        }
      }

      // Always clear local storage
      await sharedPreferences.remove(AppConstants.tokenKey);
      await sharedPreferences.remove('user');
      return true;
    } catch (e) {
      throw const CacheFailure(message: 'Đăng xuất thất bại');
    }
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        return null;
      }

      // Try to get cached user first
      final String? userJson = sharedPreferences.getString('user');
      if (userJson != null) {
        return UserModel.fromJson(jsonDecode(userJson));
      }

      // If no cached user, fetch from API
      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/auth/me',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        Map<String, dynamic> userData;

        if (data['user'] != null) {
          userData = data['user'] as Map<String, dynamic>;
        } else if (data['data'] != null && data['data']['user'] != null) {
          userData = data['data']['user'] as Map<String, dynamic>;
        } else if (data['data'] != null) {
          userData = data['data'] as Map<String, dynamic>;
        } else {
          userData = data as Map<String, dynamic>;
        }

        final UserModel user = UserModel.fromJson(userData);
        await _cacheUser(user);
        return user;
      } else {
        await sharedPreferences.remove(AppConstants.tokenKey);
        return null;
      }
    } on DioException catch (_) {
      await sharedPreferences.remove(AppConstants.tokenKey);
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> _cacheUser(UserModel user) async {
    try {
      await sharedPreferences.setString('user', jsonEncode(user.toJson()));
    } catch (_) {
      // Silently ignore caching errors
    }
  }
}
