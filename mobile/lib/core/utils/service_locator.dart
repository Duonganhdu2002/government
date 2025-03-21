import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../network/api_service.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/datasources/user_local_data_source.dart';
import '../../data/datasources/application_local_data_source.dart';
import '../../data/datasources/application_remote_data_source.dart';
import '../../data/datasources/application_type_local_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/repositories/application_repository_impl.dart';
import '../../data/repositories/application_type_repository_impl.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../data/repositories/history_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/repositories/application_repository.dart';
import '../../domain/repositories/application_type_repository.dart';
import '../../domain/repositories/notification_repository.dart';
import '../../domain/repositories/history_repository.dart';
import '../../domain/usecases/auth/login_usecase.dart';
import '../../domain/usecases/auth/register_usecase.dart';
import '../../domain/usecases/auth/logout_usecase.dart';
import '../../domain/usecases/auth/get_current_user_usecase.dart';
import '../../domain/usecases/auth/change_password_usecase.dart';
import '../../domain/usecases/user/get_user_profile_usecase.dart';
import '../../domain/usecases/user/update_user_profile_usecase.dart';
import '../../domain/usecases/application/get_applications_usecase.dart';
import '../../domain/usecases/application/get_current_user_applications_usecase.dart';
import '../../domain/usecases/application/get_application_by_id_usecase.dart';
import '../../domain/usecases/application/create_application_usecase.dart';
import '../../domain/usecases/application/update_application_usecase.dart';
import '../../domain/usecases/application/submit_application_usecase.dart';
import '../../domain/usecases/application/delete_application_usecase.dart';
import '../../domain/usecases/application_type/get_application_types_usecase.dart';
import '../../domain/usecases/application_type/get_application_type_by_id_usecase.dart';
import '../../domain/usecases/application_type/get_special_application_types_usecase.dart';
import '../../domain/usecases/application_type/get_all_special_application_types_usecase.dart';
import '../../presentation/blocs/auth/auth_bloc.dart';
import '../../presentation/blocs/user/user_bloc.dart';
import '../../presentation/blocs/application/application_bloc.dart';
import '../../presentation/blocs/application_type/application_type_bloc.dart';
import '../../presentation/blocs/notification/notification_bloc.dart';
import '../../presentation/blocs/history/history_bloc.dart';
import '../utils/dio_utils.dart';

final sl = GetIt.instance;

Future<void> initServiceLocator() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerSingleton<SharedPreferences>(sharedPreferences);

  // Services
  sl.registerLazySingleton<ApiService>(() => ApiService());
  sl.registerLazySingleton<Dio>(() => DioUtils.getInstance());

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(
      dio: sl(),
      sharedPreferences: sl(),
    ),
  );

  sl.registerLazySingleton<ApplicationRemoteDataSource>(
    () => ApplicationRemoteDataSourceImpl(
      dio: sl(),
      sharedPreferences: sl(),
    ),
  );

  // Local data sources
  sl.registerLazySingleton<UserLocalDataSource>(
    () => UserLocalDataSourceImpl(
      sharedPreferences: sl(),
    ),
  );

  sl.registerLazySingleton<ApplicationLocalDataSource>(
    () => ApplicationLocalDataSourceImpl(
      sharedPreferences: sl(),
    ),
  );

  sl.registerLazySingleton<ApplicationTypeLocalDataSource>(
    () => ApplicationTypeLocalDataSourceImpl(
      sharedPreferences: sl(),
    ),
  );

  // Repositories
  sl.registerLazySingleton<HistoryRepository>(
    () => HistoryRepositoryImpl(
      remoteDataSource: sl<ApplicationRemoteDataSource>(),
      localDataSource: sl<ApplicationLocalDataSource>(),
    ),
  );

  sl.registerLazySingleton<NotificationRepository>(
    () => NotificationRepositoryImpl(),
  );

  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl<AuthRemoteDataSource>(),
      localDataSource: sl<UserLocalDataSource>(),
    ),
  );

  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(
      dio: sl<Dio>(),
      localDataSource: sl<UserLocalDataSource>(),
    ),
  );

  sl.registerLazySingleton<ApplicationRepository>(
    () => ApplicationRepositoryImpl(dio: sl<Dio>()),
  );

  sl.registerLazySingleton<ApplicationTypeRepository>(
    () => ApplicationTypeRepositoryImpl(
      dio: sl<Dio>(),
      localDataSource: sl<ApplicationTypeLocalDataSource>(),
    ),
  );

  // Use cases
  // Auth use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => ChangePasswordUseCase(sl()));

  // User use cases
  sl.registerLazySingleton(() => GetUserProfileUseCase(sl()));
  sl.registerLazySingleton(() => UpdateUserProfileUseCase(sl()));

  // Application use cases
  sl.registerLazySingleton(() => GetApplicationsUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserApplicationsUseCase(sl()));
  sl.registerLazySingleton(() => GetApplicationByIdUseCase(sl()));
  sl.registerLazySingleton(() => CreateApplicationUseCase(sl()));
  sl.registerLazySingleton(() => UpdateApplicationUseCase(sl()));
  sl.registerLazySingleton(() => SubmitApplicationUseCase(sl()));
  sl.registerLazySingleton(() => DeleteApplicationUseCase(sl()));

  // Application type use cases
  sl.registerLazySingleton(() => GetApplicationTypesUseCase(sl()));
  sl.registerLazySingleton(() => GetApplicationTypeByIdUseCase(sl()));
  sl.registerLazySingleton(() => GetSpecialApplicationTypesUseCase(sl()));
  sl.registerLazySingleton(() => GetAllSpecialApplicationTypesUseCase(sl()));

  // BLoCs
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      logoutUseCase: sl(),
      getCurrentUserUseCase: sl(),
      changePasswordUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => UserBloc(
      getUserProfileUseCase: sl(),
      updateUserProfileUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => ApplicationBloc(
      getApplicationsUseCase: sl(),
      getCurrentUserApplicationsUseCase: sl(),
      getApplicationByIdUseCase: sl(),
      createApplicationUseCase: sl(),
      updateApplicationUseCase: sl(),
      submitApplicationUseCase: sl(),
      deleteApplicationUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => ApplicationTypeBloc(
      getApplicationTypesUseCase: sl(),
      getApplicationTypeByIdUseCase: sl(),
      getSpecialApplicationTypesUseCase: sl(),
      getAllSpecialApplicationTypesUseCase: sl(),
    ),
  );

  sl.registerFactory(
    () => HistoryBloc(historyRepository: sl()),
  );

  sl.registerFactory(
    () => NotificationBloc(sl<NotificationRepository>()),
  );
}
