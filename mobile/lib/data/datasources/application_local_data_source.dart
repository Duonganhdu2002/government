import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/utils/failure.dart';
import '../../domain/entities/application.dart';
import '../models/application_model.dart';

abstract class ApplicationLocalDataSource {
  Future<List<Application>> getCachedApplications();
  Future<Application> getCachedApplicationById(String id);
  Future<void> cacheApplications(List<ApplicationModel> applications);
  Future<void> cacheApplication(ApplicationModel application);
  Future<void> clearCachedApplications();
}

class ApplicationLocalDataSourceImpl implements ApplicationLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const String applicationsCache = 'cached_applications';

  ApplicationLocalDataSourceImpl({required this.sharedPreferences});

  @override
  Future<List<Application>> getCachedApplications() async {
    try {
      final jsonString = sharedPreferences.getString(applicationsCache);
      if (jsonString == null) {
        return [];
      }

      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList.map((json) => ApplicationModel.fromJson(json)).toList();
    } catch (e) {
      throw const CacheFailure(
          message: 'Không thể đọc dữ liệu hồ sơ từ bộ nhớ cache');
    }
  }

  @override
  Future<Application> getCachedApplicationById(String id) async {
    try {
      final applications = await getCachedApplications();
      final application = applications.firstWhere(
        (app) => app.id == id,
        orElse: () => throw const CacheFailure(
            message: 'Không tìm thấy hồ sơ trong bộ nhớ cache'),
      );
      return application;
    } catch (e) {
      throw const CacheFailure(
          message: 'Không tìm thấy hồ sơ trong bộ nhớ cache');
    }
  }

  @override
  Future<void> cacheApplications(List<ApplicationModel> applications) async {
    try {
      final List<Map<String, dynamic>> jsonList =
          applications.map((app) => app.toJson()).toList();
      await sharedPreferences.setString(
        applicationsCache,
        jsonEncode(jsonList),
      );
    } catch (e) {
      throw const CacheFailure(message: 'Không thể lưu hồ sơ vào bộ nhớ cache');
    }
  }

  @override
  Future<void> cacheApplication(ApplicationModel application) async {
    try {
      final List<Application> existingApplications =
          await getCachedApplications();

      // Check if the application already exists
      final index =
          existingApplications.indexWhere((app) => app.id == application.id);

      List<ApplicationModel> updatedApplications = [];

      // Convert all existing applications to ApplicationModel
      for (var app in existingApplications) {
        if (app is ApplicationModel) {
          updatedApplications.add(app);
        } else {
          updatedApplications.add(ApplicationModel.fromEntity(app));
        }
      }

      if (index >= 0) {
        // Replace the existing application
        updatedApplications[index] = application;
      } else {
        // Add the new application
        updatedApplications.add(application);
      }

      await cacheApplications(updatedApplications);
    } catch (e) {
      throw const CacheFailure(message: 'Không thể lưu hồ sơ vào bộ nhớ cache');
    }
  }

  @override
  Future<void> clearCachedApplications() async {
    try {
      await sharedPreferences.remove(applicationsCache);
    } catch (e) {
      throw const CacheFailure(
          message: 'Không thể xóa hồ sơ khỏi bộ nhớ cache');
    }
  }
}
