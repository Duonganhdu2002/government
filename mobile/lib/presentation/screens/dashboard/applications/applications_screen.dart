import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application.dart';
import '../../../blocs/application/application_bloc.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // Load applications when the screen initializes
    context.read<ApplicationBloc>().add(const LoadApplicationsEvent());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'My Applications',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            TabBar(
              controller: _tabController,
              labelColor: AppTheme.primaryColor,
              unselectedLabelColor: AppTheme.textSecondaryColor,
              indicatorColor: AppTheme.primaryColor,
              tabs: const [
                Tab(text: 'In Progress'),
                Tab(text: 'Completed'),
                Tab(text: 'All'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildApplicationList(context, status: 'in_progress'),
                  _buildApplicationList(context, status: 'completed'),
                  _buildApplicationList(context, status: 'all'),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
        },
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildApplicationList(BuildContext context, {required String status}) {
    return BlocBuilder<ApplicationBloc, ApplicationState>(
      builder: (context, state) {
        if (state is ApplicationsLoadingState) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        } else if (state is ApplicationsLoadedState) {
          final applications = state.applications;

          // Filter applications based on status
          List<Application> filteredApplications = applications;
          if (status != 'all') {
            filteredApplications = applications.where((app) {
              if (status == 'in_progress') {
                return app.status == ApplicationStatus.draft ||
                    app.status == ApplicationStatus.submitted ||
                    app.status == ApplicationStatus.inReview;
              } else if (status == 'completed') {
                return app.status == ApplicationStatus.approved ||
                    app.status == ApplicationStatus.rejected ||
                    app.status == ApplicationStatus.completed;
              }
              return true;
            }).toList();
          }

          if (filteredApplications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.description_outlined,
                    size: 64,
                    color: AppTheme.textSecondaryColor.withOpacity(0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No applications found',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {
                    },
                    child: const Text('Create New Application'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredApplications.length,
            itemBuilder: (context, index) {
              final application = filteredApplications[index];
              return _buildApplicationCard(context, application);
            },
          );
        } else if (state is ApplicationErrorState) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: AppTheme.errorColor.withOpacity(0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  'Error loading applications',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  state.message,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondaryColor,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    context
                        .read<ApplicationBloc>()
                        .add(const LoadApplicationsEvent());
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );
  }

  Widget _buildApplicationCard(BuildContext context, Application application) {
    final DateFormat formatter = DateFormat('dd MMM yyyy');
    final String submittedDate = application.submittedAt != null
        ? formatter.format(application.submittedAt!)
        : 'Not submitted';

    String statusText;
    Color statusColor;
    IconData statusIcon;

    switch (application.status) {
      case ApplicationStatus.draft:
        statusText = 'Draft';
        statusColor = Colors.grey;
        statusIcon = Icons.edit;
        break;
      case ApplicationStatus.submitted:
        statusText = 'Submitted';
        statusColor = Colors.blue;
        statusIcon = Icons.send;
        break;
      case ApplicationStatus.inReview:
        statusText = 'In Review';
        statusColor = Colors.orange;
        statusIcon = Icons.pending;
        break;
      case ApplicationStatus.approved:
        statusText = 'Approved';
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case ApplicationStatus.rejected:
        statusText = 'Rejected';
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      case ApplicationStatus.completed:
        statusText = 'Completed';
        statusColor = Colors.teal;
        statusIcon = Icons.task_alt;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          context.go('${AppConstants.applicationsRoute}/${application.id}');
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      application.title,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          statusIcon,
                          size: 16,
                          color: statusColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          statusText,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: statusColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                application.description,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Submitted: $submittedDate',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                  ),
                  Text(
                    'ID: ${application.id}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
