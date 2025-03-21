// ignore_for_file: empty_catches

import '../../domain/entities/application.dart';

class ApplicationModel extends Application {
  const ApplicationModel({
    required super.id,
    required super.title,
    required super.description,
    required super.createdAt,
    required super.updatedAt,
    super.submittedAt,
    required super.status,
    required super.formData,
    super.attachments = const [],
    super.referenceNumber,
    required super.userId,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    // Parse the status
    final ApplicationStatus status = _parseStatus(json['status']);

    // Parse dates
    final DateTime createdAt = _parseDate(json['createdAt']);
    final DateTime updatedAt =
        json['updatedAt'] != null ? _parseDate(json['updatedAt']) : createdAt;
    final DateTime? submittedAt =
        json['submittedAt'] != null ? _parseDate(json['submittedAt']) : null;

    // Parse formData, with fallback to empty map
    Map<String, dynamic> formData = {};
    if (json['formData'] != null) {
      if (json['formData'] is String) {
        try {
          formData = Map<String, dynamic>.from(json['formData'] as Map);
        } catch (_) {
          formData = {};
        }
      } else if (json['formData'] is Map) {
        formData = Map<String, dynamic>.from(json['formData']);
      }
    }

    // Parse attachments
    List<String> attachments = [];
    if (json['attachments'] != null) {
      if (json['attachments'] is List) {
        attachments = List<String>.from(json['attachments']);
      }
    }

    return ApplicationModel(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      createdAt: createdAt,
      updatedAt: updatedAt,
      submittedAt: submittedAt,
      status: status,
      formData: formData,
      attachments: attachments,
      referenceNumber: json['referenceNumber']?.toString(),
      userId: json['userId']?.toString() ?? '',
    );
  }

  // Handles server-specific JSON format that might be different from the generic format
  factory ApplicationModel.fromServerJson(Map<String, dynamic> json) {
    // Parse the status
    final ApplicationStatus status = _parseStatus(json['status']);

    // Parse dates - handle different field names from server
    final DateTime createdAt = json['submissiondate'] != null
        ? _parseDate(json['submissiondate'])
        : _parseDate(json['createdAt'] ?? json['created_at']);

    final DateTime updatedAt = json['lastupdated'] != null
        ? _parseDate(json['lastupdated'])
        : (json['updatedAt'] != null
            ? _parseDate(json['updatedAt'])
            : createdAt);

    final DateTime? submittedAt = json['submissiondate'] != null
        ? _parseDate(json['submissiondate'])
        : (json['submittedAt'] != null
            ? _parseDate(json['submittedAt'])
            : null);

    // Parse formData, with fallback to empty map
    Map<String, dynamic> formData = {};
    if (json['formData'] != null) {
      if (json['formData'] is String) {
        try {
          formData = Map<String, dynamic>.from(json['formData'] as Map);
        } catch (_) {
          formData = {};
        }
      } else if (json['formData'] is Map) {
        formData = Map<String, dynamic>.from(json['formData']);
      }
    }

    // Parse attachments
    List<String> attachments = [];
    if (json['attachments'] != null) {
      if (json['attachments'] is List) {
        attachments = List<String>.from(json['attachments']);
      }
    }

    return ApplicationModel(
      id: (json['applicationid'] ?? json['id']).toString(),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      createdAt: createdAt,
      updatedAt: updatedAt,
      submittedAt: submittedAt,
      status: status,
      formData: formData,
      attachments: attachments,
      referenceNumber: json['referenceNumber']?.toString() ??
          json['applicationid']?.toString(),
      userId: json['citizenid']?.toString() ?? json['userId']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': _statusToString(status),
      'formData': formData,
      'attachments': attachments,
      'referenceNumber': referenceNumber,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'submittedAt': submittedAt?.toIso8601String(),
    };
  }

  factory ApplicationModel.fromEntity(Application application) {
    return ApplicationModel(
      id: application.id,
      title: application.title,
      description: application.description,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      submittedAt: application.submittedAt,
      status: application.status,
      formData: application.formData,
      attachments: application.attachments,
      referenceNumber: application.referenceNumber,
      userId: application.userId,
    );
  }

  static ApplicationStatus _parseStatus(dynamic status) {
    if (status == null) return ApplicationStatus.draft;

    if (status is int) {
      switch (status) {
        case 0:
          return ApplicationStatus.draft;
        case 1:
          return ApplicationStatus.submitted;
        case 2:
          return ApplicationStatus.inReview;
        case 3:
          return ApplicationStatus.approved;
        case 4:
          return ApplicationStatus.rejected;
        case 5:
          return ApplicationStatus.completed;
        default:
          return ApplicationStatus.draft;
      }
    } else if (status is String) {
      switch (status.toLowerCase()) {
        case 'draft':
          return ApplicationStatus.draft;
        case 'submitted':
          return ApplicationStatus.submitted;
        case 'in_review':
        case 'inreview':
        case 'processing':
          return ApplicationStatus.inReview;
        case 'approved':
          return ApplicationStatus.approved;
        case 'rejected':
          return ApplicationStatus.rejected;
        case 'completed':
          return ApplicationStatus.completed;
        default:
          return ApplicationStatus.draft;
      }
    }

    return ApplicationStatus.draft;
  }

  static String _statusToString(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.draft:
        return 'draft';
      case ApplicationStatus.submitted:
        return 'submitted';
      case ApplicationStatus.inReview:
        return 'in_review';
      case ApplicationStatus.approved:
        return 'approved';
      case ApplicationStatus.rejected:
        return 'rejected';
      case ApplicationStatus.completed:
        return 'completed';
      default:
        return 'draft';
    }
  }

  static DateTime _parseDate(dynamic date) {
    if (date == null) return DateTime.now();

    if (date is String) {
      try {
        return DateTime.parse(date);
      } catch (_) {
        return DateTime.now();
      }
    } else if (date is int) {
      try {
        return DateTime.fromMillisecondsSinceEpoch(date);
      } catch (_) {
        return DateTime.now();
      }
    }

    return DateTime.now();
  }
}
