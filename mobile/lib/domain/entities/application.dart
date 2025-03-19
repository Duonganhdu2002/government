import 'package:equatable/equatable.dart';

enum ApplicationStatus {
  draft,
  submitted,
  inReview,
  approved,
  rejected,
  completed,
}

class Application extends Equatable {
  final String id;
  final String title;
  final String description;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? submittedAt;
  final ApplicationStatus status;
  final Map<String, dynamic> formData;
  final List<String> attachments;
  final String? referenceNumber;
  final String userId;

  const Application({
    required this.id,
    required this.title,
    required this.description,
    required this.createdAt,
    required this.updatedAt,
    this.submittedAt,
    required this.status,
    required this.formData,
    this.attachments = const [],
    this.referenceNumber,
    required this.userId,
  });

  Application copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? submittedAt,
    ApplicationStatus? status,
    Map<String, dynamic>? formData,
    List<String>? attachments,
    String? referenceNumber,
    String? userId,
  }) {
    return Application(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      submittedAt: submittedAt ?? this.submittedAt,
      status: status ?? this.status,
      formData: formData ?? this.formData,
      attachments: attachments ?? this.attachments,
      referenceNumber: referenceNumber ?? this.referenceNumber,
      userId: userId ?? this.userId,
    );
  }

  bool get isDraft => status == ApplicationStatus.draft;
  bool get isSubmitted => status == ApplicationStatus.submitted;
  bool get isInReview => status == ApplicationStatus.inReview;
  bool get isApproved => status == ApplicationStatus.approved;
  bool get isRejected => status == ApplicationStatus.rejected;
  bool get isCompleted => status == ApplicationStatus.completed;

  String get statusText {
    switch (status) {
      case ApplicationStatus.draft:
        return 'Bản nháp';
      case ApplicationStatus.submitted:
        return 'Đã nộp';
      case ApplicationStatus.inReview:
        return 'Đang xử lý';
      case ApplicationStatus.approved:
        return 'Đã phê duyệt';
      case ApplicationStatus.rejected:
        return 'Từ chối';
      case ApplicationStatus.completed:
        return 'Hoàn thành';
    }
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        createdAt,
        updatedAt,
        submittedAt,
        status,
        formData,
        attachments,
        referenceNumber,
        userId,
      ];
}
