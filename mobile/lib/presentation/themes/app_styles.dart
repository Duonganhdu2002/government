import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppStyles {
  // Headings
  static final heading1 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static final heading2 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static final heading3 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  // Body text
  static final body1 = TextStyle(
    fontSize: 16,
    color: AppColors.textPrimary,
  );

  static final body2 = TextStyle(
    fontSize: 14,
    color: AppColors.textSecondary,
  );

  // Other
  static final caption = TextStyle(
    fontSize: 12,
    color: AppColors.textSecondary,
  );

  static final button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: Colors.white,
  );

  // Additional text styles
  static final subtitle1 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static final subtitle2 = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
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
