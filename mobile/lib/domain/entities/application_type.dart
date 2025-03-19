import 'package:equatable/equatable.dart';

class ProcessingTimeRange extends Equatable {
  final int min;
  final int max;

  const ProcessingTimeRange({
    required this.min,
    required this.max,
  });

  @override
  List<Object?> get props => [min, max];
}

class ApplicationType extends Equatable {
  final int id;
  final String name;
  final String description;
  final int processingTimeLimit;
  final String? category;
  final ProcessingTimeRange? processingTimeRange;

  const ApplicationType({
    required this.id,
    required this.name,
    required this.description,
    required this.processingTimeLimit,
    this.category,
    this.processingTimeRange,
  });

  ApplicationType copyWith({
    int? id,
    String? name,
    String? description,
    int? processingTimeLimit,
    String? category,
    ProcessingTimeRange? processingTimeRange,
  }) {
    return ApplicationType(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      processingTimeLimit: processingTimeLimit ?? this.processingTimeLimit,
      category: category ?? this.category,
      processingTimeRange: processingTimeRange ?? this.processingTimeRange,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        processingTimeLimit,
        category,
        processingTimeRange,
      ];
}

// Enum for application categories (matching web app)
enum ApplicationCategory {
  personal,
  legal,
  property,
  business,
  social,
  other,
}

// Extension to provide human-readable names for categories
extension ApplicationCategoryExtension on ApplicationCategory {
  String get displayName {
    switch (this) {
      case ApplicationCategory.personal:
        return 'Hồ sơ cá nhân';
      case ApplicationCategory.legal:
        return 'Pháp lý & Tư pháp';
      case ApplicationCategory.property:
        return 'Nhà đất & Tài sản';
      case ApplicationCategory.business:
        return 'Doanh nghiệp & Kinh doanh';
      case ApplicationCategory.social:
        return 'Xã hội & Cộng đồng';
      case ApplicationCategory.other:
        return 'Loại hồ sơ khác';
    }
  }
}

// Helper function to assign a category based on type name (similar to web app)
ApplicationCategory assignCategoryToType(ApplicationType type) {
  if (type.category != null) {
    try {
      return ApplicationCategory.values.firstWhere(
        (e) => e.name.toUpperCase() == type.category!.toUpperCase(),
      );
    } catch (_) {}
  }

  final typeName = type.name.toLowerCase();

  if (typeName.contains('khai sinh') ||
      typeName.contains('kết hôn') ||
      typeName.contains('căn cước') ||
      typeName.contains('hộ khẩu') ||
      typeName.contains('thường trú')) {
    return ApplicationCategory.personal;
  }

  if (typeName.contains('giấy phép') ||
      typeName.contains('xây dựng') ||
      typeName.contains('nhà đất') ||
      typeName.contains('tài sản')) {
    return ApplicationCategory.property;
  }

  if (typeName.contains('doanh nghiệp') ||
      typeName.contains('kinh doanh') ||
      typeName.contains('thuế')) {
    return ApplicationCategory.business;
  }

  if (typeName.contains('pháp lý') ||
      typeName.contains('tư pháp') ||
      typeName.contains('luật')) {
    return ApplicationCategory.legal;
  }

  if (typeName.contains('xã hội') ||
      typeName.contains('cộng đồng') ||
      typeName.contains('sự kiện')) {
    return ApplicationCategory.social;
  }

  return ApplicationCategory.other;
}
