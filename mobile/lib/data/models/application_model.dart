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
