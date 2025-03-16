import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy data for demonstration
    final List<Map<String, dynamic>> historyItems = [
      {
        'title': 'Business Permit Application',
        'date': DateTime.now().subtract(const Duration(days: 2)),
        'status': 'Approved',
        'id': 'APP-20240316-001',
      },
      {
        'title': 'Driver\'s License Renewal',
        'date': DateTime.now().subtract(const Duration(days: 8)),
        'status': 'Completed',
        'id': 'APP-20240310-023',
      },
      {
        'title': 'Building Permit Application',
        'date': DateTime.now().subtract(const Duration(days: 15)),
        'status': 'Rejected',
        'id': 'APP-20240303-045',
      },
      {
        'title': 'Birth Certificate Request',
        'date': DateTime.now().subtract(const Duration(days: 30)),
        'status': 'Completed',
        'id': 'APP-20240218-078',
      },
      {
        'title': 'Tax Clearance Certificate',
        'date': DateTime.now().subtract(const Duration(days: 45)),
        'status': 'Completed',
        'id': 'APP-20240203-112',
      },
    ];

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'History',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Your recent application history',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondaryColor,
                    ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.builder(
                  itemCount: historyItems.length,
                  itemBuilder: (context, index) {
                    final item = historyItems[index];
                    return _buildHistoryItem(context, item);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryItem(BuildContext context, Map<String, dynamic> item) {
    final DateFormat formatter = DateFormat('MMM dd, yyyy');
    final String formattedDate = formatter.format(item['date'] as DateTime);

    Color statusColor;
    IconData statusIcon;

    switch (item['status']) {
      case 'Approved':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'Rejected':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      case 'Completed':
        statusColor = AppTheme.primaryColor;
        statusIcon = Icons.task_alt;
        break;
      default:
        statusColor = Colors.orange;
        statusIcon = Icons.pending;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          item['title'] as String,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              'Date: $formattedDate',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 2),
            Text(
              'Ref: ${item['id']}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              statusIcon,
              color: statusColor,
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              item['status'] as String,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        onTap: () {
        },
      ),
    );
  }
}
