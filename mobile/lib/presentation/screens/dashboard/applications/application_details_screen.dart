import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application.dart';
import '../../../blocs/application/application_bloc.dart';

class ApplicationDetailsScreen extends StatefulWidget {
  final String applicationId;

  const ApplicationDetailsScreen({
    super.key,
    required this.applicationId,
  });

  @override
  State<ApplicationDetailsScreen> createState() =>
      _ApplicationDetailsScreenState();
}

class _ApplicationDetailsScreenState extends State<ApplicationDetailsScreen> {
  @override
  void initState() {
    super.initState();
    context
        .read<ApplicationBloc>()
        .add(LoadApplicationEvent(id: widget.applicationId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Application Details'),
      ),
      body: BlocBuilder<ApplicationBloc, ApplicationState>(
        builder: (context, state) {
          if (state is ApplicationLoadingState) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (state is ApplicationLoadedState) {
            return _buildApplicationDetails(context, state.application);
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
                    'Error loading application',
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
                      context.read<ApplicationBloc>().add(
                            LoadApplicationEvent(id: widget.applicationId),
                          );
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
      ),
      bottomNavigationBar: BlocBuilder<ApplicationBloc, ApplicationState>(
        builder: (context, state) {
          if (state is ApplicationLoadedState) {
            final application = state.application;
            return _buildBottomActions(context, application);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildApplicationDetails(
      BuildContext context, Application application) {
    final DateFormat formatter = DateFormat('MMMM dd, yyyy, hh:mm a');
    final String submittedDate = application.submittedAt != null
        ? formatter.format(application.submittedAt!)
        : 'Not submitted yet';
    final String updatedDate = formatter.format(application.updatedAt);

    Color statusColor;
    String statusText;

    switch (application.status) {
      case ApplicationStatus.draft:
        statusText = 'Draft';
        statusColor = Colors.grey;
        break;
      case ApplicationStatus.submitted:
        statusText = 'Submitted';
        statusColor = Colors.blue;
        break;
      case ApplicationStatus.inReview:
        statusText = 'In Review';
        statusColor = Colors.orange;
        break;
      case ApplicationStatus.approved:
        statusText = 'Approved';
        statusColor = Colors.green;
        break;
      case ApplicationStatus.rejected:
        statusText = 'Rejected';
        statusColor = Colors.red;
        break;
      case ApplicationStatus.completed:
        statusText = 'Completed';
        statusColor = Colors.teal;
        break;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Status: $statusText',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Spacer(),
                  Text(
                    'ID: ${application.id}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Application details
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Application Details',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const Divider(),
                  const SizedBox(height: 8),
                  _buildDetailRow(
                    context,
                    label: 'Title',
                    value: application.title,
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(
                    context,
                    label: 'Description',
                    value: application.description,
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(
                    context,
                    label: 'Submitted Date',
                    value: submittedDate,
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(
                    context,
                    label: 'Last Updated',
                    value: updatedDate,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Form Data
          if (application.formData.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Form Data',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const Divider(),
                    const SizedBox(height: 8),
                    ...application.formData.entries.map((entry) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow(
                            context,
                            label: entry.key,
                            value: entry.value.toString(),
                          ),
                          const SizedBox(height: 16),
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),

          // Attachments
          if (application.attachments.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Attachments',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const Divider(),
                    const SizedBox(height: 8),
                    ...application.attachments.map((attachment) {
                      return ListTile(
                        leading: const Icon(Icons.attachment),
                        title: Text(attachment.split('/').last),
                        trailing: const Icon(Icons.download),
                        onTap: () {
                        },
                      );
                    }),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context, {
    required String label,
    required String value,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondaryColor,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ],
    );
  }

  Widget _buildBottomActions(BuildContext context, Application application) {
    if (application.status == ApplicationStatus.draft) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                },
                child: const Text('Edit'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  context.read<ApplicationBloc>().add(
                        SubmitApplicationEvent(id: application.id),
                      );
                },
                child: const Text('Submit'),
              ),
            ),
          ],
        ),
      );
    } else if (application.status == ApplicationStatus.rejected) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: () {
          },
          child: const Text('Reapply'),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
