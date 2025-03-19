import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../utils/dio_utils.dart';

class ApiService {
  final Dio _dio;
  final SharedPreferences _preferences;

  ApiService(this._preferences) : _dio = DioUtils.getInstance();

  // Generic GET request
  Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic POST request
  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic PUT request
  Future<Map<String, dynamic>> put(String path, {dynamic data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Generic DELETE request
  Future<Map<String, dynamic>> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Error handling
  void _handleError(DioException e) {
    // Proper logging with dart:developer
    developer.log('API Error: ${e.message}', name: 'ApiService');
    developer.log('API Error Response: ${e.response?.data}',
        name: 'ApiService');
  }

  Dio get dio => _dio;
}
