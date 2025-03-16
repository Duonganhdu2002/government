import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/user.dart';
import '../../../blocs/auth/auth_bloc.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'My Profile',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 24),
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthenticatedState) {
                    return _buildProfileCard(context, state.user);
                  }
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                },
              ),
              const SizedBox(height: 32),
              Text(
                'Account Settings',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              _buildSettingsItem(
                context,
                icon: Icons.edit,
                title: 'Edit Profile',
                onTap: () {},
              ),
              _buildSettingsItem(
                context,
                icon: Icons.lock,
                title: 'Change Password',
                onTap: () {},
              ),
              _buildSettingsItem(
                context,
                icon: Icons.notifications,
                title: 'Notification Settings',
                onTap: () {},
              ),
              const SizedBox(height: 32),
              Text(
                'Support',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              _buildSettingsItem(
                context,
                icon: Icons.help,
                title: 'Help & FAQ',
                onTap: () {},
              ),
              _buildSettingsItem(
                context,
                icon: Icons.contact_support,
                title: 'Contact Us',
                onTap: () {},
              ),
              _buildSettingsItem(
                context,
                icon: Icons.privacy_tip,
                title: 'Privacy Policy',
                onTap: () {},
              ),
              _buildSettingsItem(
                context,
                icon: Icons.description,
                title: 'Terms & Conditions',
                onTap: () {},
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context, User user) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: AppTheme.primaryColor,
              child: Icon(
                Icons.person,
                size: 40,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              user.fullName ?? 'User',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              user.email ?? 'No email',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (user.phoneNumber != null) ...[
              const SizedBox(height: 8),
              Text(
                user.phoneNumber!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            const SizedBox(height: 16),
            const Divider(),
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
              ),
        ),
        const SizedBox(height: 16),
        _buildInfoItem(context, 'Full Name', user.fullName ?? 'Not provided'),
        _buildInfoItem(context, 'Email', user.email ?? 'Not provided'),
        _buildInfoItem(
            context, 'Phone Number', user.phoneNumber ?? 'Not provided'),
      ],
    );
  }

  Widget _buildInfoItem(BuildContext context, String label, String value) {
    return Row(
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondaryColor,
              ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium,
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
    return ListTile(
      leading: Icon(
        icon,
        color: AppTheme.primaryColor,
      ),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }
}
