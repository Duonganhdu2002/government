import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/application_type.dart';
import '../../domain/entities/special_application_type.dart';
import '../models/application_type_model.dart';
import '../models/special_application_type_model.dart';

abstract class ApplicationTypeLocalDataSource {
  Future<bool> cacheApplicationTypes(List<ApplicationType> applicationTypes);
  Future<List<ApplicationType>> getLastApplicationTypes();

  Future<bool> cacheSpecialApplicationTypes(
      int applicationTypeId, List<SpecialApplicationType> specialTypes);
  Future<Map<int, List<SpecialApplicationType>>>
      getAllCachedSpecialApplicationTypes();
  Future<List<SpecialApplicationType>> getSpecialApplicationTypes(
      int applicationTypeId);

  Future<bool> clearCache();
}

class ApplicationTypeLocalDataSourceImpl
    implements ApplicationTypeLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const String APPLICATION_TYPES_KEY = 'cached_application_types';
  static const String SPECIAL_TYPES_PREFIX = 'cached_special_types_';
  static const String ALL_SPECIAL_TYPES_IDS_KEY = 'all_special_types_ids';

  const ApplicationTypeLocalDataSourceImpl({
    required this.sharedPreferences,
  });

  @override
  Future<bool> cacheApplicationTypes(
      List<ApplicationType> applicationTypes) async {
    final List<Map<String, dynamic>> jsonList = applicationTypes
        .map((type) => (type as ApplicationTypeModel).toJson())
        .toList();
    return await sharedPreferences.setString(
      APPLICATION_TYPES_KEY,
      jsonEncode(jsonList),
    );
  }

  @override
  Future<List<ApplicationType>> getLastApplicationTypes() async {
    final jsonString = sharedPreferences.getString(APPLICATION_TYPES_KEY);
    if (jsonString != null) {
      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList
          .map((json) => ApplicationTypeModel.fromJson(json))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> cacheSpecialApplicationTypes(
      int applicationTypeId, List<SpecialApplicationType> specialTypes) async {
    final String key = '$SPECIAL_TYPES_PREFIX$applicationTypeId';
    final List<Map<String, dynamic>> jsonList = specialTypes
        .map((type) => (type as SpecialApplicationTypeModel).toJson())
        .toList();

    // Store the ids of all application types that have special types
    final currentIds =
        sharedPreferences.getStringList(ALL_SPECIAL_TYPES_IDS_KEY) ?? [];
    if (!currentIds.contains(applicationTypeId.toString())) {
      final newIds = [...currentIds, applicationTypeId.toString()];
      await sharedPreferences.setStringList(ALL_SPECIAL_TYPES_IDS_KEY, newIds);
    }

    return await sharedPreferences.setString(
      key,
      jsonEncode(jsonList),
    );
  }

  @override
  Future<Map<int, List<SpecialApplicationType>>>
      getAllCachedSpecialApplicationTypes() async {
    final idsString =
        sharedPreferences.getStringList(ALL_SPECIAL_TYPES_IDS_KEY);
    if (idsString == null || idsString.isEmpty) {
      return {};
    }

    final Map<int, List<SpecialApplicationType>> result = {};
    for (final idString in idsString) {
      final id = int.parse(idString);
      final specialTypes = await getSpecialApplicationTypes(id);
      result[id] = specialTypes;
    }

    return result;
  }

  @override
  Future<List<SpecialApplicationType>> getSpecialApplicationTypes(
      int applicationTypeId) async {
    final String key = '$SPECIAL_TYPES_PREFIX$applicationTypeId';
    final jsonString = sharedPreferences.getString(key);
    if (jsonString != null) {
      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList
          .map((json) => SpecialApplicationTypeModel.fromJson(json))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> clearCache() async {
    final result1 = await sharedPreferences.remove(APPLICATION_TYPES_KEY);

    // Clear all special types caches
    final idsString =
        sharedPreferences.getStringList(ALL_SPECIAL_TYPES_IDS_KEY);
    if (idsString != null) {
      for (final idString in idsString) {
        final id = int.parse(idString);
        await sharedPreferences.remove('$SPECIAL_TYPES_PREFIX$id');
      }
    }

    final result2 = await sharedPreferences.remove(ALL_SPECIAL_TYPES_IDS_KEY);

    return result1 && result2;
  }
}
