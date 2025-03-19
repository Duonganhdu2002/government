import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application_type.dart';
import '../../../blocs/application_type/application_type_bloc.dart';
import '../../../screens/application_type_detail_screen.dart';
import '../../../themes/app_colors.dart';
import '../../../themes/app_styles.dart';
import '../../../widgets/application_type_card.dart';
import '../../../widgets/loading_indicator.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  final TextEditingController _searchController = TextEditingController();
  ApplicationCategory? _selectedCategory;

  @override
  void initState() {
    super.initState();
    context.read<ApplicationTypeBloc>().add(const LoadApplicationTypesEvent());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            _buildSearchBar(),
            _buildCategoryFilter(),
            Expanded(
              child: BlocBuilder<ApplicationTypeBloc, ApplicationTypeState>(
                builder: (context, state) {
                  if (state is ApplicationTypesLoadingState) {
                    return const Center(
                      child: LoadingIndicator(),
                    );
                  } else if (state is ApplicationTypesLoadedState) {
                    if (_showEmptyState(state)) {
                      return _buildEmptyState();
                    }

                    return _buildApplicationTypesList(state);
                  } else if (state is ApplicationTypeErrorState) {
                    return _buildErrorState(state.message);
                  }

                  return const Center(
                    child: LoadingIndicator(),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _showEmptyState(ApplicationTypesLoadedState state) {
    if (_selectedCategory != null) {
      return state.filteredApplicationTypes?.isEmpty ?? true;
    }

    final types = _selectedCategory == null
        ? state.applicationTypes
        : state.filteredApplicationTypes ?? [];

    return types.isEmpty;
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Danh mục hồ sơ',
            style: AppStyles.heading1,
          ),
          const SizedBox(height: 8),
          Text(
            'Chọn loại hồ sơ bạn muốn nộp',
            style: AppStyles.body2,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Tìm kiếm loại hồ sơ...',
          prefixIcon: const Icon(Icons.search, color: AppColors.darkGrey),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
        onChanged: (value) {
          context.read<ApplicationTypeBloc>().add(
                SearchApplicationTypesEvent(query: value),
              );
        },
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _buildCategoryChip(null, 'Tất cả'),
          ...ApplicationCategory.values.map((category) {
            return _buildCategoryChip(category, category.displayName);
          }),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(ApplicationCategory? category, String label) {
    final isSelected = _selectedCategory == category;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCategory = category;
        });

        context.read<ApplicationTypeBloc>().add(
              FilterApplicationTypesByCategoryEvent(category: category),
            );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8, bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: AppStyles.caption.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildApplicationTypesList(ApplicationTypesLoadedState state) {
    final types = _selectedCategory == null
        ? state.applicationTypes
        : state.filteredApplicationTypes ?? [];

    if (types.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: types.length,
      itemBuilder: (context, index) {
        final applicationType = types[index];
        return ApplicationTypeCard(
          applicationType: applicationType,
          onTap: () => _onApplicationTypeSelected(applicationType),
        );
      },
    );
  }

  void _onApplicationTypeSelected(ApplicationType applicationType) {
    // Select the application type in the bloc
    context.read<ApplicationTypeBloc>().add(
          SelectApplicationTypeEvent(applicationType: applicationType),
        );

    // Navigate to application type details screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ApplicationTypeDetailScreen(
          applicationType: applicationType,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off_rounded,
            size: 80,
            color: AppColors.textLight.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'Không tìm thấy loại hồ sơ',
            style: AppStyles.heading3.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isNotEmpty
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Vui lòng thử lại sau',
            style: AppStyles.body2,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'Đã xảy ra lỗi',
            style: AppStyles.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppStyles.body2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              context.read<ApplicationTypeBloc>().add(
                    const LoadApplicationTypesEvent(),
                  );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Thử lại'),
          ),
        ],
      ),
    );
  }
}
