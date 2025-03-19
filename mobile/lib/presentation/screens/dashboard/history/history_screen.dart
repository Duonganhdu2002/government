import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/utils/dio_utils.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/usecase.dart';
import '../../../../domain/entities/application.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../blocs/application/application_bloc.dart';
import '../../../blocs/auth/auth_bloc.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen>
    with AutomaticKeepAliveClientMixin {
  List<Application> _applications = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _hasInitialized = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    print('[HistoryScreen] initState called');
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;

    // If we're coming back to this screen, don't show loading state if we already have data
    if (_applications.isNotEmpty) {
      setState(() {
        _isLoading = false;
        _errorMessage = null;
      });
      return;
    }

    if (!_hasInitialized) {
      _hasInitialized = true;
      _checkTokenAndLoadData();
    }
  }

  Future<void> _checkTokenAndLoadData() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Check if token exists
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);

    print(
        '[HistoryScreen] Token check: ${token != null ? 'Token exists' : 'No token found'}');

    if (token == null || token.isEmpty) {
      // No token or empty token, trigger auth check
      print('[HistoryScreen] No valid token, checking auth status');
      if (mounted) {
        context.read<AuthBloc>().add(const CheckAuthStatusEvent());
      }
      return;
    }

    // Token exists, load data
    print('[HistoryScreen] Valid token found, loading applications');
    if (mounted) {
      context.read<ApplicationBloc>().add(LoadCurrentUserApplicationsEvent());
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    // Use less frequent rebuilds
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Lịch sử hồ sơ đã nộp'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _checkTokenAndLoadData,
            tooltip: 'Làm mới',
          ),
        ],
      ),
      body: BlocConsumer<ApplicationBloc, ApplicationState>(
        listenWhen: (previous, current) {
          // Optimize by only listening to certain state changes
          if (previous is ApplicationsLoadingState &&
              current is ApplicationsLoadedState) return true;
          if (previous is ApplicationsLoadingState &&
              current is ApplicationErrorState) return true;
          return false;
        },
        listener: (context, state) {
          print('[HistoryScreen] State changed: ${state.runtimeType}');

          if (state is ApplicationsLoadingState) {
            setState(() {
              _isLoading = true;
              _errorMessage = null;
            });
          } else if (state is ApplicationErrorState) {
            setState(() {
              _isLoading = false;
              _errorMessage = state.message;
            });
          } else if (state is ApplicationsLoadedState) {
            print(
                '[HistoryScreen] Loaded ${state.applications.length} applications');
            setState(() {
              _isLoading = false;
              _errorMessage = null;
              _applications = state.applications;
            });
          }
        },
        buildWhen: (previous, current) {
          // Optimize rebuilds
          if (current is ApplicationsLoadingState) return _applications.isEmpty;
          if (current is ApplicationsLoadedState) return true;
          if (current is ApplicationErrorState) return true;
          return false;
        },
        builder: (context, state) {
          // Show loading indicator if we're loading and have no data
          if (_isLoading && _applications.isEmpty) {
            return const _LoadingView();
          }

          if (_errorMessage != null) {
            return _ErrorView(
              error: _errorMessage!,
              onRetry: _checkTokenAndLoadData,
              onLogout: () async {
                await DioUtils.clearToken();
                context.read<AuthBloc>().add(LogoutEvent());
                if (!mounted) return;
                context.go('/login');
              },
            );
          }

          if (_applications.isEmpty) {
            return const _EmptyView();
          }

          // Use our cached applications list
          return _ApplicationListView(applications: _applications);
        },
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Center(
              child: SizedBox(
                width: 30,
                height: 30,
                child: CircularProgressIndicator(
                  valueColor:
                      AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                  strokeWidth: 3,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Đang tải dữ liệu...',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Vui lòng đợi trong giây lát',
            style: TextStyle(
              color: AppTheme.textLight,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  final VoidCallback onLogout;

  const _ErrorView({
    required this.error,
    required this.onRetry,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final bool isTokenError = error.toLowerCase().contains('token') ||
        error.toLowerCase().contains('unauthorized') ||
        error.toLowerCase().contains('auth');

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Icon(
                Icons.error_outline,
                color: AppTheme.textSecondary,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Đã xảy ra lỗi',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(color: AppTheme.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 200,
              child: ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Thử lại'),
              ),
            ),
            if (isTokenError) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: 200,
                child: TextButton(
                  onPressed: onLogout,
                  child: const Text('Đăng nhập lại'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Icon(
              Icons.description_outlined,
              size: 40,
              color: AppTheme.textLight,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Chưa có đơn nào',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Bạn chưa nộp đơn nào trong hệ thống',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: 200,
            child: ElevatedButton(
              onPressed: () {
                // Navigate to applications screen
                context.go(AppConstants.applicationsRoute);
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text('Tạo đơn mới'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ApplicationListView extends StatelessWidget {
  final List<Application> applications;

  const _ApplicationListView({required this.applications});

  @override
  Widget build(BuildContext context) {
    print(
        '[ApplicationListView] Building with ${applications.length} applications');

    return RefreshIndicator(
      onRefresh: () async {
        context.read<ApplicationBloc>().add(LoadCurrentUserApplicationsEvent());
      },
      color: AppTheme.primaryColor,
      backgroundColor: Colors.white,
      displacement: 40,
      child: applications.isEmpty
          ? const _EmptyView()
          : ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              // Set an itemExtent to help ListView be more efficient
              itemExtent: 200, // Adjusted height after removing button
              itemCount: applications.length,
              itemBuilder: (context, index) {
                final application = applications[index];
                // Only log first few items to avoid excessive logging
                if (index < 2) {
                  print(
                      '[ApplicationListView] Building item $index: ${application.title}');
                }
                return _ApplicationCard(
                  key: ValueKey('app_${application.id}'),
                  application: application,
                );
              },
            ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  final Application application;

  const _ApplicationCard({super.key, required this.application});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade300, width: 0.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => _showApplicationDetails(context, application),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header row with ID and status
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Mã đơn: ${application.referenceNumber ?? application.id.toString()}',
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      _buildStatusBadge(application.status),
                    ],
                  ),
                  const Divider(height: 24),
                  // Title
                  Text(
                    application.title,
                    style: Theme.of(context).textTheme.titleLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  // Description
                  Text(
                    'Mô tả: ${application.description}',
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  // Date
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 16,
                        color: AppTheme.textLight,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Ngày nộp: ${_formatDate(application.submittedAt ?? application.createdAt)}',
                        style: TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(ApplicationStatus status) {
    late Color color;
    late String label;

    switch (status) {
      case ApplicationStatus.draft:
        color = AppTheme.statusDraft;
        label = 'Bản nháp';
        break;
      case ApplicationStatus.submitted:
        color = AppTheme.statusSubmitted;
        label = 'Đã nộp';
        break;
      case ApplicationStatus.inReview:
        color = AppTheme.statusInReview;
        label = 'Đang xử lý';
        break;
      case ApplicationStatus.approved:
      case ApplicationStatus.completed:
        color = AppTheme.statusApproved;
        label = 'Hoàn thành';
        break;
      case ApplicationStatus.rejected:
        color = AppTheme.statusRejected;
        label = 'Từ chối';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

// Helper function
String _formatDate(DateTime date) {
  return DateFormat('dd/MM/yyyy').format(date);
}

Future<void> _showApplicationDetails(
    BuildContext context, Application application) async {
  // When user taps on an application, load the details
  context.read<ApplicationBloc>().add(LoadApplicationEvent(id: application.id));

  // Use a simpler initial view to avoid freezes
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    elevation: 10,
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      expand: false,
      builder: (_, controller) {
        return BlocBuilder<ApplicationBloc, ApplicationState>(
          builder: (context, state) {
            if (state is ApplicationLoadingState) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 50,
                      height: 50,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        valueColor: AlwaysStoppedAnimation<Color>(
                            AppTheme.primaryColor),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Đang tải chi tiết...',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              );
            } else if (state is ApplicationErrorState) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          color: AppTheme.textSecondary, size: 48),
                      const SizedBox(height: 16),
                      Text(
                        state.message,
                        style: TextStyle(color: AppTheme.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        child: const Text('Đóng'),
                      ),
                    ],
                  ),
                ),
              );
            } else if (state is ApplicationLoadedState) {
              final app = state.application;
              return _buildApplicationDetailsContent(context, controller, app);
            }

            // Default - use the application we already have
            return _buildApplicationDetailsContent(
                context, controller, application);
          },
        );
      },
    ),
  );
}

Widget _buildApplicationDetailsContent(
    BuildContext context, ScrollController controller, Application app) {
  return Container(
    decoration: BoxDecoration(
      color: Colors.white,
    ),
    child: Stack(
      children: [
        ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 80),
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0E0E0),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chi tiết đơn',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Application status badge
            Center(
              child: _buildStatusIndicator(app.status),
            ),
            const SizedBox(height: 24),

            // Application details
            _buildDetailItem(
                context, 'Mã đơn', app.referenceNumber ?? app.id.toString()),
            _buildDetailItem(context, 'Tiêu đề', app.title),
            _buildDetailItem(context, 'Mô tả', app.description),
            _buildDetailItem(context, 'Ngày nộp',
                _formatDate(app.submittedAt ?? app.createdAt)),

            // Display attachments if available
            if (app.attachments.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                'Tài liệu đính kèm',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              ...app.attachments
                  .map(
                    (attachment) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.attach_file,
                              color: AppTheme.textSecondary),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              attachment,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ],
          ],
        ),

        // Fixed button at bottom
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Đóng'),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

Widget _buildStatusIndicator(ApplicationStatus status) {
  late Color color;
  late String label;

  switch (status) {
    case ApplicationStatus.draft:
      color = AppTheme.statusDraft;
      label = 'Bản nháp';
      break;
    case ApplicationStatus.submitted:
      color = AppTheme.statusSubmitted;
      label = 'Đã nộp';
      break;
    case ApplicationStatus.inReview:
      color = AppTheme.statusInReview;
      label = 'Đang xử lý';
      break;
    case ApplicationStatus.approved:
      color = AppTheme.statusApproved;
      label = 'Hoàn thành';
      break;
    case ApplicationStatus.rejected:
      color = AppTheme.statusRejected;
      label = 'Từ chối';
      break;
    case ApplicationStatus.completed:
      color = AppTheme.statusApproved;
      label = 'Hoàn thành';
      break;
  }

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: color, width: 1.5),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 2),
        ),
      ],
    ),
    child: Text(
      label,
      style: TextStyle(
        color: color,
        fontWeight: FontWeight.bold,
        fontSize: 14,
      ),
    ),
  );
}

Widget _buildDetailItem(BuildContext context, String label, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: AppTheme.textLight,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 8),
        const Divider(),
      ],
    ),
  );
}
