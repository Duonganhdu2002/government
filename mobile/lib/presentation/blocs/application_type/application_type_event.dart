part of 'application_type_bloc.dart';

abstract class ApplicationTypeEvent extends Equatable {
  const ApplicationTypeEvent();

  @override
  List<Object?> get props => [];
}

class LoadApplicationTypesEvent extends ApplicationTypeEvent {
  const LoadApplicationTypesEvent();
}

class LoadApplicationTypeEvent extends ApplicationTypeEvent {
  final int id;

  const LoadApplicationTypeEvent({required this.id});

  @override
  List<Object> get props => [id];
}

class LoadSpecialApplicationTypesEvent extends ApplicationTypeEvent {
  final int applicationTypeId;

  const LoadSpecialApplicationTypesEvent({required this.applicationTypeId});

  @override
  List<Object> get props => [applicationTypeId];
}

class SearchApplicationTypesEvent extends ApplicationTypeEvent {
  final String query;

  const SearchApplicationTypesEvent({required this.query});

  @override
  List<Object> get props => [query];
}

class FilterApplicationTypesByCategoryEvent extends ApplicationTypeEvent {
  final ApplicationCategory? category;

  const FilterApplicationTypesByCategoryEvent({this.category});

  @override
  List<Object?> get props => [category];
}

class SelectApplicationTypeEvent extends ApplicationTypeEvent {
  final ApplicationType applicationType;

  const SelectApplicationTypeEvent({required this.applicationType});

  @override
  List<Object> get props => [applicationType];
}

class SelectSpecialApplicationTypeEvent extends ApplicationTypeEvent {
  final SpecialApplicationType specialApplicationType;

  const SelectSpecialApplicationTypeEvent(
      {required this.specialApplicationType});

  @override
  List<Object> get props => [specialApplicationType];
}
