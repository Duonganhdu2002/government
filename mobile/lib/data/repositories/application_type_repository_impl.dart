import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/utils/failure.dart';
import '../../domain/entities/application_type.dart';
import '../../domain/entities/special_application_type.dart';
import '../../domain/repositories/application_type_repository.dart';
import '../datasources/application_type_local_data_source.dart';
import '../models/application_type_model.dart';
import '../models/special_application_type_model.dart';

class ApplicationTypeRepositoryImpl implements ApplicationTypeRepository {
  final Dio dio;
  final ApplicationTypeLocalDataSource localDataSource;

  // Cache timestamps to avoid frequent API calls
  static DateTime? _lastApplicationTypesFetch;
  static DateTime? _lastSpecialTypesFetch;
  static const Duration _cacheMaxAge =
      Duration(hours: 1); // Cache valid for 1 hour

  ApplicationTypeRepositoryImpl({
    required this.dio,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<ApplicationType>>> getApplicationTypes() async {
    try {
      // Check if cache is still valid (not older than 1 hour)
      final now = DateTime.now();
      final isCacheValid = _lastApplicationTypesFetch != null &&
          now.difference(_lastApplicationTypesFetch!) < _cacheMaxAge;

      // Try to get data from cache first if cache is still valid
      if (isCacheValid) {
        final cachedTypes = await localDataSource.getLastApplicationTypes();
        if (cachedTypes.isNotEmpty) {
          print(
              '[ApplicationTypeRepositoryImpl] Using ${cachedTypes.length} recently cached application types');
          return Right(cachedTypes);
        }
      }

      // If no valid cached data, fetch from API
      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/application-types',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        print(
            '[ApplicationTypeRepositoryImpl] Received ${data.length} application types from API');

        final List<ApplicationTypeModel> applicationTypes =
            data.map((item) => ApplicationTypeModel.fromJson(item)).toList();

        // Cache the data and update timestamp
        await localDataSource.cacheApplicationTypes(applicationTypes);
        _lastApplicationTypesFetch = DateTime.now();

        return Right(applicationTypes);
      } else {
        return Left(ServerFailure(
          message:
              response.data['message'] ?? 'Failed to fetch application types',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      print('[ApplicationTypeRepositoryImpl] DioException: ${e.message}');

      // Try to use cached data in case of network error
      final cachedTypes = await localDataSource.getLastApplicationTypes();
      if (cachedTypes.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using ${cachedTypes.length} cached application types as fallback');
        return Right(cachedTypes);
      }

      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Failed to fetch application types',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      print('[ApplicationTypeRepositoryImpl] Exception: $e');

      // Try to use cached data in case of error
      final cachedTypes = await localDataSource.getLastApplicationTypes();
      if (cachedTypes.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using ${cachedTypes.length} cached application types as fallback');
        return Right(cachedTypes);
      }

      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationType>> getApplicationTypeById(
      int id) async {
    try {
      // Try to get from cache first
      final cachedTypes = await localDataSource.getLastApplicationTypes();
      final cachedType = cachedTypes.where((type) => type.id == id).firstOrNull;
      if (cachedType != null) {
        print(
            '[ApplicationTypeRepositoryImpl] Using cached application type for id: $id');
        return Right(cachedType);
      }

      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/application-types/$id',
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = response.data;
        final ApplicationType applicationType =
            ApplicationTypeModel.fromJson(data);
        return Right(applicationType);
      } else {
        return Left(ServerFailure(
          message:
              response.data['message'] ?? 'Failed to fetch application type',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      // Try to get from cache as fallback
      final cachedTypes = await localDataSource.getLastApplicationTypes();
      final cachedType = cachedTypes.where((type) => type.id == id).firstOrNull;
      if (cachedType != null) {
        print(
            '[ApplicationTypeRepositoryImpl] Using cached application type as fallback for id: $id');
        return Right(cachedType);
      }

      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Failed to fetch application type',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      // Try to get from cache as fallback
      final cachedTypes = await localDataSource.getLastApplicationTypes();
      final cachedType = cachedTypes.where((type) => type.id == id).firstOrNull;
      if (cachedType != null) {
        print(
            '[ApplicationTypeRepositoryImpl] Using cached application type as fallback for id: $id');
        return Right(cachedType);
      }

      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<SpecialApplicationType>>>
      getSpecialApplicationTypes(int applicationTypeId) async {
    try {
      // Check if cache is still valid (not older than 1 hour)
      final now = DateTime.now();
      final isCacheValid = _lastSpecialTypesFetch != null &&
          now.difference(_lastSpecialTypesFetch!) < _cacheMaxAge;

      // Try to get from cache first if cache is still valid
      if (isCacheValid) {
        final cachedSpecialTypes =
            await localDataSource.getSpecialApplicationTypes(applicationTypeId);
        if (cachedSpecialTypes.isNotEmpty) {
          print(
              '[ApplicationTypeRepositoryImpl] Using ${cachedSpecialTypes.length} recently cached special types for type: $applicationTypeId');
          return Right(cachedSpecialTypes);
        }
      }

      // If no valid cached data, fetch from API
      print(
          '[ApplicationTypeRepositoryImpl] Fetching special types from API for applicationTypeId: $applicationTypeId');
      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/special-application-types/by-application-type/$applicationTypeId',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        print(
            '[ApplicationTypeRepositoryImpl] Received ${data.length} special types from API');

        final List<SpecialApplicationType> specialTypes = data
            .map((item) => SpecialApplicationTypeModel.fromJson(item))
            .toList();

        // Cache the special types and update timestamp
        await localDataSource.cacheSpecialApplicationTypes(
            applicationTypeId, specialTypes);
        _lastSpecialTypesFetch = DateTime.now();

        return Right(specialTypes);
      } else if (response.statusCode == 404) {
        // 404 is normal for no special types
        // Cache empty list to avoid future unnecessary requests
        print(
            '[ApplicationTypeRepositoryImpl] No special types found (404) for applicationTypeId: $applicationTypeId');
        await localDataSource
            .cacheSpecialApplicationTypes(applicationTypeId, []);
        return const Right([]);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ??
              'Failed to fetch special application types',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // 404 is normal for no special types
        // Cache empty list to avoid future unnecessary requests
        await localDataSource
            .cacheSpecialApplicationTypes(applicationTypeId, []);
        return const Right([]);
      }

      // Try to use cached data in case of network error
      final cachedSpecialTypes =
          await localDataSource.getSpecialApplicationTypes(applicationTypeId);
      if (cachedSpecialTypes.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using ${cachedSpecialTypes.length} cached special types as fallback');
        return Right(cachedSpecialTypes);
      }

      return Left(ServerFailure(
        message: e.response?.data?['message'] ??
            'Failed to fetch special application types',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      // Try to use cached data in case of error
      final cachedSpecialTypes =
          await localDataSource.getSpecialApplicationTypes(applicationTypeId);
      if (cachedSpecialTypes.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using ${cachedSpecialTypes.length} cached special types as fallback');
        return Right(cachedSpecialTypes);
      }

      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<int, List<SpecialApplicationType>>>>
      getAllSpecialApplicationTypes() async {
    try {
      // Try to get all cached special types first
      final cachedSpecialTypesMap =
          await localDataSource.getAllCachedSpecialApplicationTypes();
      if (cachedSpecialTypesMap.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using cached special types for ${cachedSpecialTypesMap.length} application types');
        return Right(cachedSpecialTypesMap);
      }

      // If no cached data, we need to get all application types first
      final applicationTypesResult = await getApplicationTypes();

      return applicationTypesResult.fold(
        (failure) => Left(failure),
        (applicationTypes) async {
          final Map<int, List<SpecialApplicationType>> allSpecialTypes = {};

          // For each application type, get its special types
          for (final type in applicationTypes) {
            final specialTypesResult =
                await getSpecialApplicationTypes(type.id);

            specialTypesResult.fold(
              (failure) {
                print(
                    '[ApplicationTypeRepositoryImpl] Failed to fetch special types for ${type.name}: ${failure.message}');
                allSpecialTypes[type.id] = [];
              },
              (specialTypes) {
                allSpecialTypes[type.id] = specialTypes;
              },
            );
          }

          return Right(allSpecialTypes);
        },
      );
    } catch (e) {
      // In case of any error, try to get cached data
      final cachedSpecialTypesMap =
          await localDataSource.getAllCachedSpecialApplicationTypes();
      if (cachedSpecialTypesMap.isNotEmpty) {
        print(
            '[ApplicationTypeRepositoryImpl] Using cached special types as fallback');
        return Right(cachedSpecialTypesMap);
      }

      return Left(ServerFailure(message: e.toString()));
    }
  }
}
