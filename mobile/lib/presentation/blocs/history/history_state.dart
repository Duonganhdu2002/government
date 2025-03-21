import 'package:equatable/equatable.dart';

import '../../../domain/entities/application.dart';

abstract class HistoryState extends Equatable {
  const HistoryState();

  @override
  List<Object?> get props => [];
}

class HistoryInitialState extends HistoryState {
  const HistoryInitialState();
}

class HistoryLoadingState extends HistoryState {
  const HistoryLoadingState();
}

class HistoryLoadedState extends HistoryState {
  final List<Application> applications;
  final bool isRefreshed;

  const HistoryLoadedState({
    required this.applications,
    this.isRefreshed = false,
  });

  @override
  List<Object?> get props => [applications, isRefreshed];
}

class HistoryErrorState extends HistoryState {
  final String message;

  const HistoryErrorState({required this.message});

  @override
  List<Object?> get props => [message];
}

class HistoryDetailLoadingState extends HistoryState {
  const HistoryDetailLoadingState();
}

class HistoryDetailLoadedState extends HistoryState {
  final Application application;

  const HistoryDetailLoadedState({required this.application});

  @override
  List<Object?> get props => [application];
}

class HistoryDetailErrorState extends HistoryState {
  final String message;

  const HistoryDetailErrorState({required this.message});

  @override
  List<Object?> get props => [message];
}
