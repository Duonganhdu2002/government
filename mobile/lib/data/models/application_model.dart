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
    return ApplicationModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      submittedAt: json['submittedAt'] != null
          ? DateTime.parse(json['submittedAt'])
          : null,
      status: _mapStringToApplicationStatus(json['status']),
      formData: json['formData'] ?? {},
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : [],
      referenceNumber: json['referenceNumber'],
      userId: json['userId'],
    );
  }

  /// Converts server-side application data format to ApplicationModel
  factory ApplicationModel.fromServerJson(Map<String, dynamic> json) {
    try {

      // Handle the application ID which could be int or string
      String id = '';
      if (json['applicationid'] != null) {
        id = json['applicationid'].toString();
      }

      // Get the submission date with fallback
      DateTime submittedAt = DateTime.now();
      if (json['submissiondate'] != null) {
        try {
          submittedAt = DateTime.parse(json['submissiondate']);
        } catch (e) {
        }
      }

      // Get the last updated date or use submission date as fallback
      DateTime updatedAt = submittedAt;
      if (json['lastupdated'] != null) {
        try {
          updatedAt = DateTime.parse(json['lastupdated']);
        } catch (e) {
        }
      }

      // Parse status safely
      String statusStr = 'unknown';
      if (json['status'] != null) {
        statusStr = json['status'].toString();
      }

      final application = ApplicationModel(
        id: id,
        title: json['title'] ?? 'No Title',
        description: json['description'] ?? '',
        createdAt: submittedAt, // Use submission date as creation date
        updatedAt: updatedAt,
        submittedAt: submittedAt,
        status: _mapStringToApplicationStatus(statusStr),
        formData: {
          'applicationtypeid': json['applicationtypeid'],
          'applicationtypename': json['applicationtypename'],
          'specialapplicationtypeid': json['specialapplicationtypeid'],
          'specialapplicationtypename': json['specialapplicationtypename'],
        },
        attachments: json['hasmedia'] == true ? ['Có tài liệu đính kèm'] : [],
        referenceNumber: json['applicationid']?.toString() ?? '',
        userId: json['citizenid']?.toString() ?? '',
      );

      return application;
    } catch (e) {

      // Create a fallback application with minimal data
      return ApplicationModel(
        id: json['applicationid']?.toString() ?? 'unknown',
        title: json['title'] ?? 'Không thể đọc tên hồ sơ',
        description: 'Không thể đọc mô tả',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        status: ApplicationStatus.submitted,
        formData: {},
        userId: json['citizenid']?.toString() ?? '',
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'submittedAt': submittedAt?.toIso8601String(),
      'status': _mapApplicationStatusToString(status),
      'formData': formData,
      'attachments': attachments,
      'referenceNumber': referenceNumber,
      'userId': userId,
    };
  }

  static ApplicationStatus _mapStringToApplicationStatus(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return ApplicationStatus.draft;
      case 'submitted':
        return ApplicationStatus.submitted;
      case 'in_review':
      case 'inreview':
      case 'in review':
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

  static String _mapApplicationStatusToString(ApplicationStatus status) {
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
    }
  }
}
