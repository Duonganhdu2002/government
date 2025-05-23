import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';

class ApiConstants {
  // Base URL for the API
  static String get baseUrl {
    // Use .env if available
    if (dotenv.env['API_URL'] != null) {
      return dotenv.env['API_URL']!;
    }

    // For Android emulator, use 10.0.2.2 to point to host machine's localhost
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }

    // Default for other platforms
    return 'http://192.168.1.4:8080';
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
  static const String userApplicationsEndpoint = '/api/applications/my';
  static const String applicationUploadEndpoint = '/api/application-upload';

  // Media endpoints
  static const String mediaFilesServeEndpoint = '/api/media-files/serve';
  static const String mediaFilesByApplicationEndpoint =
      '/api/media-files/by-application';

  // Get full media URL by ID
  static String getMediaUrl(String mediaId) =>
      '$baseUrl$mediaFilesServeEndpoint/$mediaId';

  // Get full application media URL
  static String getApplicationMediaUrl(String applicationId, String fileName) =>
      '$baseUrl$mediaFilesByApplicationEndpoint/$applicationId/$fileName';

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
