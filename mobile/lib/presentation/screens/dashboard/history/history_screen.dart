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
      appBar: AppBar(
        title: const Text('Lịch sử hồ sơ đã nộp'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _checkTokenAndLoadData,
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
          SizedBox(
            width: 50,
            height: 50,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Đang tải dữ liệu...',
            style: Theme.of(context).textTheme.bodyMedium,
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
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: AppTheme.textSecondary, size: 48),
            const SizedBox(height: 16),
            Text(
              error,
              style: TextStyle(color: AppTheme.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Thử lại'),
            ),
            if (isTokenError) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onLogout,
                child: const Text('Đăng nhập lại'),
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
          const Icon(
            Icons.description_outlined,
            size: 64,
            color: Colors.grey,
          ),
          const SizedBox(height: 16),
          const Text(
            'Bạn chưa nộp đơn nào',
            style: TextStyle(fontSize: 18),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // Navigate to applications screen
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: const Text('Tạo đơn mới'),
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
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        // Set an itemExtent to help ListView be more efficient
        itemExtent: 220, // Approximate height of each card
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
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.subtleGradient,
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => _showApplicationDetails(context, application),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header row with ID and status
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Mã đơn: ${application.referenceNumber ?? 'N/A'}',
                          style: Theme.of(context).textTheme.titleMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      _buildStatusBadge(application.status),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),
                  // Title
                  Text(
                    application.title,
                    style: Theme.of(context).textTheme.titleLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  // Description
                  Text(
                    'Mô tả: ${application.description}',
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Date
                  Text(
                    'Ngày nộp: ${_formatDate(application.submittedAt ?? application.createdAt)}',
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Button row
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                      onPressed: () =>
                          _showApplicationDetails(context, application),
                      icon: const Text('Xem chi tiết'),
                      label: const Icon(Icons.arrow_forward, size: 16),
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.primaryColor,
                      ),
                    ),
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
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.5,
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
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Colors.white,
          const Color(0xFFF9F9F9),
        ],
      ),
    ),
    child: ListView(
      controller: controller,
      padding: const EdgeInsets.all(20),
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
        _buildDetailItem(context, 'Mã đơn', app.referenceNumber ?? 'N/A'),
        _buildDetailItem(context, 'Tiêu đề', app.title),
        _buildDetailItem(context, 'Mô tả', app.description),
        _buildDetailItem(
            context, 'Ngày nộp', _formatDate(app.submittedAt ?? app.createdAt)),

        // Display attachments if available
        if (app.attachments.isNotEmpty) ...[
          const SizedBox(height: 24),
          Text(
            'Tài liệu đính kèm',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          ...app.attachments
              .map(
                (attachment) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading:
                      Icon(Icons.attach_file, color: AppTheme.textSecondary),
                  title: Text(
                    attachment,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              )
              .toList(),
        ],

        const SizedBox(height: 36),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Đóng'),
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
