import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/application_type.dart';
import '../../domain/entities/special_application_type.dart';
import '../blocs/application_type/application_type_bloc.dart';
import '../widgets/special_application_types_list.dart';
import '../widgets/new_application_bottom_sheet.dart';

class ApplicationTypeDetailScreen extends StatefulWidget {
  final ApplicationType applicationType;

  const ApplicationTypeDetailScreen({
    super.key,
    required this.applicationType,
  });

  @override
  State<ApplicationTypeDetailScreen> createState() =>
      _ApplicationTypeDetailScreenState();
}

class _ApplicationTypeDetailScreenState
    extends State<ApplicationTypeDetailScreen> {
  @override
  void initState() {
    super.initState();

    // Check if special types are already in the bloc's cache
    final applicationTypeState = context.read<ApplicationTypeBloc>().state;

    // Only load special types if they aren't already loaded
    bool shouldLoadSpecialTypes = true;

    if (applicationTypeState is ApplicationTypesLoadedState &&
        applicationTypeState.allSpecialTypesLoaded &&
        applicationTypeState.specialTypesCache
            .containsKey(widget.applicationType.id)) {
      // Special types already in cache, no need to load again
      shouldLoadSpecialTypes = false;
    } else if (applicationTypeState is ApplicationTypeSelectedState &&
        !applicationTypeState.loadingSpecialTypes &&
        applicationTypeState.specialApplicationTypes.isNotEmpty) {
      // Already have special types in the selected state
      shouldLoadSpecialTypes = false;
    }

    // Only load if needed
    if (shouldLoadSpecialTypes) {
      // Load special application types for this application type
      Future.microtask(() {
        // ignore: use_build_context_synchronously
        context.read<ApplicationTypeBloc>().add(
              LoadSpecialApplicationTypesEvent(
                applicationTypeId: widget.applicationType.id,
              ),
            );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.applicationType.name),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Application type details card
              InkWell(
                onTap: () => _showNewApplicationBottomSheet(
                    context, widget.applicationType, null),
                child: Card(
                  elevation: 3,
                  margin: const EdgeInsets.only(bottom: 16.0),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.applicationType.name,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8.0),
                        Text(
                          widget.applicationType.description,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 12.0),
                        _buildProcessingTimeInfo(widget.applicationType),
                      ],
                    ),
                  ),
                ),
              ),

              // Section for special application types
              Text(
                'Các loại hồ sơ đặc biệt',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8.0),

              SpecialApplicationTypesList(
                applicationTypeId: widget.applicationType.id,
                applicationTypeName: widget.applicationType.name,
                onSelected: _onSpecialTypeSelected,
              ),

              const SizedBox(height: 24.0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProcessingTimeInfo(ApplicationType type) {
    final theme = Theme.of(context);
    final hasRange = type.processingTimeRange != null;

    if (!hasRange) {
      return Row(
        children: [
          const Icon(Icons.timer_outlined, size: 18),
          const SizedBox(width: 4),
          Text(
            'Thời gian xử lý: ${type.processingTimeLimit} ngày',
            style: theme.textTheme.bodyMedium,
          ),
        ],
      );
    }

    final range = type.processingTimeRange!;
    final isSameTime = range.min == range.max;

    if (isSameTime) {
      return Row(
        children: [
          const Icon(Icons.timer_outlined, size: 18),
          const SizedBox(width: 4),
          Text(
            'Thời gian xử lý: ${range.min} ngày',
            style: theme.textTheme.bodyMedium,
          ),
        ],
      );
    }

    return Row(
      children: [
        const Icon(Icons.timer_outlined, size: 18),
        const SizedBox(width: 4),
        Text(
          'Thời gian xử lý: ${range.min} - ${range.max} ngày',
          style: theme.textTheme.bodyMedium,
        ),
      ],
    );
  }

  void _onSpecialTypeSelected(SpecialApplicationType specialType) {
    // Select the special application type in the bloc
    context.read<ApplicationTypeBloc>().add(
          SelectSpecialApplicationTypeEvent(
              specialApplicationType: specialType),
        );

    // Show bottom sheet with the selected special type
    _showNewApplicationBottomSheet(
        context, widget.applicationType, specialType);
  }

  void _showNewApplicationBottomSheet(
    BuildContext context,
    ApplicationType applicationType,
    SpecialApplicationType? specialApplicationType,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => NewApplicationBottomSheet(
        applicationType: applicationType,
        specialApplicationType: specialApplicationType,
      ),
    );
  }
}
