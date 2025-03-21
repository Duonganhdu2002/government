part of 'application_type_bloc.dart';

abstract class ApplicationTypeState extends Equatable {
  const ApplicationTypeState();

  @override
  List<Object?> get props => [];
}

class ApplicationTypeInitialState extends ApplicationTypeState {}

class ApplicationTypesLoadingState extends ApplicationTypeState {}

class ApplicationTypeLoadingState extends ApplicationTypeState {}

class SpecialApplicationTypesLoadingState extends ApplicationTypeState {
  final ApplicationTypesLoadedState previousState;

  const SpecialApplicationTypesLoadingState({required this.previousState});

  @override
  List<Object?> get props => [previousState];
}

class ApplicationTypesLoadedState extends ApplicationTypeState {
  final List<ApplicationType> applicationTypes;
  final List<ApplicationType>? filteredApplicationTypes;
  final Map<ApplicationCategory, List<ApplicationType>> groupedApplicationTypes;
  final ApplicationCategory? selectedCategory;
  final String? searchQuery;
  final bool allSpecialTypesLoaded;
  final Map<int, List<SpecialApplicationType>> specialTypesCache;

  const ApplicationTypesLoadedState({
    required this.applicationTypes,
    required this.groupedApplicationTypes,
    this.filteredApplicationTypes,
    this.selectedCategory,
    this.searchQuery,
    this.allSpecialTypesLoaded = false,
    this.specialTypesCache = const {},
  });

  @override
  List<Object?> get props => [
        applicationTypes,
        filteredApplicationTypes,
        groupedApplicationTypes,
        selectedCategory,
        searchQuery,
        allSpecialTypesLoaded,
        specialTypesCache,
      ];
}

class SpecialApplicationTypesLoadedState extends ApplicationTypesLoadedState {
  final int applicationTypeId;
  final List<SpecialApplicationType> specialApplicationTypes;

  const SpecialApplicationTypesLoadedState({
    required super.applicationTypes,
    required super.groupedApplicationTypes,
    required this.applicationTypeId,
    required this.specialApplicationTypes,
    super.filteredApplicationTypes,
    super.selectedCategory,
    super.searchQuery,
  });

  @override
  List<Object?> get props => [
        ...super.props,
        applicationTypeId,
        specialApplicationTypes,
      ];
}

class ApplicationTypeLoadedState extends ApplicationTypeState {
  final ApplicationType applicationType;
  final List<SpecialApplicationType>? specialApplicationTypes;
  final bool loadingSpecialTypes;

  const ApplicationTypeLoadedState({
    required this.applicationType,
    this.specialApplicationTypes,
    this.loadingSpecialTypes = false,
  });

  @override
  List<Object?> get props => [
        applicationType,
        specialApplicationTypes,
        loadingSpecialTypes,
      ];
}

class ApplicationTypeSelectedState extends ApplicationTypeState {
  final ApplicationType applicationType;
  final List<SpecialApplicationType> specialApplicationTypes;
  final bool loadingSpecialTypes;
  final ApplicationTypesLoadedState previousState;

  const ApplicationTypeSelectedState({
    required this.applicationType,
    required this.specialApplicationTypes,
    required this.previousState,
    this.loadingSpecialTypes = false,
  });

  @override
  List<Object?> get props => [
        applicationType,
        specialApplicationTypes,
        loadingSpecialTypes,
        previousState,
      ];
}

class SpecialApplicationTypeSelectedState extends ApplicationTypeState {
  final ApplicationType applicationType;
  final SpecialApplicationType specialApplicationType;
  final ApplicationTypesLoadedState previousState;

  const SpecialApplicationTypeSelectedState({
    required this.applicationType,
    required this.specialApplicationType,
    required this.previousState,
  });

  @override
  List<Object?> get props => [
        applicationType,
        specialApplicationType,
        previousState,
      ];
}

class ApplicationTypeErrorState extends ApplicationTypeState {
  final String message;

  const ApplicationTypeErrorState({required this.message});

  @override
  List<Object> get props => [message];
}
