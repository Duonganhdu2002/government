import '../../domain/entities/special_application_type.dart';

class SpecialApplicationTypeModel extends SpecialApplicationType {
  const SpecialApplicationTypeModel({
    required super.id,
    required super.applicationTypeId,
    required super.name,
    required super.processingTimeLimit,
    super.applicationTypeName,
  });

  factory SpecialApplicationTypeModel.fromJson(Map<String, dynamic> json) {
    return SpecialApplicationTypeModel(
      id: json['specialapplicationtypeid'],
      applicationTypeId: json['applicationtypeid'],
      name: json['typename'] ?? 'Unknown',
      processingTimeLimit: json['processingtimelimit'] ?? 0,
      applicationTypeName: json['applicationtypename'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'specialapplicationtypeid': id,
      'applicationtypeid': applicationTypeId,
      'typename': name,
      'processingtimelimit': processingTimeLimit,
      'applicationtypename': applicationTypeName,
    };
  }
}
