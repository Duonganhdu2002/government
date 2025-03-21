// ignore_for_file: empty_catches

import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
// ignore: depend_on_referenced_packages
import 'package:http_parser/http_parser.dart';
import 'dart:io';

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

      print('Creating application with files:');
      print('Title: $title');
      print('Description: $description');
      print('FormData: $formData');
      print('Attachments: $attachments');

      // Add application data
      dioFormData.fields.add(MapEntry('title', title));
      dioFormData.fields.add(MapEntry('description', description));

      // Add application type ID
      if (formData.containsKey('applicationTypeId')) {
        final String applicationTypeId =
            formData['applicationTypeId']?.toString() ?? '';
        if (applicationTypeId.isEmpty) {
          return Left(ServerFailure(
            message: 'Application type ID is required',
          ));
        }
        dioFormData.fields.add(
          MapEntry('applicationtypeid', applicationTypeId),
        );
        print('Added applicationtypeid: $applicationTypeId');
      } else {
        return Left(ServerFailure(
          message: 'Application type ID is required',
        ));
      }

      // Add special application type ID if present
      if (formData.containsKey('specialApplicationTypeId') &&
          formData['specialApplicationTypeId'] != null) {
        final String specialTypeId =
            formData['specialApplicationTypeId'].toString();
        dioFormData.fields.add(
          MapEntry('specialapplicationtypeid', specialTypeId),
        );
        print('Added specialapplicationtypeid: $specialTypeId');
      }

      // Add event date if present
      if (formData.containsKey('eventDate') && formData['eventDate'] != null) {
        final String eventDate = formData['eventDate'].toString();
        dioFormData.fields.add(
          MapEntry('eventdate', eventDate),
        );
        print('Added eventdate: $eventDate');
      }

      // Add location if present
      if (formData.containsKey('location') && formData['location'] != null) {
        final String location = formData['location'].toString();
        dioFormData.fields.add(
          MapEntry('location', location),
        );
        print('Added location: $location');
      }

      // Add province if present
      if (formData.containsKey('province') && formData['province'] != null) {
        final String province = formData['province'].toString();
        dioFormData.fields.add(
          MapEntry('province', province),
        );
        print('Added province: $province');
      }

      // Add district if present
      if (formData.containsKey('district') && formData['district'] != null) {
        final String district = formData['district'].toString();
        dioFormData.fields.add(
          MapEntry('district', district),
        );
        print('Added district: $district');
      }

      // Add ward if present
      if (formData.containsKey('ward') && formData['ward'] != null) {
        final String ward = formData['ward'].toString();
        dioFormData.fields.add(
          MapEntry('ward', ward),
        );
        print('Added ward: $ward');
      }

      // Add real files from paths
      for (var i = 0; i < attachments.length; i++) {
        final String path = attachments[i];
        final File file = File(path);

        if (await file.exists()) {
          final String fileName = path.split('/').last;
          final String fileExtension = fileName.split('.').last.toLowerCase();

          // Determine the content type based on file extension
          String contentType;
          String mediaType;

          if (['jpg', 'jpeg', 'png'].contains(fileExtension)) {
            contentType = 'image/$fileExtension';
            mediaType = 'image';
          } else if (['mp4', 'mov', 'avi'].contains(fileExtension)) {
            contentType = 'video/$fileExtension';
            mediaType = 'video';
          } else {
            contentType = 'application/octet-stream';
            mediaType = 'application';
          }

          print('Adding file: $fileName, type: $contentType');

          dioFormData.files.add(
            MapEntry(
              'files',
              await MultipartFile.fromFile(
                path,
                filename: fileName,
                contentType: MediaType.parse(contentType),
              ),
            ),
          );
        } else {
          print('File not found: $path');
        }
      }

      print(
          'Submitting application to: ${ApiConstants.baseUrl}${ApiConstants.applicationUploadEndpoint}');

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

      print('Response status: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 201) {
        print('Application created successfully');
        final Application application =
            ApplicationModel.fromJson(response.data['application']);
        return Right(application);
      } else {
        print('Error creating application: ${response.data}');
        return Left(ServerFailure(
          message: response.data['message'] ??
              'Failed to create application with files',
          code: response.statusCode,
        ));
      }
    } on DioException catch (e) {
      print('DioException: ${e.message}');
      if (e.response != null) {
        print('Response data: ${e.response?.data}');
        print('Response status: ${e.response?.statusCode}');
      }

      return Left(ServerFailure(
        message: e.response?.data?['message'] ??
            'Failed to create application with files',
        code: e.response?.statusCode,
      ));
    } catch (e) {
      print('Exception: $e');
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
