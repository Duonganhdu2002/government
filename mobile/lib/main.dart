import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/config/router.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/service_locator.dart' as di;
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/user/user_bloc.dart';
import 'presentation/blocs/application/application_bloc.dart';

void main() async {
  // Bắt tất cả lỗi không xử lý được để tránh crash app
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // Load environment variables
    await dotenv.load(fileName: ".env");

    // Initialize dependency injection
    await di.initServiceLocator();

    // Initialize AppRouter
    await AppRouter.init();

    // Bắt lỗi Flutter không xử lý được
    FlutterError.onError = (FlutterErrorDetails details) {
      // Có thể thêm phần gửi log lỗi tới Firebase Crashlytics hoặc service khác
    };

    runApp(const MyApp());
  }, (error, stackTrace) {
    // Có thể thêm phần gửi log lỗi tới Firebase Crashlytics hoặc service khác
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(
            loginUseCase: di.sl(),
            registerUseCase: di.sl(),
            logoutUseCase: di.sl(),
            getCurrentUserUseCase: di.sl(),
            changePasswordUseCase: di.sl(),
          )..add(const CheckAuthStatusEvent()),
        ),
        BlocProvider<UserBloc>(
          create: (context) => UserBloc(
            getUserProfileUseCase: di.sl(),
            updateUserProfileUseCase: di.sl(),
          ),
        ),
        BlocProvider<ApplicationBloc>(
          create: (context) => ApplicationBloc(
            getApplicationsUseCase: di.sl(),
            getApplicationByIdUseCase: di.sl(),
            createApplicationUseCase: di.sl(),
            updateApplicationUseCase: di.sl(),
            submitApplicationUseCase: di.sl(),
            deleteApplicationUseCase: di.sl(),
            getCurrentUserApplicationsUseCase: di.sl(),
          ),
        ),
      ],
      child: MaterialApp.router(
        title: 'Government Services',
        theme: AppTheme.lightTheme(),
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
