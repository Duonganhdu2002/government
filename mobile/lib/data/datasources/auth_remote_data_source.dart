import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/api_constants.dart';
import '../../core/utils/failure.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register(String fullName, String email, String password);
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
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await dio.post(
        '${ApiConstants.baseUrl}/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final String token = response.data['token'];
        await sharedPreferences.setString('token', token);

        final UserModel user = UserModel.fromJson(response.data['user']);
        await _cacheUser(user);

        return user;
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Login failed',
          code: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Login failed',
        code: e.response?.statusCode,
      );
    } catch (e) {
      throw const ServerFailure(message: 'Login failed');
    }
  }

  @override
  Future<UserModel> register(
      String fullName, String email, String password) async {
    try {
      // Extract first and last name from full name
      final nameParts = fullName.split(' ');
      final firstName = nameParts.first;
      final lastName =
          nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

      final response = await dio.post(
        '${ApiConstants.baseUrl}/auth/register',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 201) {
        final String token = response.data['token'];
        await sharedPreferences.setString('token', token);

        final UserModel user = UserModel.fromJson(response.data['user']);
        await _cacheUser(user);

        return user;
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Registration failed',
          code: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Registration failed',
        code: e.response?.statusCode,
      );
    } catch (e) {
      throw const ServerFailure(message: 'Registration failed');
    }
  }

  @override
  Future<bool> logout() async {
    try {
      await sharedPreferences.remove('token');
      await sharedPreferences.remove('user');
      return true;
    } catch (e) {
      throw const CacheFailure(message: 'Failed to logout');
    }
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    try {
      final String? token = sharedPreferences.getString('token');

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
        '${ApiConstants.baseUrl}/auth/me',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final UserModel user = UserModel.fromJson(response.data['user']);
        await _cacheUser(user);
        return user;
      } else {
        await sharedPreferences.remove('token');
        return null;
      }
    } on DioException catch (_) {
      await sharedPreferences.remove('token');
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
