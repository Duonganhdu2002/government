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
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 12),
                if (applicationType.description.isNotEmpty) ...[
                  Text(
                    applicationType.description,
                    style: AppStyles.body2.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                ],
                _buildInfoRow(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Expanded(
          child: Text(
            applicationType.name,
            style: AppStyles.subtitle1.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        // Special types indicator - simplified since we don't have that property
      ],
    );
  }

  Widget _buildInfoRow() {
    return Row(
      children: [
        _buildInfoBadge(
          icon: Icons.access_time_rounded,
          text: '${applicationType.processingTimeLimit} ngày',
        ),
        const SizedBox(width: 12),
        _buildCategoryBadge(),
      ],
    );
  }

  Widget _buildInfoBadge({
    required IconData icon,
    required String text,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: AppStyles.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryBadge() {
    final categoryName = applicationType.category ?? 'Other';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: AppColors.border,
        ),
      ),
      child: Text(
        categoryName,
        style: AppStyles.caption.copyWith(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
