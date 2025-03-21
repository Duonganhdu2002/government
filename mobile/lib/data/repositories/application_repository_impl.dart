// ignore_for_file: empty_catches

import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
// ignore: depend_on_referenced_packages
import 'package:http_parser/http_parser.dart';

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
          } catch (e) {}
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

        // Kiểm tra nếu có tài liệu đính kèm nhưng chưa có chi tiết
        if (application.attachments.length == 1 &&
            application.attachments[0] == 'Có tài liệu đính kèm') {
          // Gọi API để lấy danh sách media files
          try {
            final mediaResponse = await dio.get(
              '${ApiConstants.baseUrl}/api/media-files/by-application/$id',
            );

            if (mediaResponse.statusCode == 200 && mediaResponse.data is List) {
              List<dynamic> mediaList = mediaResponse.data;
              List<String> actualAttachments = [];

              // Kiểm tra nếu có media files
              if (mediaList.isNotEmpty) {
                // In chi tiết cấu trúc dữ liệu của item đầu tiên để debug

                // Thêm mediafileid làm attachments
                for (var media in mediaList) {
                  if (media['mediafileid'] != null) {
                    actualAttachments.add(media['mediafileid'].toString());
                  }
                }

                // Tạo bản sao của application với danh sách attachments mới
                final updatedApplication =
                    (application as ApplicationModel).copyWith(
                  attachments: actualAttachments.isNotEmpty
                      ? actualAttachments
                      : application.attachments,
                );

                return Right(updatedApplication);
              }
            }
          } catch (mediaError) {
            // Tiếp tục với application ban đầu nếu không lấy được media files
          }
        }

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
      // Check if this is a submission with files (attachments are present)
      if (attachments.isNotEmpty) {
        return _createApplicationWithFiles(
          title: title,
          description: description,
          formData: formData,
          attachments: attachments,
        );
      }

      // Standard application creation without files
      final response = await dio.post(
        '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}',
        data: {
          'title': title,
          'description': description,
          'formData': formData,
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

  // Method to create application with files using the application-upload endpoint
  Future<Either<Failure, Application>> _createApplicationWithFiles({
    required String title,
    required String description,
    required Map<String, dynamic> formData,
    required List<String> attachments,
  }) async {
    try {
      // Create FormData object
      final dioFormData = FormData();

      // Add application data
      dioFormData.fields.add(MapEntry('title', title));
      dioFormData.fields.add(MapEntry('description', description));

      // Add application type ID
      if (formData.containsKey('applicationTypeId')) {
        dioFormData.fields.add(
          MapEntry(
              'applicationtypeid', formData['applicationTypeId'].toString()),
        );
      }

      // Add special application type ID if present
      if (formData.containsKey('specialApplicationTypeId') &&
          formData['specialApplicationTypeId'] != null) {
        dioFormData.fields.add(
          MapEntry('specialapplicationtypeid',
              formData['specialApplicationTypeId'].toString()),
        );
      }

      // Add event date if present
      if (formData.containsKey('eventDate')) {
        dioFormData.fields.add(
          MapEntry('eventdate', formData['eventDate']),
        );
      }

      // Add location if present
      if (formData.containsKey('location')) {
        dioFormData.fields.add(
          MapEntry('location', formData['location']),
        );
      }

      // For demo purposes, create mock files instead of real ones
      // In a production app, you would use real files
      for (var i = 0; i < attachments.length; i++) {
        // Creating a mock file with text content
        final mockFileData = 'This is a mock file for ${attachments[i]}';
        final mockFileName = 'mock_file_${i + 1}.txt';

        dioFormData.files.add(
          MapEntry(
            'files',
            MultipartFile.fromString(
              mockFileData,
              filename: mockFileName,
              contentType: MediaType('text', 'plain'),
            ),
          ),
        );
      }


      // Endpoint is application-upload
      final response = await dio.post(
        '${ApiConstants.baseUrl}${ApiConstants.applicationUploadEndpoint}',
        data: dioFormData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );


      if (response.statusCode == 201) {
        final Application application =
            ApplicationModel.fromJson(response.data['application']);
        return Right(application);
      } else {
        return Left(ServerFailure(
          message: response.data['message'] ??
              'Failed to create application with files',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      if (e.response != null) {
      }

      return Left(ServerFailure(
        message: e.response?.data?['message'] ??
            'Failed to create application with files',
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
