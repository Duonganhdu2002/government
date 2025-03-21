import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/usecase.dart';
import '../../../domain/entities/application_type.dart';
import '../../../domain/entities/special_application_type.dart';
import '../../../domain/usecases/application_type/get_application_types_usecase.dart';
import '../../../domain/usecases/application_type/get_application_type_by_id_usecase.dart';
import '../../../domain/usecases/application_type/get_special_application_types_usecase.dart';
import '../../../domain/usecases/application_type/get_all_special_application_types_usecase.dart';

part 'application_type_event.dart';
part 'application_type_state.dart';

class ApplicationTypeBloc
    extends Bloc<ApplicationTypeEvent, ApplicationTypeState> {
  final GetApplicationTypesUseCase getApplicationTypesUseCase;
  final GetApplicationTypeByIdUseCase getApplicationTypeByIdUseCase;
  final GetSpecialApplicationTypesUseCase getSpecialApplicationTypesUseCase;
  final GetAllSpecialApplicationTypesUseCase
      getAllSpecialApplicationTypesUseCase;

  // Cache for special application types
  final Map<int, List<SpecialApplicationType>> _specialTypesCache = {};

  ApplicationTypeBloc({
    required this.getApplicationTypesUseCase,
    required this.getApplicationTypeByIdUseCase,
    required this.getSpecialApplicationTypesUseCase,
    required this.getAllSpecialApplicationTypesUseCase,
  }) : super(ApplicationTypeInitialState()) {
    on<LoadApplicationTypesEvent>(_onLoadApplicationTypes);
    on<LoadApplicationTypeEvent>(_onLoadApplicationType);
    on<LoadSpecialApplicationTypesEvent>(_onLoadSpecialApplicationTypes);
    on<LoadAllSpecialApplicationTypesEvent>(_onLoadAllSpecialApplicationTypes);
    on<SearchApplicationTypesEvent>(_onSearchApplicationTypes);
    on<FilterApplicationTypesByCategoryEvent>(
        _onFilterApplicationTypesByCategory);
    on<SelectApplicationTypeEvent>(_onSelectApplicationType);
    on<SelectSpecialApplicationTypeEvent>(_onSelectSpecialApplicationType);
    on<PreloadAllSpecialApplicationTypesEvent>(
        _onPreloadAllSpecialApplicationTypes);
  }

  Future<void> _onLoadApplicationTypes(
    LoadApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    // Skip if we're already in a loaded state with data, to prevent unnecessary API calls
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;
      if (currentState.applicationTypes.isNotEmpty) {
        return;
      }
    }

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

        // Check if we already have special types cached before emitting state
        final hasSpecialTypesInCache = _specialTypesCache.isNotEmpty;

        emit(ApplicationTypesLoadedState(
          applicationTypes: applicationTypes,
          groupedApplicationTypes: groupedTypes,
          allSpecialTypesLoaded: hasSpecialTypesInCache,
          specialTypesCache: _specialTypesCache,
        ));

        // Preload all special application types only if we don't already have them cached
        if (!hasSpecialTypesInCache) {
          add(PreloadAllSpecialApplicationTypesEvent(
              applicationTypes: applicationTypes));
        }
      },
    );
  }

  Future<void> _onPreloadAllSpecialApplicationTypes(
    PreloadAllSpecialApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    // Load all special types at once using the use case
    final result = await getAllSpecialApplicationTypesUseCase(NoParams());

    result.fold(
      (failure) {
        // Try to load them individually as a fallback
        _loadSpecialTypesIndividually(event.applicationTypes);
      },
      (specialTypesMap) {
        // Store in cache
        _specialTypesCache.addAll(specialTypesMap);

        // Update state with cached special types if currently in a loaded state
        if (state is ApplicationTypesLoadedState) {
          final currentState = state as ApplicationTypesLoadedState;
          emit(ApplicationTypesLoadedState(
            applicationTypes: currentState.applicationTypes,
            groupedApplicationTypes: currentState.groupedApplicationTypes,
            filteredApplicationTypes: currentState.filteredApplicationTypes,
            selectedCategory: currentState.selectedCategory,
            searchQuery: currentState.searchQuery,
            allSpecialTypesLoaded: true,
            specialTypesCache: _specialTypesCache,
          ));
        }
      },
    );
  }

  Future<void> _loadSpecialTypesIndividually(
      List<ApplicationType> applicationTypes) async {
    // Fallback method to load special types individually
    for (final applicationType in applicationTypes) {
      final result = await getSpecialApplicationTypesUseCase(
        GetSpecialApplicationTypesParams(applicationTypeId: applicationType.id),
      );

      result.fold(
        (failure) {
          // On failure, store an empty list in cache
          _specialTypesCache[applicationType.id] = [];
        },
        (specialTypes) {
          // Store in cache
          _specialTypesCache[applicationType.id] = specialTypes;
        },
      );
    }
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
        // Check if we already have special types for this application type
        final specialTypes = _specialTypesCache[applicationType.id] ?? [];
        final loadingSpecialTypes = specialTypes.isEmpty;

        emit(ApplicationTypeLoadedState(
          applicationType: applicationType,
          specialApplicationTypes: specialTypes,
          loadingSpecialTypes: loadingSpecialTypes,
        ));

        // If we don't have special types cached yet, load them
        if (loadingSpecialTypes) {
          add(LoadSpecialApplicationTypesEvent(
              applicationTypeId: applicationType.id));
        }
      },
    );
  }

  Future<void> _onLoadSpecialApplicationTypes(
    LoadSpecialApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    // Log for debugging

    // Skip if we have allSpecialTypesLoaded flag set to true in ApplicationTypesLoadedState
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;
      if (currentState.allSpecialTypesLoaded &&
          currentState.specialTypesCache.containsKey(event.applicationTypeId)) {

        // Still emit a specific state for this application type using cached data
        emit(SpecialApplicationTypesLoadedState(
          applicationTypes: currentState.applicationTypes,
          filteredApplicationTypes: currentState.filteredApplicationTypes,
          groupedApplicationTypes: currentState.groupedApplicationTypes,
          selectedCategory: currentState.selectedCategory,
          searchQuery: currentState.searchQuery,
          applicationTypeId: event.applicationTypeId,
          specialApplicationTypes:
              currentState.specialTypesCache[event.applicationTypeId] ?? [],
        ));
        return;
      }
    }

    // Check if we already have these special types cached
    if (_specialTypesCache.containsKey(event.applicationTypeId) &&
        _specialTypesCache[event.applicationTypeId]!.isNotEmpty) {
      final cachedSpecialTypes = _specialTypesCache[event.applicationTypeId]!;

      if (state is ApplicationTypeLoadedState) {
        final currentState = state as ApplicationTypeLoadedState;
        emit(ApplicationTypeLoadedState(
          applicationType: currentState.applicationType,
          specialApplicationTypes: cachedSpecialTypes,
          loadingSpecialTypes: false,
        ));
      } else if (state is ApplicationTypesLoadedState) {
        final currentState = state as ApplicationTypesLoadedState;
        emit(SpecialApplicationTypesLoadedState(
          applicationTypes: currentState.applicationTypes,
          filteredApplicationTypes: currentState.filteredApplicationTypes,
          groupedApplicationTypes: currentState.groupedApplicationTypes,
          selectedCategory: currentState.selectedCategory,
          searchQuery: currentState.searchQuery,
          applicationTypeId: event.applicationTypeId,
          specialApplicationTypes: cachedSpecialTypes,
        ));
      } else if (state is ApplicationTypeSelectedState) {
        final currentState = state as ApplicationTypeSelectedState;
        emit(ApplicationTypeSelectedState(
          applicationType: currentState.applicationType,
          specialApplicationTypes: cachedSpecialTypes,
          previousState: currentState.previousState,
          loadingSpecialTypes: false,
        ));
      }
      return;
    }

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
    } else if (state is ApplicationTypeSelectedState) {
      final currentState = state as ApplicationTypeSelectedState;
      emit(ApplicationTypeSelectedState(
        applicationType: currentState.applicationType,
        specialApplicationTypes: const [],
        previousState: currentState.previousState,
        loadingSpecialTypes: true,
      ));
    }

    final result = await getSpecialApplicationTypesUseCase(
      GetSpecialApplicationTypesParams(
          applicationTypeId: event.applicationTypeId),
    );

    result.fold(
      (failure) {
        // Cache empty list on failure
        _specialTypesCache[event.applicationTypeId] = [];

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
        } else if (state is ApplicationTypeSelectedState) {
          final currentState = state as ApplicationTypeSelectedState;
          emit(ApplicationTypeSelectedState(
            applicationType: currentState.applicationType,
            specialApplicationTypes: const [],
            previousState: currentState.previousState,
            loadingSpecialTypes: false,
          ));
        }
      },
      (specialTypes) {
        // Cache the special types
        _specialTypesCache[event.applicationTypeId] = specialTypes;

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
        } else if (state is ApplicationTypeSelectedState) {
          final currentState = state as ApplicationTypeSelectedState;
          emit(ApplicationTypeSelectedState(
            applicationType: currentState.applicationType,
            specialApplicationTypes: specialTypes,
            previousState: currentState.previousState,
            loadingSpecialTypes: false,
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
          allSpecialTypesLoaded: currentState.allSpecialTypesLoaded,
          specialTypesCache: currentState.specialTypesCache,
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
        allSpecialTypesLoaded: currentState.allSpecialTypesLoaded,
        specialTypesCache: currentState.specialTypesCache,
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
          allSpecialTypesLoaded: currentState.allSpecialTypesLoaded,
          specialTypesCache: currentState.specialTypesCache,
        ));
        return;
      }

      // Filter by selected category
      final filteredTypes = allTypes.where((type) {
        return assignCategoryToType(type) == event.category;
      }).toList();

      // Create a map with only the selected category

      emit(ApplicationTypesLoadedState(
        applicationTypes: allTypes, // Keep all types for reference
        filteredApplicationTypes: filteredTypes,
        groupedApplicationTypes: currentState.groupedApplicationTypes,
        selectedCategory: event.category,
        searchQuery: currentState.searchQuery,
        allSpecialTypesLoaded: currentState.allSpecialTypesLoaded,
        specialTypesCache: currentState.specialTypesCache,
      ));
    }
  }

  void _onSelectApplicationType(
    SelectApplicationTypeEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;

      // Log for debugging

      // Check if we have special types already in the cache or if all special types are already loaded
      bool shouldLoadSpecialTypes = true;
      List<SpecialApplicationType> specialTypes = [];

      // First, check if we have special types in the cache
      if (_specialTypesCache.containsKey(event.applicationType.id)) {
        specialTypes = _specialTypesCache[event.applicationType.id] ?? [];
        shouldLoadSpecialTypes = specialTypes.isEmpty;
      }
      // Then, check if we have a complete cache of all special types
      else if (currentState.allSpecialTypesLoaded &&
          currentState.specialTypesCache
              .containsKey(event.applicationType.id)) {
        specialTypes =
            currentState.specialTypesCache[event.applicationType.id] ?? [];
        shouldLoadSpecialTypes = specialTypes.isEmpty;
        // Copy from state cache to memory cache for future use
        if (specialTypes.isNotEmpty) {
          _specialTypesCache[event.applicationType.id] = specialTypes;
        }
      }

      // Set the selected application type
      emit(ApplicationTypeSelectedState(
        applicationType: event.applicationType,
        specialApplicationTypes: specialTypes,
        loadingSpecialTypes: shouldLoadSpecialTypes,
        previousState: currentState,
      ));

      // If we don't have the special types yet, load them
      if (shouldLoadSpecialTypes) {
        add(LoadSpecialApplicationTypesEvent(
            applicationTypeId: event.applicationType.id));
      }
    } else {
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

  Future<void> _onLoadAllSpecialApplicationTypes(
    LoadAllSpecialApplicationTypesEvent event,
    Emitter<ApplicationTypeState> emit,
  ) async {
    if (state is ApplicationTypesLoadedState) {
      final currentState = state as ApplicationTypesLoadedState;

      // Only trigger loading if not already loaded
      if (!currentState.allSpecialTypesLoaded) {
        // Load all special types at once using the use case
        final result = await getAllSpecialApplicationTypesUseCase(NoParams());

        result.fold(
          (failure) {
            // Do not update state on failure, keep current state
          },
          (specialTypesMap) {
            // Store in cache
            _specialTypesCache.addAll(specialTypesMap);

            // Update state with cached special types
            emit(ApplicationTypesLoadedState(
              applicationTypes: currentState.applicationTypes,
              groupedApplicationTypes: currentState.groupedApplicationTypes,
              filteredApplicationTypes: currentState.filteredApplicationTypes,
              selectedCategory: currentState.selectedCategory,
              searchQuery: currentState.searchQuery,
              allSpecialTypesLoaded: true,
              specialTypesCache: _specialTypesCache,
            ));
          },
        );
      }
    }
  }
}
