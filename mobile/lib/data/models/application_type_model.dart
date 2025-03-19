import '../../domain/entities/application_type.dart';

class ApplicationTypeModel extends ApplicationType {
  const ApplicationTypeModel({
    required super.id,
    required super.name,
    required super.description,
    required super.processingTimeLimit,
    super.category,
    super.processingTimeRange,
  });

  factory ApplicationTypeModel.fromJson(Map<String, dynamic> json) {
    // Handle processing time range if present in the JSON
    ProcessingTimeRange? processingTimeRange;
    if (json['processingTimeRange'] != null) {
      processingTimeRange = ProcessingTimeRange(
        min: json['processingTimeRange']['min'] ??
            json['processingtimelimit'] ??
            0,
        max: json['processingTimeRange']['max'] ??
            json['processingtimelimit'] ??
            0,
      );
    }

    return ApplicationTypeModel(
      id: json['applicationtypeid'],
      name: json['typename'] ?? 'Unknown',
      description: json['description'] ?? '',
      processingTimeLimit: json['processingtimelimit'] ?? 0,
      category: json['category'],
      processingTimeRange: processingTimeRange,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'applicationtypeid': id,
      'typename': name,
      'description': description,
      'processingtimelimit': processingTimeLimit,
      'category': category,
    };

    if (processingTimeRange != null) {
      data['processingTimeRange'] = {
        'min': processingTimeRange!.min,
        'max': processingTimeRange!.max,
      };
    }

    return data;
  }
}
