part of 'application_bloc.dart';

abstract class ApplicationState extends Equatable {
  const ApplicationState();

  @override
  List<Object?> get props => [];
}

class ApplicationInitialState extends ApplicationState {}

// Loading states
class ApplicationsLoadingState extends ApplicationState {}

class ApplicationLoadingState extends ApplicationState {}

class ApplicationSubmittingState extends ApplicationState {}

class ApplicationDeletingState extends ApplicationState {}

// Success states
class ApplicationsLoadedState extends ApplicationState {
  final List<Application> applications;

  const ApplicationsLoadedState({required this.applications});

  @override
  List<Object?> get props => [applications];
}

class ApplicationLoadedState extends ApplicationState {
  final Application application;

  const ApplicationLoadedState({required this.application});

  @override
  List<Object?> get props => [application];
}

class ApplicationCreatedState extends ApplicationState {
  final Application application;

  const ApplicationCreatedState({required this.application});

  @override
  List<Object?> get props => [application];
}

class ApplicationUpdatedState extends ApplicationState {
  final Application application;

  const ApplicationUpdatedState({required this.application});

  @override
  List<Object?> get props => [application];
}

class ApplicationSubmittedState extends ApplicationState {
  final String id;

  const ApplicationSubmittedState({required this.id});

  @override
  List<Object?> get props => [id];
}

class ApplicationDeletedState extends ApplicationState {
  final String id;

  const ApplicationDeletedState({required this.id});

  @override
  List<Object?> get props => [id];
}

// Error state
class ApplicationErrorState extends ApplicationState {
  final String message;

  const ApplicationErrorState({required this.message});

  @override
  List<Object?> get props => [message];
}
