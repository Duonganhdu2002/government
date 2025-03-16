import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  // Base URL for the API
  static String get baseUrl {
    // Sử dụng .env nếu có, hoặc mặc định sẽ dùng localhost
    return dotenv.env['API_URL'] ?? 'http://192.168.1.4:8080';
    // Thay 192.168.1.4 bằng IP thực của máy chủ trong mạng nội bộ
  }

  // Authentication endpoints
  static const String loginEndpoint = '/api/auth/login';
  static const String registerEndpoint = '/api/auth/register';
  static const String logoutEndpoint = '/api/auth/logout';
  static const String meEndpoint = '/api/auth/me';

  // User endpoints
  static const String userProfileEndpoint = '/api/user/profile';
  static const String updateProfileEndpoint = '/api/user/profile';
  static const String uploadAvatarEndpoint = '/api/user/avatar';
  static const String changePasswordEndpoint = '/api/user/password';

  // Application endpoints
  static const String applicationsEndpoint = '/api/applications';

  // Timeout durations in milliseconds
  static const int connectTimeout = 30000; // Tăng timeout để debug
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;

  // Headers
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
