import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/special_application_type.dart';
import '../blocs/application_type/application_type_bloc.dart';
import 'loading_indicator.dart';

class SpecialApplicationTypesList extends StatelessWidget {
  final int applicationTypeId;
  final String applicationTypeName;
  final Function(SpecialApplicationType) onSelected;

  const SpecialApplicationTypesList({
    super.key,
    required this.applicationTypeId,
    required this.applicationTypeName,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ApplicationTypeBloc, ApplicationTypeState>(
      builder: (context, state) {
        // Check for all possible states that could have special types
        if (state is ApplicationTypesLoadedState &&
            state.allSpecialTypesLoaded) {
          // If all special types are loaded, get them from the cache
          final specialTypes = state.specialTypesCache[applicationTypeId] ?? [];
          return _buildSpecialTypesList(context, specialTypes);
        } else if (state is SpecialApplicationTypesLoadingState) {
          return const Center(child: LoadingIndicator());
        } else if (state is SpecialApplicationTypesLoadedState &&
            state.applicationTypeId == applicationTypeId) {
          final specialTypes = state.specialApplicationTypes;
          return _buildSpecialTypesList(context, specialTypes);
        } else if (state is ApplicationTypeSelectedState &&
            state.applicationType.id == applicationTypeId) {
          if (state.loadingSpecialTypes) {
            return const Center(child: LoadingIndicator());
          }

          final specialTypes = state.specialApplicationTypes;
          return _buildSpecialTypesList(context, specialTypes);
        } else {
          // Trigger loading of special application types if not already loaded
          // This should only happen if we somehow missed the preloading
          Future.microtask(() {
            // ignore: use_build_context_synchronously
            context.read<ApplicationTypeBloc>().add(
                LoadSpecialApplicationTypesEvent(
                    applicationTypeId: applicationTypeId));
          });

          return const Center(child: LoadingIndicator());
        }
      },
    );
  }

  Widget _buildSpecialTypesList(
      BuildContext context, List<SpecialApplicationType> specialTypes) {
    if (specialTypes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Không có loại hồ sơ đặc biệt cho $applicationTypeName',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: specialTypes.length,
      itemBuilder: (context, index) {
        final specialType = specialTypes[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
          elevation: 2.0,
          child: ListTile(
            title: Text(specialType.name),
            subtitle: Text(
              'Thời gian xử lý: ${specialType.processingTimeLimit} ngày',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => onSelected(specialType),
          ),
        );
      },
    );
  }
}
