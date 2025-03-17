import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/user.dart';
import '../../../blocs/auth/auth_bloc.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'My Profile',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 24),
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthenticatedState) {
                    return _buildProfileCard(context, state.user);
                  }
                  return const Center(
                    child: CircularProgressIndicator(
                      color: Colors.black,
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
              Text(
                'Account Settings',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              _buildSettingsCard(context),
              const SizedBox(height: 32),
              Text(
                'Support',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              _buildSupportCard(context),
              const SizedBox(height: 32),
              _buildLogoutButton(context),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context, User user) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: Colors.blue[600],
              child: const Icon(
                Icons.person,
                size: 40,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              user.fullName ?? 'User',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              user.email ?? 'No email',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            if (user.phoneNumber != null) ...[
              const SizedBox(height: 8),
              Text(
                user.phoneNumber!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
            const SizedBox(height: 16),
            const Divider(color: Colors.grey),
            const SizedBox(height: 16),
            _buildPersonalInfoSection(context, user),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalInfoSection(BuildContext context, User user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Personal Information',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
        ),
        const SizedBox(height: 16),
        _buildInfoItem(context, 'Full Name', user.fullName ?? 'Not provided'),
        const SizedBox(height: 8),
        _buildInfoItem(context, 'Email', user.email ?? 'Not provided'),
        const SizedBox(height: 8),
        _buildInfoItem(
            context, 'Phone Number', user.phoneNumber ?? 'Not provided'),
      ],
    );
  }

  Widget _buildInfoItem(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.black,
              ),
        ),
      ],
    );
  }

  Widget _buildSettingsCard(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      color: Colors.white,
      child: Column(
        children: [
          _buildSettingsItem(
            context,
            icon: Icons.edit,
            title: 'Edit Profile',
            onTap: () {},
          ),
          Divider(color: Colors.grey[200], height: 1),
          _buildSettingsItem(
            context,
            icon: Icons.lock,
            title: 'Change Password',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSupportCard(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      color: Colors.white,
      child: Column(
        children: [
          _buildSettingsItem(
            context,
            icon: Icons.help,
            title: 'Help & FAQ',
            onTap: () {},
          ),
          Divider(color: Colors.grey[200], height: 1),
          _buildSettingsItem(
            context,
            icon: Icons.contact_support,
            title: 'Contact Us',
            onTap: () {},
          ),
          Divider(color: Colors.grey[200], height: 1),
          _buildSettingsItem(
            context,
            icon: Icons.privacy_tip,
            title: 'Privacy Policy',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: Colors.black,
        size: 20,
      ),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing:
          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.black),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          context.read<AuthBloc>().add(const LogoutEvent());
          context.go(AppConstants.loginRoute);
        },
        style: ElevatedButton.styleFrom(
          foregroundColor: Colors.white,
          backgroundColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
          elevation: 0,
        ),
        child: const Text(
          'Đăng xuất',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
