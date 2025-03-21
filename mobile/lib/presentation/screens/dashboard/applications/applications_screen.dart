// ignore_for_file: use_build_context_synchronously, duplicate_ignore

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../domain/entities/application_type.dart';
import '../../../blocs/application_type/application_type_bloc.dart';
import '../../../screens/application_type_detail_screen.dart';
import '../../../themes/app_colors.dart';
import '../../../themes/app_styles.dart';
import '../../../widgets/application_type_card.dart';
import '../../../widgets/new_application_bottom_sheet.dart';

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

    // Check if there's already a loaded state before triggering new events
    final applicationTypeState = context.read<ApplicationTypeBloc>().state;

    if (applicationTypeState is! ApplicationTypesLoadedState) {
      // Only load application types if they aren't already loaded
      context
          .read<ApplicationTypeBloc>()
          .add(const LoadApplicationTypesEvent());

      // Wait for application types to load, then load all special types
      Future.delayed(const Duration(milliseconds: 500), () {
        // ignore: duplicate_ignore
        // ignore: use_build_context_synchronously
        context
            .read<ApplicationTypeBloc>()
            .add(const LoadAllSpecialApplicationTypesEvent());
      });
    } else if (!applicationTypeState.allSpecialTypesLoaded) {
      // If app types are loaded but special types aren't, only load special types
      context
          .read<ApplicationTypeBloc>()
          .add(const LoadAllSpecialApplicationTypesEvent());
    }
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
                      child: CircularProgressIndicator(
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    );
                  } else if (state is ApplicationTypesLoadedState) {
                    // Show a small loading indicator for special types if needed
                    if (!state.allSpecialTypesLoaded) {
                      return Stack(
                        children: [
                          _showEmptyState(state)
                              ? _buildEmptyState()
                              : _buildApplicationTypesList(state),
                          Positioned(
                            bottom: 16,
                            right: 16,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.white),
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Đang tải dữ liệu...',
                                    style: AppStyles.caption
                                        .copyWith(color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    }

                    if (_showEmptyState(state)) {
                      return _buildEmptyState();
                    }

                    return _buildApplicationTypesList(state);
                  } else if (state is ApplicationTypeErrorState) {
                    return _buildErrorState(state.message);
                  }

                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
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
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Danh mục hồ sơ',
            style: AppStyles.heading1.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Chọn loại hồ sơ bạn muốn nộp',
            style: AppStyles.body2.copyWith(
              color: AppColors.textSecondary,
            ),
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
          hintStyle: TextStyle(color: AppColors.textLight),
          prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
          filled: true,
          fillColor: AppColors.surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.border, width: 1),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.border, width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.primary, width: 1),
          ),
          contentPadding:
              const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        ),
        style: TextStyle(color: AppColors.textPrimary),
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
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
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
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: AppStyles.subtitle2.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
            fontSize: 13,
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
    // Check if special types are already loaded in the bloc state
    final applicationTypeState = context.read<ApplicationTypeBloc>().state;
    bool specialTypesAlreadyLoaded = false;

    if (applicationTypeState is ApplicationTypesLoadedState &&
        applicationTypeState.allSpecialTypesLoaded &&
        applicationTypeState.specialTypesCache
            .containsKey(applicationType.id)) {
      specialTypesAlreadyLoaded = true;
    }

    // Select the application type in the bloc
    context.read<ApplicationTypeBloc>().add(
          SelectApplicationTypeEvent(
            applicationType: applicationType,
          ),
        );

    // If has special types, navigate to details screen
    if (specialTypesAlreadyLoaded &&
        applicationTypeState is ApplicationTypesLoadedState &&
        (applicationTypeState
                .specialTypesCache[applicationType.id]?.isNotEmpty ??
            false)) {
      // Navigate to application type details screen to show special types
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ApplicationTypeDetailScreen(
            applicationType: applicationType,
          ),
        ),
      ).then((_) {
        // When returning from details screen, make sure we're still in the ApplicationTypesLoadedState
        // to prevent reloading everything from API
        // ignore: duplicate_ignore
        // ignore: use_build_context_synchronously
        if (context.read<ApplicationTypeBloc>().state
            is! ApplicationTypesLoadedState) {
          // If we've lost our loaded state, recover it from the previous state
          // ignore: use_build_context_synchronously
          if (context.read<ApplicationTypeBloc>().state
              is ApplicationTypeSelectedState) {
            final selectedState = context.read<ApplicationTypeBloc>().state
                as ApplicationTypeSelectedState;
            // Go back to the previous list state
            context
                .read<ApplicationTypeBloc>()
                // ignore: invalid_use_of_visible_for_testing_member
                .emit(selectedState.previousState);
          }
        }
      });
    } else {
      // Show bottom sheet directly if no special types
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => NewApplicationBottomSheet(
          applicationType: applicationType,
          specialApplicationType: null,
        ),
      );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off_rounded,
            size: 64,
            color: AppColors.textLight,
          ),
          const SizedBox(height: 24),
          Text(
            'Không tìm thấy loại hồ sơ',
            style: AppStyles.heading3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              _searchController.text.isNotEmpty
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Vui lòng thử lại sau',
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
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
            color: AppColors.primary,
          ),
          const SizedBox(height: 24),
          Text(
            'Đã xảy ra lỗi',
            style: AppStyles.heading3.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              message,
              style: AppStyles.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: 180,
            child: ElevatedButton(
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
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text('Thử lại'),
            ),
          ),
        ],
      ),
    );
  }
}
