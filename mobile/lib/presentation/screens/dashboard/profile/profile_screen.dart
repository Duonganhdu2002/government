import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/user.dart';
import '../../../blocs/auth/auth_bloc.dart';
import 'edit_profile_screen.dart';
import 'change_password_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.medusaWhite,
      appBar: AppBar(
        backgroundColor: AppTheme.medusaWhite,
        elevation: 0,
        title: const Text(
          'Thông tin cá nhân',
          style: TextStyle(
            color: AppTheme.medusaBlack,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthenticatedState) {
                    return _buildProfileCard(context, state.user);
                  }
                  if (state is AuthLoadingState) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(50.0),
                        child: CircularProgressIndicator(
                          color: AppTheme.medusaBlack,
                        ),
                      ),
                    );
                  }
                  if (state is AuthErrorState) {
                    // If there's an authentication error, show it and provide a retry button
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            Text(
                              'Lỗi: ${state.message}',
                              style: const TextStyle(color: Colors.red),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton(
                              onPressed: () {
                                context
                                    .read<AuthBloc>()
                                    .add(const CheckAuthStatusEvent());
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.medusaBlack,
                              ),
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  // For any other state (like AuthInitialState), redirect to login
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    context.go(AppConstants.loginRoute);
                  });
                  return const SizedBox.shrink();
                },
              ),
              const SizedBox(height: 24),
              // Account Settings Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.medusaWhite,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cài đặt tài khoản',
                      style: TextStyle(
                        color: AppTheme.medusaBlack,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsItem(
                      context,
                      icon: Icons.edit_outlined,
                      title: 'Chỉnh sửa thông tin',
                      onTap: () {
                        final authState = context.read<AuthBloc>().state;
                        if (authState is AuthenticatedState) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  EditProfileScreen(user: authState.user),
                            ),
                          );
                        }
                      },
                    ),
                    const Divider(color: AppTheme.medusaLightGray),
                    _buildSettingsItem(
                      context,
                      icon: Icons.lock_outline,
                      title: 'Đổi mật khẩu',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ChangePasswordScreen(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Support Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.medusaWhite,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hỗ trợ',
                      style: TextStyle(
                        color: AppTheme.medusaBlack,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSettingsItem(
                      context,
                      icon: Icons.help_outline,
                      title: 'Trợ giúp & FAQ',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.medusaLightGray),
                    _buildSettingsItem(
                      context,
                      icon: Icons.support_agent_outlined,
                      title: 'Liên hệ hỗ trợ',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.medusaLightGray),
                    _buildSettingsItem(
                      context,
                      icon: Icons.privacy_tip_outlined,
                      title: 'Chính sách bảo mật',
                      onTap: () {},
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Logout Button
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: ElevatedButton(
                  onPressed: () {
                    // Show confirmation dialog
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text(
                          'Đăng xuất',
                          style: TextStyle(
                            color: AppTheme.medusaBlack,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        content: const Text(
                          'Bạn có chắc chắn muốn đăng xuất không?',
                          style: TextStyle(color: AppTheme.medusaDarkGray),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text(
                              'Hủy',
                              style: TextStyle(color: AppTheme.medusaGray),
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              context.read<AuthBloc>().add(const LogoutEvent());
                              context.go(AppConstants.loginRoute);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.medusaBlack,
                            ),
                            child: const Text('Đăng xuất'),
                          ),
                        ],
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.medusaBlack,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Đăng xuất',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context, User user) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        gradient: AppTheme.medusaGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Profile Avatar
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.medusaLightGray,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                _getInitials(user.fullName ?? 'User'),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.medusaBlack,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Full Name
          Text(
            user.fullName ?? 'Người dùng',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          // Username
          Text(
            '@${user.username ?? ''}',
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 8),
          // Email
          Text(
            user.email ?? 'Chưa có email',
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
          // Phone Number
          if (user.phoneNumber != null) ...[
            const SizedBox(height: 4),
            Text(
              user.phoneNumber!,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
          ],
          const SizedBox(height: 24),
          // Personal Information
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Thông tin chi tiết',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                _buildInfoRow('Loại tài khoản', 'Công dân'),
                const SizedBox(height: 8),
                _buildInfoRow('Họ tên', user.fullName ?? 'Chưa cung cấp'),
                const SizedBox(height: 8),
                _buildInfoRow('Email', user.email ?? 'Chưa cung cấp'),
                const SizedBox(height: 8),
                _buildInfoRow(
                    'Số điện thoại', user.phoneNumber ?? 'Chưa cung cấp'),
                const SizedBox(height: 8),
                _buildInfoRow('Địa chỉ', user.address ?? 'Chưa cung cấp'),
                const SizedBox(height: 8),
                _buildInfoRow('Số CCCD/CMND',
                    user.identificationNumber ?? 'Chưa cung cấp'),
                const SizedBox(height: 8),
                _buildInfoRow('Ngày sinh', '31/12/1989'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0),
        child: Row(
          children: [
            Icon(
              icon,
              color: AppTheme.medusaBlack,
              size: 22,
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                color: AppTheme.medusaDarkGray,
              ),
            ),
            const Spacer(),
            const Icon(
              Icons.arrow_forward_ios,
              color: AppTheme.medusaGray,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'U';

    final nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return '${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}';
    }
    return name.substring(0, 1).toUpperCase();
  }
}
