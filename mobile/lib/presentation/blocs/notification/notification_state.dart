import 'package:equatable/equatable.dart';

import '../../../domain/entities/notification.dart';

abstract class NotificationState extends Equatable {
  const NotificationState();

  @override
  List<Object> get props => [];
}

class NotificationInitialState extends NotificationState {
  const NotificationInitialState();
}

class NotificationsLoadingState extends NotificationState {
  const NotificationsLoadingState();
}

class NotificationsLoadedState extends NotificationState {
  final List<Notification> notifications;
  final int unreadCount;

  const NotificationsLoadedState({
    required this.notifications,
    required this.unreadCount,
  });

  @override
  List<Object> get props => [notifications, unreadCount];

  NotificationsLoadedState copyWith({
    List<Notification>? notifications,
    int? unreadCount,
  }) {
    return NotificationsLoadedState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

class NotificationErrorState extends NotificationState {
  final String message;

  const NotificationErrorState(this.message);

  @override
  List<Object> get props => [message];
}
