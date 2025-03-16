import 'package:equatable/equatable.dart';

class User extends Equatable {
  final int id;
  final String username;
  final String? fullName;
  final String? identificationNumber;
  final String? address;
  final String? phoneNumber;
  final String? email;
  final String? avatarUrl;
  final int? areaCode;
  final DateTime? createdAt;
  final DateTime? lastLoginAt;

  const User({
    required this.id,
    required this.username,
    this.fullName,
    this.identificationNumber,
    this.address,
    this.phoneNumber,
    this.email,
    this.avatarUrl,
    this.areaCode,
    this.createdAt,
    this.lastLoginAt,
  });

  String get displayName {
    if (fullName != null && fullName!.isNotEmpty) {
      return fullName!;
    } else {
      return username;
    }
  }

  String get initials {
    if (fullName != null && fullName!.isNotEmpty) {
      final parts = fullName!.split(' ');
      if (parts.length > 1) {
        return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
      } else if (parts.isNotEmpty && parts.first.isNotEmpty) {
        return parts.first[0].toUpperCase();
      }
    }

    if (username.isNotEmpty) {
      return username[0].toUpperCase();
    }

    return 'U';
  }

  User copyWith({
    int? id,
    String? username,
    String? fullName,
    String? identificationNumber,
    String? address,
    String? phoneNumber,
    String? email,
    String? avatarUrl,
    int? areaCode,
    DateTime? createdAt,
    DateTime? lastLoginAt,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      identificationNumber: identificationNumber ?? this.identificationNumber,
      address: address ?? this.address,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      areaCode: areaCode ?? this.areaCode,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        username,
        fullName,
        identificationNumber,
        address,
        phoneNumber,
        email,
        avatarUrl,
        areaCode,
        createdAt,
        lastLoginAt,
      ];
}
