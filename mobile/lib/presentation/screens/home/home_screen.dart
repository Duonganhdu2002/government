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
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
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
                    style: AppStyles.body2,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAuthenticated ? 'Chào, $userName!' : 'Chào mừng!',
                    style: AppStyles.heading2,
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
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
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
            style: AppStyles.heading3,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildQuickActionCard(
                context,
                icon: Icons.document_scanner_outlined,
                title: 'Hồ sơ mới',
                color: AppColors.primary,
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.applicationsRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              const SizedBox(width: 12),
              _buildQuickActionCard(
                context,
                icon: Icons.history_outlined,
                title: 'Lịch sử',
                color: AppColors.secondary,
                onTap: () {
                  if (isAuthenticated) {
                    context.go(AppConstants.historyRoute);
                  } else {
                    context.go(AppConstants.loginRoute);
                  }
                },
              ),
              const SizedBox(width: 12),
              _buildQuickActionCard(
                context,
                icon: Icons.notifications_outlined,
                title: 'Thông báo',
                color: AppColors.warning,
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
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
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
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: AppStyles.subtitle2,
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
                style: AppStyles.heading3,
              ),
              TextButton(
                onPressed: () {
                  context.go(AppConstants.notificationsRoute);
                },
                child: Text(
                  'Xem tất cả',
                  style: AppStyles.body2.copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationsLoadingState) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: CircularProgressIndicator(),
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
    // Define colors based on notification type
    Color getColor(String type) {
      switch (type) {
        case 'success':
          return Colors.green;
        case 'warning':
          return Colors.orange;
        case 'error':
          return Colors.red;
        case 'info':
        default:
          return AppColors.info;
      }
    }

    // Define icons based on notification type
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

    final color = getColor(notification.type);
    final iconData = getIcon(notification.type);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color:
              notification.read ? Colors.transparent : color.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            iconData,
            color: color,
            size: 20,
          ),
        ),
        title: Text(
          notification.title,
          style: AppStyles.subtitle1,
        ),
        subtitle: Text(
          notification.message,
          style: AppStyles.body2,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        onTap: () {
          context.go(AppConstants.notificationsRoute);
        },
      ),
    );
  }

  Widget _buildEmptyNotifications() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.notifications_none,
              size: 48,
              color: AppColors.textLight,
            ),
            const SizedBox(height: 8),
            Text(
              'Không có thông báo mới',
              style: AppStyles.body1.copyWith(color: AppColors.textSecondary),
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
                style: AppStyles.heading3,
              ),
              TextButton(
                onPressed: () {
                  context.go(AppConstants.historyRoute);
                },
                child: Text(
                  'Xem tất cả',
                  style: AppStyles.body2.copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          BlocBuilder<ApplicationBloc, ApplicationState>(
            builder: (context, state) {
              if (state is ApplicationsLoadingState) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: CircularProgressIndicator(),
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
    // Define colors based on application status
    Color getStatusColor(ApplicationStatus status) {
      switch (status) {
        case ApplicationStatus.approved:
          return Colors.green;
        case ApplicationStatus.rejected:
          return Colors.red;
        case ApplicationStatus.inReview:
          return Colors.orange;
        case ApplicationStatus.draft:
        case ApplicationStatus.submitted:
        default:
          return AppColors.primary;
      }
    }

    // Format status text
    String getStatusText(ApplicationStatus status) {
      switch (status) {
        case ApplicationStatus.approved:
          return 'Đã duyệt';
        case ApplicationStatus.rejected:
          return 'Đã từ chối';
        case ApplicationStatus.inReview:
          return 'Đang xem xét';
        case ApplicationStatus.submitted:
          return 'Đã nộp';
        case ApplicationStatus.draft:
        default:
          return 'Bản nháp';
      }
    }

    final statusColor = getStatusColor(application.status);
    final statusText = getStatusText(application.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          application.title,
          style: AppStyles.subtitle1,
        ),
        subtitle: Text(
          application.description,
          style: AppStyles.body2,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            statusText,
            style: AppStyles.caption.copyWith(color: statusColor),
          ),
        ),
        onTap: () {
          context.go('${AppConstants.historyRoute}/details/${application.id}');
        },
      ),
    );
  }

  Widget _buildEmptyApplications() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.description_outlined,
              size: 48,
              color: AppColors.textLight,
            ),
            const SizedBox(height: 8),
            Text(
              'Bạn chưa có hồ sơ nào',
              style: AppStyles.body1.copyWith(color: AppColors.textSecondary),
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
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.primary.withOpacity(0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Đăng nhập để sử dụng đầy đủ dịch vụ',
              style: AppStyles.subtitle1.copyWith(color: AppColors.primary),
            ),
            const SizedBox(height: 8),
            Text(
              'Đăng nhập để truy cập các dịch vụ hành chính công, theo dõi hồ sơ và nhận thông báo từ các cơ quan nhà nước.',
              style: AppStyles.body2,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
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
                child: Text(
                  'Đăng nhập ngay',
                  style: AppStyles.button,
                ),
              ),
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
            style: AppStyles.heading3,
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 0.85,
            children: [
              _buildServiceCard(
                context,
                title: 'CCCD/CMND',
                icon: Icons.badge_outlined,
                iconColor: AppColors.primary,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
              _buildServiceCard(
                context,
                title: 'Đăng ký kinh doanh',
                icon: Icons.business_outlined,
                iconColor: AppColors.secondary,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
              _buildServiceCard(
                context,
                title: 'Đăng ký nhà đất',
                icon: Icons.home_outlined,
                iconColor: Colors.orange,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
              _buildServiceCard(
                context,
                title: 'Khai thuế',
                icon: Icons.account_balance_outlined,
                iconColor: Colors.purple,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
              _buildServiceCard(
                context,
                title: 'Giấy phép lái xe',
                icon: Icons.directions_car_outlined,
                iconColor: Colors.teal,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
              _buildServiceCard(
                context,
                title: 'Xem tất cả',
                icon: Icons.apps_outlined,
                iconColor: AppColors.textSecondary,
                route: AppConstants.applicationsRoute,
                isAuthenticated: isAuthenticated,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color iconColor,
    required String route,
    required bool isAuthenticated,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () {
          if (isAuthenticated) {
            context.go(route);
          } else {
            context.go(AppConstants.loginRoute);
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 28,
                  color: iconColor,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppStyles.subtitle2,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
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
            style: AppStyles.heading3,
          ),
          const SizedBox(height: 12),
          _buildNewsCard(
            context,
            title: 'Thông báo bảo trì hệ thống',
            description:
                'Hệ thống sẽ tạm ngưng hoạt động từ 22:00 ngày 15/05/2024 đến 02:00 ngày 16/05/2024 để bảo trì định kỳ.',
            date: '14/05/2024',
          ),
          const SizedBox(height: 8),
          _buildNewsCard(
            context,
            title: 'Cải tiến quy trình đăng ký online',
            description:
                'Từ ngày 01/06/2024, quy trình đăng ký online sẽ được cải tiến để rút ngắn thời gian xử lý hồ sơ.',
            date: '10/05/2024',
          ),
          const SizedBox(height: 8),
          _buildNewsCard(
            context,
            title: 'Thông báo nghỉ lễ 30/4 và 01/5',
            description:
                'Các cơ quan hành chính sẽ nghỉ làm việc từ ngày 30/04/2024 đến hết ngày 01/05/2024.',
            date: '25/04/2024',
          ),
        ],
      ),
    );
  }

  Widget _buildNewsCard(
    BuildContext context, {
    required String title,
    required String description,
    required String date,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () {
            // Navigate to news detail
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: AppStyles.subtitle1,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.lightGrey,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        date,
                        style: AppStyles.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: AppStyles.body2,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      'Xem chi tiết',
                      style: AppStyles.body2.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 12,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
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
}
