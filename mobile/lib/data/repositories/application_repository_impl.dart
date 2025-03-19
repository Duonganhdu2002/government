import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/utils/failure.dart';
import '../../domain/entities/application.dart';
import '../../domain/repositories/application_repository.dart';
import '../models/application_model.dart';

class ApplicationRepositoryImpl implements ApplicationRepository {
  final Dio dio;

  ApplicationRepositoryImpl({required this.dio});

  @override
  Future<Either<Failure, List<Application>>> getApplications() async {
    try {
      final response = await dio.get(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final List<Application> applications =
            data.map((item) => ApplicationModel.fromJson(item)).toList();
        return Right(applications);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to fetch applications',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to fetch applications',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Application>>>
      getCurrentUserApplications() async {
    try {
      final response = await dio.get(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/current-user',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;

        if (data.isEmpty) {
          return const Right([]);
        }

        final List<Application> applications = [];

        for (var item in data) {
          try {
            final application = ApplicationModel.fromServerJson(item);
            applications.add(application);
          } catch (e) {
            print('Error parsing application: $e');
            print('Problematic data: $item');
          }
        }

        return Right(applications);
      } else {
        return Left(ServerFailure(
          message:
              response.data['message'] ?? 'Failed to fetch user applications',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message:
            e.response?.data?['message'] ?? 'Failed to fetch user applications',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Application>> getApplicationById(String id) async {
    try {
      final response = await dio.get(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/$id',
      );

      if (response.statusCode == 200) {
        final Application application =
            ApplicationModel.fromServerJson(response.data);
        return Right(application);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to fetch application',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to fetch application',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Application>> createApplication({
    required String title,
    required String description,
    required Map<String, dynamic> formData,
    List<String> attachments = const [],
  }) async {
    try {
      final response = await dio.post(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}',
        data: {
          'title': title,
          'description': description,
          'formData': formData,
          'attachments': attachments,
        },
      );

      if (response.statusCode == 201) {
        final Application application =
            ApplicationModel.fromJson(response.data['application']);
        return Right(application);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to create application',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to create application',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Application>> updateApplication({
    required String id,
    String? title,
    String? description,
    Map<String, dynamic>? formData,
    List<String>? attachments,
  }) async {
    try {
      final Map<String, dynamic> data = {};
      if (title != null) data['title'] = title;
      if (description != null) data['description'] = description;
      if (formData != null) data['formData'] = formData;
      if (attachments != null) data['attachments'] = attachments;

      final response = await dio.put(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/$id',
        data: data,
      );

      if (response.statusCode == 200) {
        final Application application =
            ApplicationModel.fromJson(response.data['application']);
        return Right(application);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to update application',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to update application',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> submitApplication(String id) async {
    try {
      final response = await dio.post(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/$id/submit',
      );

      if (response.statusCode == 200) {
        return const Right(true);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to submit application',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to submit application',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> deleteApplication(String id) async {
    try {
      final response = await dio.delete(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/$id',
      );

      if (response.statusCode == 200) {
        return const Right(true);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ?? 'Failed to delete application',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to delete application',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
