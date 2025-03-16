import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../../presentation/screens/splash/splash_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/auth/register_screen.dart';
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/dashboard/dashboard_screen.dart';
import '../../presentation/screens/dashboard/profile/profile_screen.dart';
import '../../presentation/screens/dashboard/history/history_screen.dart';
import '../../presentation/screens/dashboard/applications/applications_screen.dart';
import '../../presentation/screens/dashboard/applications/application_details_screen.dart';
import '../../presentation/screens/dashboard/guides/guides_screen.dart';
import '../../presentation/screens/dashboard/notifications/notifications_screen.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();
  static late final SharedPreferences _preferences;

  // Initialize SharedPreferences before using the router
  static Future<void> init() async {
    _preferences = await SharedPreferences.getInstance();
  }

  static GoRouter get router => GoRouter(
        navigatorKey: _rootNavigatorKey,
        initialLocation: AppConstants.splashRoute,
        debugLogDiagnostics: true,
        redirect: (BuildContext context, GoRouterState state) {
          final String? token = _preferences.getString(AppConstants.tokenKey);
          final bool isAuthenticated = token != null && token.isNotEmpty;

          final bool isAuthRoute =
              state.matchedLocation == AppConstants.loginRoute ||
                  state.matchedLocation == AppConstants.registerRoute;

          // Các màn hình công khai không cần chuyển hướng
          if (state.matchedLocation == AppConstants.splashRoute) {
            return null;
          }

          // Nếu người dùng chưa đăng nhập và đang truy cập màn hình cần xác thực
          if (!isAuthenticated &&
              !isAuthRoute &&
              !state.matchedLocation.startsWith('/dashboard') &&
              state.matchedLocation != AppConstants.homeRoute) {
            return null; // Để họ truy cập các route công khai
          }

          // Nếu người dùng chưa đăng nhập và đang truy cập màn hình dashboard
          if (!isAuthenticated &&
              (state.matchedLocation.startsWith('/dashboard') ||
                  state.matchedLocation == AppConstants.homeRoute)) {
            return AppConstants.loginRoute;
          }

          // Nếu người dùng đã đăng nhập và đang ở màn hình đăng nhập/đăng ký
          if (isAuthenticated && isAuthRoute) {
            return AppConstants.dashboardRoute;
          }

          return null;
        },
        routes: [
          // Splash Screen
          GoRoute(
            path: AppConstants.splashRoute,
            builder: (context, state) => const SplashScreen(),
          ),

          // Auth Routes
          GoRoute(
            path: AppConstants.loginRoute,
            builder: (context, state) => const LoginScreen(),
          ),
          GoRoute(
            path: AppConstants.registerRoute,
            builder: (context, state) => const RegisterScreen(),
          ),

          // Dashboard with nested routes
          ShellRoute(
            navigatorKey: _shellNavigatorKey,
            builder: (context, state, child) => DashboardScreen(child: child),
            routes: [
              // Home Screen (now part of dashboard)
              GoRoute(
                path: AppConstants.homeRoute,
                builder: (context, state) => const HomeScreen(),
              ),

              // Dashboard home
              GoRoute(
                path: AppConstants.dashboardRoute,
                builder: (context, state) => const ProfileScreen(),
              ),

              // Profile
              GoRoute(
                path: AppConstants.profileRoute,
                builder: (context, state) => const ProfileScreen(),
              ),

              // History
              GoRoute(
                path: AppConstants.historyRoute,
                builder: (context, state) => const HistoryScreen(),
              ),

              // Applications
              GoRoute(
                path: AppConstants.applicationsRoute,
                builder: (context, state) => const ApplicationsScreen(),
              ),

              // Application Details
              GoRoute(
                path: AppConstants.applicationDetailsRoute,
                builder: (context, state) {
                  final applicationId = state.pathParameters['id'] ?? '';
                  return ApplicationDetailsScreen(applicationId: applicationId);
                },
              ),

              // Guides
              GoRoute(
                path: AppConstants.guidesRoute,
                builder: (context, state) => const GuidesScreen(),
              ),

              // Notifications
              GoRoute(
                path: AppConstants.notificationsRoute,
                builder: (context, state) => const NotificationsScreen(),
              ),
            ],
          ),
        ],
      );
}
