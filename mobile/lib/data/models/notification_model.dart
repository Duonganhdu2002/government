import '../../domain/entities/notification.dart';

class NotificationModel extends Notification {
  NotificationModel({
    required super.id,
    required super.title,
    required super.message,
    required super.date,
    required super.read,
    required super.type,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'].toString(),
      title: json['title'] as String,
      message: json['message'] as String,
      date: DateTime.parse(json['date'] as String),
      read: json['read'] as bool,
      type: json['type'] as String? ?? 'info',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'date': date.toIso8601String(),
      'read': read,
      'type': type,
    };
  }
}
