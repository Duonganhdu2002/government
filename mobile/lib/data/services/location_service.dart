// ignore_for_file: depend_on_referenced_packages

import 'dart:convert';
import 'package:http/http.dart' as http;

// Models for location data
class Province {
  final String code;
  final String name;
  final String nameWithType;
  final String slug;
  final String type;

  Province({
    required this.code,
    required this.name,
    required this.nameWithType,
    required this.slug,
    required this.type,
  });

  factory Province.fromJson(Map<String, dynamic> json) {
    return Province(
      code: json['idProvince'] ?? json['code'] ?? '',
      name: json['name'] ?? '',
      nameWithType: json['name'] ?? '',
      slug: json['name']?.toLowerCase().replaceAll(RegExp(r'\s+'), '-') ?? '',
      type: json['type'] ?? 'province',
    );
  }
}

class District {
  final String code;
  final String name;
  final String nameWithType;
  final String parentCode;
  final String slug;
  final String type;

  District({
    required this.code,
    required this.name,
    required this.nameWithType,
    required this.parentCode,
    required this.slug,
    required this.type,
  });

  factory District.fromJson(Map<String, dynamic> json, String provinceCode) {
    return District(
      code: json['idDistrict'] ?? json['code'] ?? '',
      name: json['name'] ?? '',
      nameWithType: json['name'] ?? '',
      parentCode: json['idProvince'] ?? provinceCode,
      slug: json['name']?.toLowerCase().replaceAll(RegExp(r'\s+'), '-') ?? '',
      type: json['type'] ?? 'district',
    );
  }
}

class Ward {
  final String code;
  final String name;
  final String nameWithType;
  final String parentCode;
  final String slug;
  final String type;

  Ward({
    required this.code,
    required this.name,
    required this.nameWithType,
    required this.parentCode,
    required this.slug,
    required this.type,
  });

  factory Ward.fromJson(Map<String, dynamic> json, String districtCode) {
    return Ward(
      code: json['idCommune'] ?? json['code'] ?? '',
      name: json['name'] ?? '',
      nameWithType: json['name'] ?? '',
      parentCode: json['idDistrict'] ?? districtCode,
      slug: json['name']?.toLowerCase().replaceAll(RegExp(r'\s+'), '-') ?? '',
      type: json['type'] ?? 'ward',
    );
  }
}

class LocationService {
  static final LocationService _instance = LocationService._internal();

  factory LocationService() => _instance;

  LocationService._internal();

  static const String baseUrl =
      'https://vietnam-administrative-division-json-server-swart.vercel.app';

  // Headers for authentication if needed
  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        // Add auth headers if necessary
      };

  // Fetch all provinces
  Future<List<Province>> fetchProvinces() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/province'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Province.fromJson(item)).toList();
      } else {
        throw Exception('Failed to fetch provinces: ${response.statusCode}');
      }
    } catch (e) {
      return [];
    }
  }

  // Fetch districts by province code
  Future<List<District>> fetchDistrictsByProvince(String provinceCode) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/district/?idProvince=$provinceCode'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data
            .map((item) => District.fromJson(item, provinceCode))
            .toList();
      } else {
        throw Exception('Failed to fetch districts: ${response.statusCode}');
      }
    } catch (e) {
      return [];
    }
  }

  // Fetch wards by district code
  Future<List<Ward>> fetchWardsByDistrict(String districtCode) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/commune/?idDistrict=$districtCode'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Ward.fromJson(item, districtCode)).toList();
      } else {
        throw Exception('Failed to fetch wards: ${response.statusCode}');
      }
    } catch (e) {
      return [];
    }
  }
}
