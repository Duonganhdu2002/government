import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  // API URLs
  static String get baseUrl =>
      dotenv.env['API_URL'] ?? 'http://localhost:8080/api';

  // Routes
  static const String splashRoute = '/';
  static const String homeRoute = '/home';
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String dashboardRoute = '/dashboard';
  static const String profileRoute = '/dashboard/profile';
  static const String historyRoute = '/dashboard/history';
  static const String applicationsRoute = '/dashboard/applications';
  static const String applicationDetailsRoute = '/dashboard/applications/:id';
  static const String guidesRoute = '/dashboard/guides';
  static const String notificationsRoute = '/dashboard/notifications';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String isDarkModeKey = 'is_dark_mode';

  // Other Constants
  static int get apiTimeoutDuration =>
      int.parse(dotenv.env['API_TIMEOUT'] ?? '30000'); // 30 seconds
}
