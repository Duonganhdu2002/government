import 'package:equatable/equatable.dart';

abstract class HistoryEvent extends Equatable {
  const HistoryEvent();

  @override
  List<Object?> get props => [];
}

class LoadHistoryEvent extends HistoryEvent {
  const LoadHistoryEvent();
}

class RefreshHistoryEvent extends HistoryEvent {
  const RefreshHistoryEvent();
}

class LoadHistoryDetailEvent extends HistoryEvent {
  final String applicationId;

  const LoadHistoryDetailEvent(this.applicationId);

  @override
  List<Object?> get props => [applicationId];
}

class ClearHistoryCacheEvent extends HistoryEvent {
  const ClearHistoryCacheEvent();
}
