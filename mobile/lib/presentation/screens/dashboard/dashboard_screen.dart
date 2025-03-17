import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../widgets/app_bottom_navigation.dart';

class DashboardScreen extends StatefulWidget {
  final Widget child;

  const DashboardScreen({
    super.key,
    required this.child,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).uri.path;
    final currentIndex = _getCurrentIndex(currentPath);

    return Scaffold(
      body: widget.child,
      drawer: _buildDrawer(context),
      floatingActionButton: _buildFloatingActionButton(context),
      bottomNavigationBar: AppBottomNavigation(currentIndex: currentIndex),
    );
  }

  int _getCurrentIndex(String currentPath) {
    if (currentPath == AppConstants.homeRoute) {
      return 0;
    } else if (currentPath.startsWith(AppConstants.applicationsRoute)) {
      return 1;
    } else if (currentPath == AppConstants.guidesRoute) {
      return 2;
    } else if (currentPath == AppConstants.profileRoute) {
      return 3;
    } else {
      return 0; // Home as default
    }
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is AuthenticatedState) {
                  return Text(state.user.fullName ?? 'User');
                }
                return const Text('Guest User');
              },
            ),
            accountEmail: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is AuthenticatedState) {
                  return Text(state.user.email ?? 'No email');
                }
                return const Text('guest@example.com');
              },
            ),
            currentAccountPicture: const CircleAvatar(
              child: Icon(Icons.person),
            ),
            decoration: BoxDecoration(
              color: AppTheme.medusaBlack,
            ),
          ),
          _buildDrawerItem(
            context,
            icon: Icons.home,
            title: 'Trang chủ',
            route: AppConstants.homeRoute,
          ),
          _buildDrawerItem(
            context,
            icon: Icons.person,
            title: 'Tài khoản',
            route: AppConstants.profileRoute,
          ),
          _buildDrawerItem(
            context,
            icon: Icons.history,
            title: 'Lịch sử',
            route: AppConstants.historyRoute,
          ),
          _buildDrawerItem(
            context,
            icon: Icons.description,
            title: 'Hồ sơ',
            route: AppConstants.applicationsRoute,
          ),
          _buildDrawerItem(
            context,
            icon: Icons.help,
            title: 'Dịch vụ',
            route: AppConstants.guidesRoute,
          ),
          const Divider(),
          _buildDrawerItem(
            context,
            icon: Icons.settings,
            title: 'Cài đặt',
            onTap: () {},
          ),
          _buildDrawerItem(
            context,
            icon: Icons.logout,
            title: 'Đăng xuất',
            onTap: () {
              Navigator.pop(context); // Close the drawer
              context.read<AuthBloc>().add(const LogoutEvent());
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? route,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: onTap ??
          () {
            Navigator.pop(context); // Close the drawer
            if (route != null) {
              context.go(route);
            }
          },
    );
  }

  Widget? _buildFloatingActionButton(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.path;

    if (currentRoute == AppConstants.applicationsRoute) {
      return FloatingActionButton(
        onPressed: () {},
        tooltip: 'Tạo hồ sơ mới',
        child: const Icon(Icons.add),
      );
    }

    return null;
  }
}
