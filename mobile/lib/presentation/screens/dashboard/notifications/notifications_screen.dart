import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Thông báo',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
            const Divider(),
            Expanded(
              child: _buildNotificationsList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationsList() {
    // Dữ liệu mẫu
    final notifications = [
      {
        'title': 'Hồ sơ đã được duyệt',
        'message': 'Đơn xin cấp CCCD của bạn đã được phê duyệt.',
        'time': '2 giờ trước',
        'isRead': false,
        'type': 'success',
      },
      {
        'title': 'Cập nhật thông tin',
        'message':
            'Vui lòng cập nhật thông tin cá nhân của bạn trước ngày 30/06/2024.',
        'time': '1 ngày trước',
        'isRead': true,
        'type': 'info',
      },
      {
        'title': 'Hồ sơ cần bổ sung',
        'message':
            'Đơn xin cấp phép xây dựng của bạn cần bổ sung một số giấy tờ.',
        'time': '3 ngày trước',
        'isRead': true,
        'type': 'warning',
      },
      {
        'title': 'Bảo trì hệ thống',
        'message':
            'Hệ thống sẽ bảo trì từ 22:00 ngày 15/05/2024 đến 02:00 ngày 16/05/2024.',
        'time': '1 tuần trước',
        'isRead': true,
        'type': 'info',
      },
    ];

    if (notifications.isEmpty) {
      return const Center(
        child: Text('Không có thông báo nào'),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return _buildNotificationItem(notification);
      },
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> notification) {
    // Xác định màu sắc dựa trên loại thông báo
    Color getColor(String type) {
      switch (type) {
        case 'success':
          return AppTheme.successColor;
        case 'warning':
          return Colors.orange;
        case 'error':
          return AppTheme.errorColor;
        case 'info':
        default:
          return AppTheme.secondaryColor;
      }
    }

    // Xác định icon dựa trên loại thông báo
    IconData getIcon(String type) {
      switch (type) {
        case 'success':
          return Icons.check_circle;
        case 'warning':
          return Icons.warning;
        case 'error':
          return Icons.error;
        case 'info':
        default:
          return Icons.info;
      }
    }

    final color = getColor(notification['type']);
    final iconData = getIcon(notification['type']);
    final isRead = notification['isRead'] as bool;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isRead ? Colors.grey.shade200 : color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                iconData,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'],
                          style: TextStyle(
                            fontWeight:
                                isRead ? FontWeight.normal : FontWeight.bold,
                            fontSize: 16,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification['message'],
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    notification['time'],
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
