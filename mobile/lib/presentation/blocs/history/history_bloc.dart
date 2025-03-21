import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/repositories/history_repository.dart';
import 'history_event.dart';
import 'history_state.dart';

class HistoryBloc extends Bloc<HistoryEvent, HistoryState> {
  final HistoryRepository historyRepository;

  HistoryBloc({required this.historyRepository})
      : super(const HistoryInitialState()) {
    on<LoadHistoryEvent>(_onLoadHistory);
    on<RefreshHistoryEvent>(_onRefreshHistory);
    on<LoadHistoryDetailEvent>(_onLoadHistoryDetail);
    on<ClearHistoryCacheEvent>(_onClearHistoryCache);
  }

  Future<void> _onLoadHistory(
    LoadHistoryEvent event,
    Emitter<HistoryState> emit,
  ) async {
    emit(const HistoryLoadingState());

    final result = await historyRepository.getApplicationHistory();

    result.fold(
      (failure) => emit(HistoryErrorState(message: failure.message)),
      (applications) => emit(HistoryLoadedState(applications: applications)),
    );
  }

  Future<void> _onRefreshHistory(
    RefreshHistoryEvent event,
    Emitter<HistoryState> emit,
  ) async {
    // Don't show loading state for refreshes
    final currentState = state;
    if (currentState is HistoryLoadedState) {
      // Keep the current data while refreshing
      // emit(HistoryLoadedState(applications: currentState.applications, isRefreshing: true));
    } else {
      emit(const HistoryLoadingState());
    }

    final result = await historyRepository.refreshApplicationHistory();

    result.fold(
      (failure) => emit(HistoryErrorState(message: failure.message)),
      (applications) => emit(HistoryLoadedState(
        applications: applications,
        isRefreshed: true,
      )),
    );
  }

  Future<void> _onLoadHistoryDetail(
    LoadHistoryDetailEvent event,
    Emitter<HistoryState> emit,
  ) async {
    emit(const HistoryDetailLoadingState());

    final result =
        await historyRepository.getApplicationDetails(event.applicationId);

    result.fold(
      (failure) => emit(HistoryDetailErrorState(message: failure.message)),
      (application) => emit(HistoryDetailLoadedState(application: application)),
    );
  }

  Future<void> _onClearHistoryCache(
    ClearHistoryCacheEvent event,
    Emitter<HistoryState> emit,
  ) async {
    await historyRepository.clearCachedHistory();
    // We don't need to emit a new state here as this is just clearing cache
  }
}
