import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../constants/api_constants.dart';

/// Utility class to get a properly configured Dio instance for making API requests
class DioUtils {
  static Dio? _instance;

  /// Get a singleton instance of Dio with all necessary configurations
  static Dio getInstance() {
    if (_instance == null) {
      _instance = _createDio();
    }
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
          print('[DioUtils] Intercepting request to: ${options.path}');
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString(AppConstants.tokenKey);

          print(
              '[DioUtils] Token from SharedPreferences: ${token != null ? (token.length > 10 ? '${token.substring(0, 10)}...' : token) : 'null'}');

          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
            print(
                '[DioUtils] Added Authorization header: Bearer ${token.length > 10 ? '${token.substring(0, 10)}...' : token}');
          } else {
            print('[DioUtils] WARNING: No valid token found for request');
          }
        } catch (e) {
          print('[DioUtils] Error setting auth token: $e');
        }

        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        print(
            '[DioUtils] Request error: ${e.response?.statusCode} - ${e.message}');

        // Handle 401 unauthorized errors
        if (e.response?.statusCode == 401) {
          print('[DioUtils] 401 Unauthorized error detected');
          try {
            final prefs = await SharedPreferences.getInstance();
            final token = prefs.getString(AppConstants.tokenKey);
            print(
                '[DioUtils] Current token: ${token != null ? (token.length > 10 ? '${token.substring(0, 10)}...' : token) : 'null'}');

            await prefs.remove(AppConstants.tokenKey);
            print('[DioUtils] Token removed from SharedPreferences');
            // Note: the app should handle redirecting to login in this case
          } catch (error) {
            print('[DioUtils] Error handling 401: $error');
          }
        }
        return handler.next(e);
      },
      onResponse: (response, handler) {
        print('[DioUtils] Response received: ${response.statusCode}');
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
        print('[Dio] $obj');
      },
    ));

    return dio;
  }

  /// Reset the singleton instance, useful for testing or when auth state changes
  static void resetInstance() {
    print('[DioUtils] Resetting Dio instance');
    _instance = null;
  }

  /// Clear auth token from SharedPreferences
  static Future<void> clearToken() async {
    print('[DioUtils] Clearing auth token from SharedPreferences');
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.tokenKey);
      print('[DioUtils] Auth token cleared successfully');
      resetInstance();
    } catch (e) {
      print('[DioUtils] Error clearing auth token: $e');
    }
  }
}
