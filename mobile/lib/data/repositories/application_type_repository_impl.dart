import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/utils/failure.dart';
import '../../domain/entities/application_type.dart';
import '../../domain/entities/special_application_type.dart';
import '../../domain/repositories/application_type_repository.dart';
import '../models/application_type_model.dart';
import '../models/special_application_type_model.dart';

class ApplicationTypeRepositoryImpl implements ApplicationTypeRepository {
  final Dio dio;

  ApplicationTypeRepositoryImpl({required this.dio});

  @override
  Future<Either<Failure, List<ApplicationType>>> getApplicationTypes() async {
    try {
      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/application-types',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        print(
            '[ApplicationTypeRepositoryImpl] Received ${data.length} application types');

        // Process each application type to include processing time range like in web app
        final List<ApplicationType> applicationTypes = await Future.wait(
          data.map((item) async {
            final ApplicationTypeModel baseType =
                ApplicationTypeModel.fromJson(item);

            // Try to fetch special application types for each application type
            try {
              final specialTypes =
                  await getSpecialApplicationTypes(baseType.id);

              // If no special types or error, return the base type with same min/max
              if (specialTypes.isLeft() ||
                  specialTypes.getOrElse(() => []).isEmpty) {
                return baseType.copyWith(
                  processingTimeRange: ProcessingTimeRange(
                    min: baseType.processingTimeLimit,
                    max: baseType.processingTimeLimit,
                  ),
                );
              }

              // If we have special types, calculate min/max processing time
              final specialTypesList = specialTypes.getOrElse(() => []);
              final processingTimes = specialTypesList
                  .map((st) => st.processingTimeLimit)
                  .toList()
                ..add(baseType.processingTimeLimit);

              final min = processingTimes.reduce((a, b) => a < b ? a : b);
              final max = processingTimes.reduce((a, b) => a > b ? a : b);

              return baseType.copyWith(
                processingTimeRange: ProcessingTimeRange(
                  min: min,
                  max: max,
                ),
              );
            } catch (e) {
              print(
                  '[ApplicationTypeRepositoryImpl] Error fetching special types: $e');
              return baseType.copyWith(
                processingTimeRange: ProcessingTimeRange(
                  min: baseType.processingTimeLimit,
                  max: baseType.processingTimeLimit,
                ),
              );
            }
          }),
        );

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
      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Failed to fetch application types',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      print('[ApplicationTypeRepositoryImpl] Exception: $e');
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationType>> getApplicationTypeById(
      int id) async {
    try {
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
      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Failed to fetch application type',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<SpecialApplicationType>>>
      getSpecialApplicationTypes(int applicationTypeId) async {
    try {
      final response = await dio.get(
        '${ApiConstants.baseUrl}/api/special-application-types/by-application-type/$applicationTypeId',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;

        final List<SpecialApplicationType> specialTypes = data
            .map((item) => SpecialApplicationTypeModel.fromJson(item))
            .toList();

        return Right(specialTypes);
      } else if (response.statusCode == 404) {
        // 404 is normal for no special types
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
        return const Right([]);
      }

      return Left(ServerFailure(
        message: e.response?.data?['message'] ??
            'Failed to fetch special application types',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
