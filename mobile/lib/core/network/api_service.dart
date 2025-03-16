import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import 'dart:developer' as developer;

class ApiService {
  final Dio _dio;
  final SharedPreferences _preferences;

  ApiService(this._preferences) : _dio = Dio() {
    _dio.options.baseUrl = AppConstants.baseUrl;
    _dio.options.connectTimeout =
        Duration(milliseconds: AppConstants.apiTimeoutDuration);
    _dio.options.receiveTimeout =
        Duration(milliseconds: AppConstants.apiTimeoutDuration);
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add request interceptor for authentication
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Get the auth token from shared preferences
        final token = _preferences.getString(AppConstants.tokenKey);

        // If token exists, add it to the headers
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        return handler.next(options);
      },
      onError: (DioException error, handler) {
        // Handle 401 unauthorized errors
        if (error.response?.statusCode == 401) {
          // Clear token and handle logout logic
          _preferences.remove(AppConstants.tokenKey);
          // You might want to navigate to login screen or trigger a logout event
        }
        return handler.next(error);
      },
    ));
  }

  // Generic GET request
  Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic POST request
  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic PUT request
  Future<Map<String, dynamic>> put(String path, {dynamic data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic DELETE request
  Future<Map<String, dynamic>> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Error handling
  void _handleError(DioException e) {
    // Proper logging with dart:developer
    developer.log('API Error: ${e.message}', name: 'ApiService');
    developer.log('API Error Response: ${e.response?.data}',
        name: 'ApiService');
  }
}
