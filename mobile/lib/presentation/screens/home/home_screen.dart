import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/service_locator.dart';
import '../../../domain/repositories/notification_repository.dart';
import '../../../presentation/blocs/auth/auth_bloc.dart';
import '../../../presentation/blocs/notification/notification_bloc.dart';
import '../../../presentation/blocs/notification/notification_event.dart';
import '../../../presentation/blocs/notification/notification_state.dart';
import '../../../presentation/blocs/application/application_bloc.dart';
import '../../../presentation/themes/app_colors.dart';
import '../../../presentation/themes/app_styles.dart';
import '../../../domain/entities/notification.dart' as app_notification;
import '../../../domain/entities/application.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final isAuthenticated = context.select<AuthBloc, bool>(
      (bloc) => bloc.state is AuthenticatedState,
    );

    // Provide the NotificationBloc locally
    return BlocProvider<NotificationBloc>(
      create: (context) => NotificationBloc(sl<NotificationRepository>())
        ..add(const LoadNotificationsEvent()),
      child: Builder(
        builder: (context) {
          // Load user applications if authenticated
          if (isAuthenticated) {
            Future.microtask(() {
              if (context.mounted) {
                context
                    .read<ApplicationBloc>()
                    .add(LoadCurrentUserApplicationsEvent());
              }
            });
          }

          return Scaffold(
            backgroundColor: AppColors.background,
            body: SafeArea(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  // Refresh notifications and applications
                  context
                      .read<NotificationBloc>()
                      .add(const LoadNotificationsEvent());
                  if (isAuthenticated) {
                    context
                        .read<ApplicationBloc>()
                        .add(LoadCurrentUserApplicationsEvent());
                  }
                  await Future.delayed(const Duration(milliseconds: 500));
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(context, isAuthenticated),
                      const SizedBox(height: 16),
                      _buildQuickActions(context, isAuthenticated),
                      const SizedBox(height: 24),
                      _buildNotificationsPreview(context, isAuthenticated),
                      const SizedBox(height: 24),
                      if (isAuthenticated) _buildRecentApplications(context),
                      if (!isAuthenticated) _buildAuthPrompt(context),
                      const SizedBox(height: 24),
                      _buildPopularServices(context, isAuthenticated),
                      const SizedBox(height: 24),
                      _buildNewsSection(context),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isAuthenticated) {
    String greeting = _getGreeting();
    String userName = '';

    if (isAuthenticated) {
      final authState = context.read<AuthBloc>().state as AuthenticatedState;
      userName = authState.user.fullName?.split(' ').last ?? 'Người dùng';
    }

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    greeting,
                    style: AppStyles.body2.copyWith(color: AppColors.textLight),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAuthenticated ? 'Chào, $userName!' : 'Chào mừng!',
                    style: AppStyles.heading2
                        .copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.profileRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
                borderRadius: BorderRadius.circular(30),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.lightGrey,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isAuthenticated ? Icons.person : Icons.login,
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.lightGrey,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border, width: 1),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: AppColors.primary,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Truy cập tất cả dịch vụ hành chính công tại một nơi duy nhất.',
                    style:
                        AppStyles.body2.copyWith(color: AppColors.textPrimary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, bool isAuthenticated) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Truy cập nhanh',
            style: AppStyles.heading3.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildQuickActionCard(
                context,
                icon: Icons.document_scanner_outlined,
                title: 'Hồ sơ mới',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              const SizedBox(width: 16),
              _buildQuickActionCard(
                context,
                icon: Icons.history_outlined,
                title: 'Lịch sử',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.historyRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              const SizedBox(width: 16),
              _buildQuickActionCard(
                context,
                icon: Icons.notifications_outlined,
                title: 'Thông báo',
                onTap: () {
                  context.go(AppConstants.notificationsRoute);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.border,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 4,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.lightGrey,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: AppStyles.subtitle2.copyWith(
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationsPreview(
      BuildContext context, bool isAuthenticated) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Thông báo gần đây',
                style: AppStyles.heading3.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  context.go(AppConstants.notificationsRoute);
                },
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
                child: Text(
                  'Xem tất cả',
                  style: AppStyles.body2.copyWith(fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationsLoadingState) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                );
              } else if (state is NotificationsLoadedState) {
                final notifications = state.notifications;

                if (notifications.isEmpty) {
                  return _buildEmptyNotifications();
                }

                // Display only the first 2 notifications
                final previewNotifications = notifications.take(2).toList();

                return Column(
                  children: previewNotifications.map((notification) {
                    return _buildNotificationItem(context, notification);
                  }).toList(),
                );
              }

              return _buildEmptyNotifications();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(
      BuildContext context, app_notification.Notification notification) {
    // All notifications will use the same icon with the monochrome design
    IconData iconData = Icons.notifications_outlined;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: notification.read ? AppColors.border : AppColors.primary,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.lightGrey,
            shape: BoxShape.circle,
          ),
          child: Icon(
            iconData,
            color: AppColors.primary,
            size: 20,
          ),
        ),
        title: Text(
          notification.title,
          style: AppStyles.subtitle1.copyWith(
            fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            notification.message,
            style: AppStyles.body2.copyWith(
              color: AppColors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        onTap: () {
          context.go(AppConstants.notificationsRoute);
        },
      ),
    );
  }

  Widget _buildEmptyNotifications() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off_outlined,
              size: 40,
              color: AppColors.textLight,
            ),
            const SizedBox(height: 16),
            Text(
              'Không có thông báo mới',
              style: AppStyles.subtitle1.copyWith(
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Bạn sẽ nhận được thông báo khi có cập nhật mới',
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentApplications(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Hồ sơ gần đây',
                style: AppStyles.heading3.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  context.go(AppConstants.historyRoute);
                },
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
                child: Text(
                  'Xem tất cả',
                  style: AppStyles.body2.copyWith(fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          BlocBuilder<ApplicationBloc, ApplicationState>(
            builder: (context, state) {
              if (state is ApplicationsLoadingState) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                );
              } else if (state is ApplicationsLoadedState) {
                final applications = state.applications;

                if (applications.isEmpty) {
                  return _buildEmptyApplications();
                }

                // Display only the first 2 applications
                final previewApplications = applications.take(2).toList();

                return Column(
                  children: previewApplications.map((application) {
                    return _buildApplicationItem(context, application);
                  }).toList(),
                );
              }

              return _buildEmptyApplications();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildApplicationItem(BuildContext context, Application application) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  application.title,
                  style: AppStyles.subtitle1.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              _buildStatusBadge(application.status),
            ],
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              application.description,
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.calendar_today_outlined,
                  size: 14,
                  color: AppColors.textLight,
                ),
                const SizedBox(width: 4),
                Text(
                  'Ngày nộp: ${_formatDate(application.createdAt)}',
                  style: AppStyles.caption.copyWith(
                    color: AppColors.textLight,
                  ),
                ),
              ],
            ),
          ],
        ),
        onTap: () {
          context
              .go('${AppConstants.applicationDetailsRoute}/${application.id}');
        },
      ),
    );
  }

  Widget _buildEmptyApplications() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.description_outlined,
              size: 40,
              color: AppColors.textLight,
            ),
            const SizedBox(height: 16),
            Text(
              'Bạn chưa có hồ sơ nào',
              style: AppStyles.subtitle1.copyWith(
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Tạo hồ sơ mới để bắt đầu sử dụng dịch vụ',
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: 200,
              child: OutlinedButton(
                onPressed: () {
                  context.go(AppConstants.applicationsRoute);
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primary),
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Tạo hồ sơ mới'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthPrompt(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(
              Icons.person_outline,
              size: 40,
              color: AppColors.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Đăng nhập để sử dụng dịch vụ',
              style: AppStyles.heading3.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Bạn cần đăng nhập để tạo và theo dõi tiến độ hồ sơ của mình',
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      context.go(AppConstants.loginRoute);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Đăng nhập'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      context.go(AppConstants.registerRoute);
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Đăng ký'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPopularServices(BuildContext context, bool isAuthenticated) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Dịch vụ phổ biến',
            style: AppStyles.heading3.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.2,
            children: [
              _buildServiceCard(
                context,
                icon: Icons.apartment_outlined,
                title: 'Đăng ký thường trú',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              _buildServiceCard(
                context,
                icon: Icons.card_membership_outlined,
                title: 'Cấp mới CMND/CCCD',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              _buildServiceCard(
                context,
                icon: Icons.business_outlined,
                title: 'Giấy phép kinh doanh',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              _buildServiceCard(
                context,
                icon: Icons.maps_home_work_outlined,
                title: 'Thuế & Đất đai',
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.lightGrey,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: 24,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppStyles.subtitle2.copyWith(
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(ApplicationStatus status) {
    late String label;

    switch (status) {
      case ApplicationStatus.draft:
        label = 'Bản nháp';
        break;
      case ApplicationStatus.submitted:
        label = 'Đã nộp';
        break;
      case ApplicationStatus.inReview:
        label = 'Đang xử lý';
        break;
      case ApplicationStatus.approved:
      case ApplicationStatus.completed:
        label = 'Hoàn thành';
        break;
      case ApplicationStatus.rejected:
        label = 'Từ chối';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.lightGrey,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildNewsSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tin tức mới nhất',
            style: AppStyles.heading3.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.border,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                  child: Container(
                    height: 160,
                    width: double.infinity,
                    color: AppColors.lightGrey,
                    child: Icon(
                      Icons.photo_outlined,
                      size: 48,
                      color: AppColors.textLight,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Thông báo về việc tiếp nhận hồ sơ trực tuyến',
                        style: AppStyles.subtitle1.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Từ ngày 01/06/2023, tất cả các hồ sơ hành chính đều được tiếp nhận qua hệ thống trực tuyến.',
                        style: AppStyles.body2.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 14,
                            color: AppColors.textLight,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '01/06/2023',
                            style: AppStyles.caption.copyWith(
                              color: AppColors.textLight,
                            ),
                          ),
                          const Spacer(),
                          TextButton(
                            onPressed: () {},
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              padding: EdgeInsets.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              minimumSize: const Size(0, 0),
                            ),
                            child: Text(
                              'Xem chi tiết',
                              style: AppStyles.button.copyWith(
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Chào buổi sáng';
    } else if (hour < 18) {
      return 'Chào buổi chiều';
    } else {
      return 'Chào buổi tối';
    }
  }

  String _formatDate(DateTime date) {
    // Implement the logic to format the date
    return '${date.day}/${date.month}/${date.year}';
  }
}
