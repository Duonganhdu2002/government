import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/usecase.dart';
import '../../../domain/entities/application_type.dart';
import '../../../domain/entities/special_application_type.dart';
import '../../../domain/usecases/application_type/get_application_types_usecase.dart';
import '../../../domain/usecases/application_type/get_application_type_by_id_usecase.dart';
import '../../../domain/usecases/application_type/get_special_application_types_usecase.dart';

part 'application_type_event.dart';
part 'application_type_state.dart';

class ApplicationTypeBloc
    extends Bloc<ApplicationTypeEvent, ApplicationTypeState> {
  final GetApplicationTypesUseCase getApplicationTypesUseCase;
  final GetApplicationTypeByIdUseCase getApplicationTypeByIdUseCase;
  final GetSpecialApplicationTypesUseCase getSpecialApplicationTypesUseCase;

  ApplicationTypeBloc({
    required this.getApplicationTypesUseCase,
    required this.getApplicationTypeByIdUseCase,
    required this.getSpecialApplicationTypesUseCase,
  }) : super(ApplicationTypeInitialState()) {
    on<LoadApplicationTypesEvent>(_onLoadApplicationTypes);
    on<LoadApplicationTypeEvent>(_onLoadApplicationType);
    on<LoadSpecialApplicationTypesEvent>(_onLoadSpecialApplicationTypes);
    on<SearchApplicationTypesEvent>(_onSearchApplicationTypes);
    on<FilterApplicationTypesByCategoryEvent>(
        _onFilterApplicationTypesByCategory);
    on<SelectApplicationTypeEvent>(_onSelectApplicationType);
    on<SelectSpecialApplicationTypeEvent>(_onSelectSpecialApplicationType);
  }

  Future<void> _onLoadApplicationTypes(
    LoadApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    emit(ApplicationTypesLoadingState());

    final result = await getApplicationTypesUseCase(NoParams());

    result.fold(
      (failure) => emit(ApplicationTypeErrorState(message: failure.message)),
      (applicationTypes) {
        // Group by category
        final Map<ApplicationCategory, List<ApplicationType>> groupedTypes = {};

        for (final type in applicationTypes) {
          final category = assignCategoryToType(type);
          if (!groupedTypes.containsKey(category)) {
            groupedTypes[category] = [];
          }
          groupedTypes[category]!.add(type);
        }

        emit(ApplicationTypesLoadedState(
          applicationTypes: applicationTypes,
          groupedApplicationTypes: groupedTypes,
        ));
      },
    );
  }

  Future<void> _onLoadApplicationType(
    LoadApplicationTypeEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    emit(ApplicationTypeLoadingState());

    final result = await getApplicationTypeByIdUseCase(
      GetApplicationTypeByIdParams(id: event.id),
    );

    result.fold(
      (failure) => emit(ApplicationTypeErrorState(message: failure.message)),
      (applicationType) {
        emit(ApplicationTypeLoadedState(applicationType: applicationType));

        // After loading the application type, also load its special types
        add(LoadSpecialApplicationTypesEvent(
            applicationTypeId: applicationType.id));
      },
    );
  }

  Future<void> _onLoadSpecialApplicationTypes(
    LoadSpecialApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    // Set loading state for special types, but preserve existing state
    if (state is ApplicationTypeLoadedState) {
      final currentState = state as ApplicationTypeLoadedState;
      emit(ApplicationTypeLoadedState(
        applicationType: currentState.applicationType,
        loadingSpecialTypes: true,
      ));
    } else if (state is ApplicationTypesLoadedState) {
      emit(SpecialApplicationTypesLoadingState(
          previousState: state as ApplicationTypesLoadedState));
    }

    final result = await getSpecialApplicationTypesUseCase(
      GetSpecialApplicationTypesParams(
          applicationTypeId: event.applicationTypeId),
    );

    result.fold(
      (failure) {
        if (state is ApplicationTypeLoadedState) {
          // In case of error, set empty list to avoid blocking the UI
          final currentState = state as ApplicationTypeLoadedState;
          emit(ApplicationTypeLoadedState(
            applicationType: currentState.applicationType,
            specialApplicationTypes: const [],
            loadingSpecialTypes: false,
          ));
        } else if (state is SpecialApplicationTypesLoadingState) {
          final previousState =
              (state as SpecialApplicationTypesLoadingState).previousState;
          emit(previousState);
        }
      },
      (specialTypes) {
        if (state is ApplicationTypeLoadedState) {
          final currentState = state as ApplicationTypeLoadedState;
          emit(ApplicationTypeLoadedState(
            applicationType: currentState.applicationType,
            specialApplicationTypes: specialTypes,
            loadingSpecialTypes: false,
          ));
        } else if (state is SpecialApplicationTypesLoadingState) {
          final previousState =
              (state as SpecialApplicationTypesLoadingState).previousState;
          emit(SpecialApplicationTypesLoadedState(
            applicationTypes: previousState.applicationTypes,
            filteredApplicationTypes: previousState.filteredApplicationTypes,
            groupedApplicationTypes: previousState.groupedApplicationTypes,
            selectedCategory: previousState.selectedCategory,
            searchQuery: previousState.searchQuery,
            applicationTypeId: event.applicationTypeId,
            specialApplicationTypes: specialTypes,
          ));
        }
      },
    );
  }

  void _onSearchApplicationTypes(
    SearchApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) {
    // Get the current list of application types
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;
      final allTypes = currentState.applicationTypes;

      if (event.query.isEmpty) {
        emit(ApplicationTypesLoadedState(
          applicationTypes: allTypes,
          groupedApplicationTypes: currentState.groupedApplicationTypes,
        ));
        return;
      }

      // Normalize query to handle Vietnamese accents
      final normalizedQuery = _normalizeString(event.query);

      // Filter types based on search query
      final filteredTypes = allTypes.where((type) {
        final normalizedName = _normalizeString(type.name);
        final normalizedDescription = _normalizeString(type.description);

        return normalizedName.contains(normalizedQuery) ||
            normalizedDescription.contains(normalizedQuery);
      }).toList();

      // Re-group filtered types by category
      final Map<ApplicationCategory, List<ApplicationType>> groupedTypes = {};
      for (final type in filteredTypes) {
        final category = assignCategoryToType(type);
        if (!groupedTypes.containsKey(category)) {
          groupedTypes[category] = [];
        }
        groupedTypes[category]!.add(type);
      }

      emit(ApplicationTypesLoadedState(
        applicationTypes: filteredTypes,
        groupedApplicationTypes: groupedTypes,
        searchQuery: event.query,
      ));
    }
  }

  void _onFilterApplicationTypesByCategory(
    FilterApplicationTypesByCategoryEvent event,
    Emitter<ApplicationTypeState> emit,
  ) {
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;
      final allTypes = currentState.applicationTypes;

      // If 'All' is selected
      if (event.category == null) {
        emit(ApplicationTypesLoadedState(
          applicationTypes: allTypes,
          groupedApplicationTypes: currentState.groupedApplicationTypes,
          selectedCategory: null,
          searchQuery: currentState.searchQuery,
        ));
        return;
      }

      // Filter by selected category
      final filteredTypes = allTypes.where((type) {
        return assignCategoryToType(type) == event.category;
      }).toList();

      // Create a map with only the selected category
      final Map<ApplicationCategory, List<ApplicationType>> groupedTypes = {
        event.category!: filteredTypes,
      };

      emit(ApplicationTypesLoadedState(
        applicationTypes: allTypes, // Keep all types for reference
        filteredApplicationTypes: filteredTypes,
        groupedApplicationTypes: currentState.groupedApplicationTypes,
        selectedCategory: event.category,
        searchQuery: currentState.searchQuery,
      ));
    }
  }

  void _onSelectApplicationType(
    SelectApplicationTypeEvent event,
    Emitter<ApplicationTypeState> emit,
  ) {
    if (state is ApplicationTypesLoadedState) {
      // First load special types for this application type
      add(LoadSpecialApplicationTypesEvent(
          applicationTypeId: event.applicationType.id));

      // Then set the selected application type
      emit(ApplicationTypeSelectedState(
        applicationType: event.applicationType,
        specialApplicationTypes: const [],
        loadingSpecialTypes: true,
        previousState: state as ApplicationTypesLoadedState,
      ));
    }
  }

  void _onSelectSpecialApplicationType(
    SelectSpecialApplicationTypeEvent event,
    Emitter<ApplicationTypeState> emit,
  ) {
    if (state is ApplicationTypeSelectedState) {
      final currentState = state as ApplicationTypeSelectedState;
      emit(SpecialApplicationTypeSelectedState(
        applicationType: currentState.applicationType,
        specialApplicationType: event.specialApplicationType,
        previousState: currentState.previousState,
      ));
    }
  }

  // Helper method to normalize strings for search (remove accents, etc.)
  String _normalizeString(String input) {
    // Simple normalization - convert to lowercase
    String result = input.toLowerCase();

    // Replace Vietnamese accents with non-accented characters
    final Map<String, String> accents = {
      'à': 'a',
      'á': 'a',
      'ạ': 'a',
      'ả': 'a',
      'ã': 'a',
      'â': 'a',
      'ầ': 'a',
      'ấ': 'a',
      'ậ': 'a',
      'ẩ': 'a',
      'ẫ': 'a',
      'ă': 'a',
      'ằ': 'a',
      'ắ': 'a',
      'ặ': 'a',
      'ẳ': 'a',
      'ẵ': 'a',
      'è': 'e',
      'é': 'e',
      'ẹ': 'e',
      'ẻ': 'e',
      'ẽ': 'e',
      'ê': 'e',
      'ề': 'e',
      'ế': 'e',
      'ệ': 'e',
      'ể': 'e',
      'ễ': 'e',
      'ì': 'i',
      'í': 'i',
      'ị': 'i',
      'ỉ': 'i',
      'ĩ': 'i',
      'ò': 'o',
      'ó': 'o',
      'ọ': 'o',
      'ỏ': 'o',
      'õ': 'o',
      'ô': 'o',
      'ồ': 'o',
      'ố': 'o',
      'ộ': 'o',
      'ổ': 'o',
      'ỗ': 'o',
      'ơ': 'o',
      'ờ': 'o',
      'ớ': 'o',
      'ợ': 'o',
      'ở': 'o',
      'ỡ': 'o',
      'ù': 'u',
      'ú': 'u',
      'ụ': 'u',
      'ủ': 'u',
      'ũ': 'u',
      'ư': 'u',
      'ừ': 'u',
      'ứ': 'u',
      'ự': 'u',
      'ử': 'u',
      'ữ': 'u',
      'ỳ': 'y',
      'ý': 'y',
      'ỵ': 'y',
      'ỷ': 'y',
      'ỹ': 'y',
      'đ': 'd',
    };

    for (final entry in accents.entries) {
      result = result.replaceAll(entry.key, entry.value);
    }

    return result;
  }
}
