import '../entities/notification.dart';

abstract class NotificationRepository {
  /// Get all notifications for the current user
  Future<List<Notification>> getNotifications();

  /// Mark a notification as read
  Future<bool> markAsRead(String id);

  /// Mark all notifications as read
  Future<bool> markAllAsRead();

  /// Get the count of unread notifications
  Future<int> getUnreadCount();
}
