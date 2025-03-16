import '../../domain/entities/user.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.username,
    super.fullName,
    super.identificationNumber,
    super.address,
    super.phoneNumber,
    super.email,
    super.avatarUrl,
    super.areaCode,
    super.createdAt,
    super.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is String ? int.parse(json['id']) : (json['id'] ?? 0),
      username: json['username'] ?? '',
      fullName: json['fullname'] ?? json['name'] ?? json['fullName'] ?? '',
      identificationNumber:
          json['identificationnumber'] ?? json['identificationNumber'] ?? '',
      address: json['address'] ?? '',
      phoneNumber: json['phonenumber'] ?? json['phoneNumber'] ?? '',
      email: json['email'] ?? '',
      avatarUrl:
          json['imagelink'] ?? json['avatarUrl'] ?? json['imageLink'] ?? '',
      areaCode: json['areacode'] is String
          ? int.parse(json['areacode'])
          : (json['areacode'] ?? json['areaCode'] ?? 1),
      createdAt:
          json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      lastLoginAt: json['lastLoginAt'] != null
          ? DateTime.parse(json['lastLoginAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullname': fullName,
      'identificationnumber': identificationNumber,
      'address': address,
      'phonenumber': phoneNumber,
      'email': email,
      'imagelink': avatarUrl,
      'areacode': areaCode,
      'createdAt': createdAt?.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  @override
  UserModel copyWith({
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
    return UserModel(
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
}
