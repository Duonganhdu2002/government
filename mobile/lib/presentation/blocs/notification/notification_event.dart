import 'package:equatable/equatable.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object> get props => [];
}

class LoadNotificationsEvent extends NotificationEvent {
  const LoadNotificationsEvent();
}

class MarkNotificationAsReadEvent extends NotificationEvent {
  final String id;

  const MarkNotificationAsReadEvent(this.id);

  @override
  List<Object> get props => [id];
}

class MarkAllNotificationsAsReadEvent extends NotificationEvent {
  const MarkAllNotificationsAsReadEvent();
}

class RefreshUnreadCountEvent extends NotificationEvent {
  const RefreshUnreadCountEvent();
} 