// ignore_for_file: empty_catches

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../constants/api_constants.dart';

/// Utility class to get a properly configured Dio instance for making API requests
class DioUtils {
  static Dio? _instance;

  /// Get a singleton instance of Dio with all necessary configurations
  static Dio getInstance() {
    _instance ??= _createDio();
    return _instance!;
  }

  /// Create a new Dio instance with all necessary configurations
  static Dio _createDio() {
    final dio = Dio();

    // Set timeout values
    dio.options.connectTimeout =
        Duration(milliseconds: ApiConstants.connectTimeout);
    dio.options.receiveTimeout =
        Duration(milliseconds: ApiConstants.receiveTimeout);
    dio.options.sendTimeout = Duration(milliseconds: ApiConstants.sendTimeout);

    // Set base URL
    dio.options.baseUrl = ApiConstants.baseUrl;

    // Set default headers
    dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        try {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString(AppConstants.tokenKey);


          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          } else {
          }
        } catch (e) {
        }

        return handler.next(options);
      },
      onError: (DioException e, handler) async {

        // Handle 401 unauthorized errors
        if (e.response?.statusCode == 401) {
          try {
            final prefs = await SharedPreferences.getInstance();
            prefs.getString(AppConstants.tokenKey);

            await prefs.remove(AppConstants.tokenKey);
            // Note: the app should handle redirecting to login in this case
          } catch (error) {
          }
        }
        return handler.next(e);
      },
      onResponse: (response, handler) {
        return handler.next(response);
      },
    ));

    // Add logging interceptor in debug mode
    dio.interceptors.add(LogInterceptor(
      request: true,
      requestHeader: true,
      requestBody: true,
      responseHeader: true,
      responseBody: true,
      error: true,
      logPrint: (obj) {
      },
    ));

    return dio;
  }

  /// Reset the singleton instance, useful for testing or when auth state changes
  static void resetInstance() {
    _instance = null;
  }

  /// Clear auth token from SharedPreferences
  static Future<void> clearToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.tokenKey);
      resetInstance();
    } catch (e) {
    }
  }
}
