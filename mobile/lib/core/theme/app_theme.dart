import 'package:flutter/material.dart';

class AppTheme {
  // Main colors
  static const Color primaryColor = Color(0xFF2C2C2C);
  static const Color secondaryColor = Color(0xFF4A4A4A);
  static const Color backgroundColor = Colors.white;
  static const Color cardColor = Colors.white;

  // Text colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF6E6E6E);
  static const Color textLight = Color(0xFF9E9E9E);

  // Status colors - using grayscale
  static const Color statusDraft = Color(0xFFAAAAAA);
  static const Color statusSubmitted = Color(0xFF707070);
  static const Color statusInReview = Color(0xFF505050);
  static const Color statusApproved = Color(0xFF303030);
  static const Color statusRejected = Color(0xFF1A1A1A);

  // Gradient - subtle gray gradient
  static const Gradient subtleGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFF5F5F5),
      Color(0xFFEEEEEE),
      Color(0xFFE0E0E0),
    ],
  );

  // Old Medusa color constants for backward compatibility in const contexts
  static const Color medusaBlack = Color(0xFF2C2C2C);
  static const Color medusaWhite = Colors.white;
  static const Color medusaGray = Color(0xFF6E6E6E);
  static const Color medusaDarkGray = Color(0xFF4A4A4A);
  static const Color medusaLightGray = Color(0xFF9E9E9E);

  // Old text color constants
  static const Color textSecondaryColor = Color(0xFF6E6E6E);
  static const Color errorColor = Color(0xFF8B0000);
  static const Color successColor = Color(0xFF006400);

  // Compatibility getters for non-const contexts
  static Gradient get medusaGradient => subtleGradient;

  static ThemeData lightTheme() {
    return ThemeData(
      primaryColor: primaryColor,
      cardColor: cardColor,
      scaffoldBackgroundColor: Color(0xFFF5F5F5),
      appBarTheme: const AppBarTheme(
        color: backgroundColor,
        iconTheme: IconThemeData(color: primaryColor),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: TextStyle(
          color: textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
        bodyLarge: TextStyle(
          color: textPrimary,
          fontSize: 16,
        ),
        bodyMedium: TextStyle(
          color: textSecondary,
          fontSize: 14,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFEEEEEE),
        thickness: 1,
      ),
      cardTheme: CardTheme(
        color: cardColor,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
