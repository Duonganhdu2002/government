import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/api_constants.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/failure.dart';
import '../../domain/entities/application.dart';
import '../models/application_model.dart';

abstract class ApplicationRemoteDataSource {
  Future<List<Application>> getApplications();
  Future<List<Application>> getCurrentUserApplications();
  Future<Application> getApplicationById(String id);
  Future<Application> createApplication({
    required String title,
    required String description,
    required Map<String, dynamic> formData,
    List<String> attachments = const [],
  });
  Future<Application> updateApplication({
    required String id,
    String? title,
    String? description,
    Map<String, dynamic>? formData,
    List<String>? attachments,
  });
  Future<bool> submitApplication(String id);
  Future<bool> deleteApplication(String id);
}

class ApplicationRemoteDataSourceImpl implements ApplicationRemoteDataSource {
  final Dio dio;
  final SharedPreferences sharedPreferences;

  ApplicationRemoteDataSourceImpl({
    required this.dio,
    required this.sharedPreferences,
  });

  @override
  Future<List<Application>> getApplications() async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.get(
        ApiConstants.applicationsEndpoint,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> applicationsJson;

        if (data['data'] != null && data['data'] is List) {
          applicationsJson = data['data'];
        } else if (data is List) {
          applicationsJson = data;
        } else {
          applicationsJson = [];
        }

        return applicationsJson
            .map((json) => ApplicationModel.fromJson(json))
            .toList();
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể tải danh sách hồ sơ',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<List<Application>> getCurrentUserApplications() async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.get(
        ApiConstants.userApplicationsEndpoint,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> applicationsJson;

        if (data['data'] != null && data['data'] is List) {
          applicationsJson = data['data'];
        } else if (data is List) {
          applicationsJson = data;
        } else {
          applicationsJson = [];
        }

        return applicationsJson
            .map((json) => ApplicationModel.fromJson(json))
            .toList();
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể tải hồ sơ của bạn',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<Application> getApplicationById(String id) async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.get(
        '${ApiConstants.applicationsEndpoint}/$id',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        Map<String, dynamic> applicationJson;

        if (data['data'] != null) {
          applicationJson = data['data'];
        } else {
          applicationJson = data;
        }

        return ApplicationModel.fromJson(applicationJson);
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể tải thông tin hồ sơ',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<Application> createApplication({
    required String title,
    required String description,
    required Map<String, dynamic> formData,
    List<String> attachments = const [],
  }) async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.post(
        ApiConstants.applicationsEndpoint,
        data: {
          'title': title,
          'description': description,
          'formData': formData,
          'attachments': attachments,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        Map<String, dynamic> applicationJson;

        if (data['data'] != null) {
          applicationJson = data['data'];
        } else {
          applicationJson = data;
        }

        return ApplicationModel.fromJson(applicationJson);
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể tạo hồ sơ mới',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<Application> updateApplication({
    required String id,
    String? title,
    String? description,
    Map<String, dynamic>? formData,
    List<String>? attachments,
  }) async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      // Prepare the data, only include non-null values
      final Map<String, dynamic> data = {};
      if (title != null) data['title'] = title;
      if (description != null) data['description'] = description;
      if (formData != null) data['formData'] = formData;
      if (attachments != null) data['attachments'] = attachments;

      final response = await dio.put(
        '${ApiConstants.applicationsEndpoint}/$id',
        data: data,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        Map<String, dynamic> applicationJson;

        if (data['data'] != null) {
          applicationJson = data['data'];
        } else {
          applicationJson = data;
        }

        return ApplicationModel.fromJson(applicationJson);
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể cập nhật hồ sơ',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<bool> submitApplication(String id) async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.post(
        '${ApiConstants.applicationsEndpoint}/$id/submit',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể nộp hồ sơ',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }

  @override
  Future<bool> deleteApplication(String id) async {
    try {
      final String? token = sharedPreferences.getString(AppConstants.tokenKey);

      if (token == null) {
        throw const ServerFailure(
            message: 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await dio.delete(
        '${ApiConstants.applicationsEndpoint}/$id',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        throw ServerFailure(
          message: response.data['message'] ?? 'Không thể xóa hồ sơ',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(
        message: e.response?.data?['message'] ?? 'Kết nối đến server thất bại',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerFailure(message: e.toString());
    }
  }
}
