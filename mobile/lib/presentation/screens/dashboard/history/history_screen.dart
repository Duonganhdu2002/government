// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/utils/dio_utils.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../blocs/application/application_bloc.dart';
import '../../../blocs/auth/auth_bloc.dart';
import './application_details_screen.dart';
import '../../../blocs/history/history_bloc.dart';
import '../../../blocs/history/history_event.dart';
import '../../../blocs/history/history_state.dart';
import '../../../../core/utils/service_locator.dart' as di;

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

    if (token == null || token.isEmpty) {
      // No token or empty token, trigger auth check
      if (mounted) {
        context.read<AuthBloc>().add(const CheckAuthStatusEvent());
      }
      return;
    }

    // Token exists, load data using application bloc instead
    if (mounted) {
      context.read<ApplicationBloc>().add(LoadCurrentUserApplicationsEvent());
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return BlocProvider<HistoryBloc>(
      create: (context) => di.sl<HistoryBloc>()..add(const LoadHistoryEvent()),
      child: BlocListener<HistoryBloc, HistoryState>(
        listener: (context, state) {
          if (state is HistoryLoadingState) {
            setState(() {
              _isLoading = true;
              _errorMessage = null;
            });
          } else if (state is HistoryErrorState) {
            setState(() {
              _isLoading = false;
              _errorMessage = state.message;
            });
          } else if (state is HistoryLoadedState) {
            setState(() {
              _isLoading = false;
              _errorMessage = null;
              _applications = state.applications;
            });
          }
        },
        child: Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            title: const Text('Lịch sử hồ sơ đã nộp'),
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  context.read<HistoryBloc>().add(const RefreshHistoryEvent());
                },
                tooltip: 'Làm mới',
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              // Use History bloc for refresh
              context.read<HistoryBloc>().add(const RefreshHistoryEvent());
              // Add a small delay for better UX
              await Future.delayed(const Duration(milliseconds: 500));
            },
            child: BlocConsumer<ApplicationBloc, ApplicationState>(
              listenWhen: (previous, current) {
                // Optimize by only listening to certain state changes
                if (previous is ApplicationsLoadingState &&
                    current is ApplicationsLoadedState) return true;
                if (previous is ApplicationsLoadingState &&
                    current is ApplicationErrorState) return true;
                return false;
              },
              listener: (context, state) {
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
                  setState(() {
                    _isLoading = false;
                    _errorMessage = null;
                    _applications = state.applications;
                  });
                }
              },
              buildWhen: (previous, current) {
                // Optimize rebuilds
                if (current is ApplicationsLoadingState) {
                  return _applications.isEmpty;
                }
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
                    onRetry: () {
                      context.read<HistoryBloc>().add(const LoadHistoryEvent());
                    },
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

                // Wrap the _ApplicationListView in a ListView for scrolling
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    _ApplicationListView(applications: _applications),
                  ],
                );
              },
            ),
          ),
        ),
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
    if (applications.isEmpty) {
      return const _EmptyView();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            'Tổng hồ sơ: ${applications.length}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppTheme.textSecondary,
            ),
          ),
        ),
        ListView.builder(
          // These settings are important to make it work inside another ListView
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: applications.length,
          itemBuilder: (context, index) {
            final application = applications[index];
            return _ApplicationCard(
              key: ValueKey('app_${application.id}'),
              application: application,
            );
          },
        ),
      ],
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
            onTap: () => showApplicationDetailsSheet(context, application),
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

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }
}
