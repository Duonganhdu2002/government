import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../core/utils/failure.dart';
import '../models/user_model.dart';

abstract class UserLocalDataSource {
  Future<UserModel?> getUser();
  Future<void> cacheUser(UserModel user);
  Future<void> clearUser();
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final SharedPreferences sharedPreferences;

  UserLocalDataSourceImpl({required this.sharedPreferences});

  @override
  Future<UserModel?> getUser() async {
    try {
      final jsonString = sharedPreferences.getString('user');
      if (jsonString == null) {
        return null;
      }
      return UserModel.fromJson(json.decode(jsonString));
    } catch (e) {
      throw const CacheFailure(message: 'Failed to retrieve user from cache');
    }
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    try {
      await sharedPreferences.setString(
        'user',
        json.encode(user.toJson()),
      );
    } catch (e) {
      throw const CacheFailure(message: 'Failed to cache user');
    }
  }

  @override
  Future<void> clearUser() async {
    try {
      await sharedPreferences.remove('user');
    } catch (e) {
      throw const CacheFailure(message: 'Failed to clear user from cache');
    }
  }
}
