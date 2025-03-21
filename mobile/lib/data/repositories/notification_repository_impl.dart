import 'package:flutter/foundation.dart';

import '../../domain/entities/notification.dart';
import '../../domain/repositories/notification_repository.dart';
import '../models/notification_model.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  // Mock notifications data (in a real app, this would come from API)
  final List<NotificationModel> _mockNotifications = [
    NotificationModel(
      id: '1',
      title: 'Hồ sơ đã được duyệt',
      message: 'Đơn xin cấp CCCD của bạn đã được phê duyệt.',
      date: DateTime.now().subtract(const Duration(hours: 2)),
      read: false,
      type: 'success',
    ),
    NotificationModel(
      id: '2',
      title: 'Cập nhật thông tin',
      message:
          'Vui lòng cập nhật thông tin cá nhân của bạn trước ngày 30/06/2024.',
      date: DateTime.now().subtract(const Duration(days: 1)),
      read: true,
      type: 'info',
    ),
    NotificationModel(
      id: '3',
      title: 'Hồ sơ cần bổ sung',
      message: 'Đơn xin cấp phép xây dựng của bạn cần bổ sung một số giấy tờ.',
      date: DateTime.now().subtract(const Duration(days: 3)),
      read: true,
      type: 'warning',
    ),
    NotificationModel(
      id: '4',
      title: 'Bảo trì hệ thống',
      message:
          'Hệ thống sẽ bảo trì từ 22:00 ngày 15/05/2024 đến 02:00 ngày 16/05/2024.',
      date: DateTime.now().subtract(const Duration(days: 7)),
      read: true,
      type: 'info',
    ),
  ];

  @override
  Future<List<Notification>> getNotifications() async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));
      return _mockNotifications;
    } catch (e) {
      debugPrint('Error getting notifications: $e');
      return [];
    }
  }

  @override
  Future<bool> markAsRead(String id) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      final index = _mockNotifications
          .indexWhere((notification) => notification.id == id);
      if (index != -1) {
        final updatedNotification = NotificationModel(
          id: _mockNotifications[index].id,
          title: _mockNotifications[index].title,
          message: _mockNotifications[index].message,
          date: _mockNotifications[index].date,
          read: true,
          type: _mockNotifications[index].type,
        );

        _mockNotifications[index] = updatedNotification;
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
      return false;
    }
  }

  @override
  Future<bool> markAllAsRead() async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 700));

      for (int i = 0; i < _mockNotifications.length; i++) {
        _mockNotifications[i] = NotificationModel(
          id: _mockNotifications[i].id,
          title: _mockNotifications[i].title,
          message: _mockNotifications[i].message,
          date: _mockNotifications[i].date,
          read: true,
          type: _mockNotifications[i].type,
        );
      }
      return true;
    } catch (e) {
      debugPrint('Error marking all notifications as read: $e');
      return false;
    }
  }

  @override
  Future<int> getUnreadCount() async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      return _mockNotifications
          .where((notification) => !notification.read)
          .length;
    } catch (e) {
      debugPrint('Error getting unread notification count: $e');
      return 0;
    }
  }
}
