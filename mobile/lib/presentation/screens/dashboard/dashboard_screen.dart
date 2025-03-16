import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../blocs/auth/auth_bloc.dart';

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Government Services'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(const LogoutEvent());
            },
          ),
        ],
      ),
      body: widget.child,
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              accountName: BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthenticatedState) {
                    return Text(state.user.fullName);
                  }
                  return const Text('Guest User');
                },
              ),
              accountEmail: BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthenticatedState) {
                    return Text(state.user.email);
                  }
                  return const Text('guest@example.com');
                },
              ),
              currentAccountPicture: const CircleAvatar(
                child: Icon(Icons.person),
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            _buildDrawerItem(
              context,
              icon: Icons.person,
              title: 'Profile',
              route: AppConstants.profileRoute,
            ),
            _buildDrawerItem(
              context,
              icon: Icons.history,
              title: 'History',
              route: AppConstants.historyRoute,
            ),
            _buildDrawerItem(
              context,
              icon: Icons.description,
              title: 'Applications',
              route: AppConstants.applicationsRoute,
            ),
            _buildDrawerItem(
              context,
              icon: Icons.help,
              title: 'Guides',
              route: AppConstants.guidesRoute,
            ),
            const Divider(),
            _buildDrawerItem(
              context,
              icon: Icons.settings,
              title: 'Settings',
              onTap: () {
              },
            ),
            _buildDrawerItem(
              context,
              icon: Icons.logout,
              title: 'Logout',
              onTap: () {
                Navigator.pop(context); // Close the drawer
                context.read<AuthBloc>().add(const LogoutEvent());
              },
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(context),
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
        onPressed: () {
        },
        tooltip: 'Create Application',
        child: const Icon(Icons.add),
      );
    }

    return null;
  }
}
