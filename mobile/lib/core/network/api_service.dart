import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';

class ApiService {
  final Dio _dio;
  final SharedPreferences _preferences;

  ApiService(this._preferences) : _dio = Dio() {
    _configureDio();
  }

  void _configureDio() {
    _dio.options.baseUrl = ApiConstants.baseUrl;
    _dio.options.headers = ApiConstants.headers;

    // Cấu hình timeout
    _dio.options.connectTimeout =
        Duration(milliseconds: ApiConstants.connectTimeout);
    _dio.options.receiveTimeout =
        Duration(milliseconds: ApiConstants.receiveTimeout);
    _dio.options.sendTimeout = Duration(milliseconds: ApiConstants.sendTimeout);

    // Thêm interceptors để ghi log chi tiết request/response
    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: true,
        responseBody: true,
        error: true,
      ));
    }

    // Thêm interceptor xử lý lỗi
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException error, ErrorInterceptorHandler handler) {
        print('===== DIO ERROR INTERCEPTOR =====');
        print('URL: ${error.requestOptions.uri}');
        print('Method: ${error.requestOptions.method}');
        print('Status code: ${error.response?.statusCode}');
        print('Error type: ${error.type}');
        print('Error message: ${error.message}');

        // Xử lý lỗi kết nối
        if (error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.sendTimeout) {
          error = DioException(
            requestOptions: error.requestOptions,
            error:
                'Kết nối tới server thất bại, vui lòng kiểm tra lại internet và thử lại sau',
            type: error.type,
          );
        }

        // Chuyển tiếp lỗi đã được xử lý
        handler.next(error);
      },
    ));

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

  Dio get dio => _dio;
}
