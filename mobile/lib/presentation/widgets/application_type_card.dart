import 'package:flutter/material.dart';

import '../../domain/entities/application_type.dart';
import '../themes/app_colors.dart';
import '../themes/app_styles.dart';

class ApplicationTypeCard extends StatelessWidget {
  final ApplicationType applicationType;
  final VoidCallback onTap;

  const ApplicationTypeCard({
    super.key,
    required this.applicationType,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    applicationType.name,
                    style: AppStyles.heading2.copyWith(fontSize: 16),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    applicationType.description,
                    style: AppStyles.body2,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _buildInfoBadge(
                        Icons.access_time,
                        _getProcessingTimeText(applicationType),
                      ),
                      const SizedBox(width: 12),
                      _buildCategoryBadge(
                        context,
                        assignCategoryToType(applicationType).displayName,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final category = assignCategoryToType(applicationType);
    Color headerColor;

    // Assign color based on category
    switch (category) {
      case ApplicationCategory.personal:
        headerColor = AppColors.primary.withOpacity(0.9);
        break;
      case ApplicationCategory.legal:
        headerColor = Colors.indigo.shade700;
        break;
      case ApplicationCategory.property:
        headerColor = Colors.green.shade700;
        break;
      case ApplicationCategory.business:
        headerColor = Colors.amber.shade700;
        break;
      case ApplicationCategory.social:
        headerColor = Colors.purple.shade700;
        break;
      case ApplicationCategory.other:
      default:
        headerColor = Colors.grey.shade700;
        break;
    }

    return Container(
      height: 8,
      decoration: BoxDecoration(
        color: headerColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
      ),
    );
  }

  Widget _buildInfoBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.lightGrey,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: AppColors.darkGrey,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppStyles.caption.copyWith(
              color: AppColors.darkGrey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryBadge(BuildContext context, String category) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        category,
        style: AppStyles.caption.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _getProcessingTimeText(ApplicationType type) {
    final hasRange = type.processingTimeRange != null;

    if (!hasRange) {
      return '${type.processingTimeLimit} ngày';
    }

    final range = type.processingTimeRange!;
    final isSameTime = range.min == range.max;

    if (isSameTime) {
      return '${range.min} ngày';
    }

    return '${range.min} - ${range.max} ngày';
  }
}
