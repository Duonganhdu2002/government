import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppStyles {
  // Headings
  static const TextStyle heading1 = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 24,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static const TextStyle heading2 = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 20,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static const TextStyle heading3 = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Body text
  static const TextStyle body1 = TextStyle(
    fontSize: 16,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static const TextStyle body2 = TextStyle(
    fontSize: 14,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 12,
    color: AppColors.textLight,
    height: 1.4,
  );

  // Button text
  static const TextStyle buttonText = TextStyle(
    fontWeight: FontWeight.w600,
    fontSize: 14,
    height: 1.5,
  );

  // Link text
  static TextStyle linkText = TextStyle(
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: FontWeight.w500,
    decoration: TextDecoration.underline,
    height: 1.5,
  );

  // Form field label
  static const TextStyle formLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
    height: 1.5,
  );
}
