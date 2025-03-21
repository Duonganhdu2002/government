import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/entities/notification.dart';
import '../../../domain/repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';

// A simple logger to replace print statements
class _Logger {
  static const bool _enableLogging =
      false; // Set to true only during development

  static void log(String message) {
    if (_enableLogging) {
      // ignore: avoid_print
      print('[NotificationBloc] $message');
    }
  }
}

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationRepository _notificationRepository;

  NotificationBloc(this._notificationRepository)
      : super(const NotificationInitialState()) {
    on<LoadNotificationsEvent>(_onLoadNotifications);
    on<MarkNotificationAsReadEvent>(_onMarkAsRead);
    on<MarkAllNotificationsAsReadEvent>(_onMarkAllAsRead);
    on<RefreshUnreadCountEvent>(_onRefreshUnreadCount);
  }

  Future<void> _onLoadNotifications(
    LoadNotificationsEvent event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      emit(const NotificationsLoadingState());

      // Get notifications
      final notifications = await _notificationRepository.getNotifications();
      final unreadCount = await _notificationRepository.getUnreadCount();

      emit(NotificationsLoadedState(
        notifications: notifications,
        unreadCount: unreadCount,
      ));
    } catch (e) {
      emit(NotificationErrorState('Failed to load notifications: $e'));
    }
  }

  Future<void> _onMarkAsRead(
    MarkNotificationAsReadEvent event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      if (state is NotificationsLoadedState) {
        final currentState = state as NotificationsLoadedState;

        // Mark notification as read
        final success = await _notificationRepository.markAsRead(event.id);

        if (success) {
          // Update the notification in the list
          final updatedNotifications =
              currentState.notifications.map((notification) {
            if (notification.id == event.id) {
              // Create a new notification instance with read=true
              return Notification(
                id: notification.id,
                title: notification.title,
                message: notification.message,
                date: notification.date,
                read: true,
                type: notification.type,
              );
            }
            return notification;
          }).toList();

          // Get updated unread count
          final unreadCount = await _notificationRepository.getUnreadCount();

          emit(currentState.copyWith(
            notifications: updatedNotifications,
            unreadCount: unreadCount,
          ));
        }
      }
    } catch (e) {
      emit(NotificationErrorState('Failed to mark notification as read: $e'));
    }
  }

  Future<void> _onMarkAllAsRead(
    MarkAllNotificationsAsReadEvent event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      if (state is NotificationsLoadedState) {
        final currentState = state as NotificationsLoadedState;

        // Mark all notifications as read
        final success = await _notificationRepository.markAllAsRead();

        if (success) {
          // Update all notifications in the list to read=true
          final updatedNotifications =
              currentState.notifications.map((notification) {
            return Notification(
              id: notification.id,
              title: notification.title,
              message: notification.message,
              date: notification.date,
              read: true,
              type: notification.type,
            );
          }).toList();

          emit(currentState.copyWith(
            notifications: updatedNotifications,
            unreadCount: 0,
          ));
        }
      }
    } catch (e) {
      emit(NotificationErrorState(
          'Failed to mark all notifications as read: $e'));
    }
  }

  Future<void> _onRefreshUnreadCount(
    RefreshUnreadCountEvent event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      if (state is NotificationsLoadedState) {
        final currentState = state as NotificationsLoadedState;

        // Get updated unread count
        final unreadCount = await _notificationRepository.getUnreadCount();

        emit(currentState.copyWith(unreadCount: unreadCount));
      } else {
        // If not loaded, load everything
        add(const LoadNotificationsEvent());
      }
    } catch (e) {
      // Don't emit error state for background refresh
      _Logger.log('Failed to refresh unread count: $e');
    }
  }
}
