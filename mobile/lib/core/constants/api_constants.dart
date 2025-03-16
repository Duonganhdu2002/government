class ApiConstants {
  // Base URL for the API
  static const String baseUrl =
      'https://api.goverment-services.example.com/api/v1';

  // Authentication endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String logoutEndpoint = '/auth/logout';
  static const String meEndpoint = '/auth/me';

  // User endpoints
  static const String userProfileEndpoint = '/user/profile';
  static const String updateProfileEndpoint = '/user/profile';
  static const String uploadAvatarEndpoint = '/user/avatar';
  static const String changePasswordEndpoint = '/user/password';

  // Application endpoints
  static const String applicationsEndpoint = '/applications';

  // Timeout durations in milliseconds
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;
  static const int sendTimeout = 15000;

  // Headers
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
