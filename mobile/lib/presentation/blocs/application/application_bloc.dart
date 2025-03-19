import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/usecase.dart';
import '../../../domain/entities/application.dart';
import '../../../domain/usecases/application/get_applications_usecase.dart';
import '../../../domain/usecases/application/get_current_user_applications_usecase.dart';
import '../../../domain/usecases/application/get_application_by_id_usecase.dart';
import '../../../domain/usecases/application/create_application_usecase.dart';
import '../../../domain/usecases/application/update_application_usecase.dart';
import '../../../domain/usecases/application/submit_application_usecase.dart';
import '../../../domain/usecases/application/delete_application_usecase.dart';

part 'application_event.dart';
part 'application_state.dart';

class ApplicationBloc extends Bloc<ApplicationEvent, ApplicationState> {
  final GetApplicationsUseCase getApplicationsUseCase;
  final GetCurrentUserApplicationsUseCase getCurrentUserApplicationsUseCase;
  final GetApplicationByIdUseCase getApplicationByIdUseCase;
  final CreateApplicationUseCase createApplicationUseCase;
  final UpdateApplicationUseCase updateApplicationUseCase;
  final SubmitApplicationUseCase submitApplicationUseCase;
  final DeleteApplicationUseCase deleteApplicationUseCase;

  ApplicationBloc({
    required this.getApplicationsUseCase,
    required this.getCurrentUserApplicationsUseCase,
    required this.getApplicationByIdUseCase,
    required this.createApplicationUseCase,
    required this.updateApplicationUseCase,
    required this.submitApplicationUseCase,
    required this.deleteApplicationUseCase,
  }) : super(ApplicationInitialState()) {
    on<LoadApplicationsEvent>(_onLoadApplications);
    on<LoadCurrentUserApplicationsEvent>(_onLoadCurrentUserApplications);
    on<LoadApplicationEvent>(_onLoadApplication);
    on<CreateApplicationEvent>(_onCreateApplication);
    on<UpdateApplicationEvent>(_onUpdateApplication);
    on<SubmitApplicationEvent>(_onSubmitApplication);
    on<DeleteApplicationEvent>(_onDeleteApplication);
  }

  Future<void> _onLoadApplications(
    LoadApplicationsEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationsLoadingState());

    final result = await getApplicationsUseCase(NoParams());

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (applications) =>
          emit(ApplicationsLoadedState(applications: applications)),
    );
  }

  Future<void> _onLoadCurrentUserApplications(
    LoadCurrentUserApplicationsEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    print('[ApplicationBloc] Starting to load current user applications');
    emit(ApplicationsLoadingState());
    print('[ApplicationBloc] Emitted ApplicationsLoadingState');

    try {
      print('[ApplicationBloc] Calling getCurrentUserApplicationsUseCase');
      final result = await getCurrentUserApplicationsUseCase(NoParams());

      result.fold(
        (failure) {
          print(
              '[ApplicationBloc] Error loading applications: ${failure.message}');
          emit(ApplicationErrorState(message: failure.message));
          print('[ApplicationBloc] Emitted ApplicationErrorState');
        },
        (applications) {
          print(
              '[ApplicationBloc] Successfully loaded ${applications.length} applications');

          // Ensure all applications are valid
          if (applications.isNotEmpty) {
            final firstApp = applications.first;
            print(
                '[ApplicationBloc] First app: id=${firstApp.id}, title=${firstApp.title}, status=${firstApp.status}');
          }

          final newState = ApplicationsLoadedState(applications: applications);
          emit(newState);
          print(
              '[ApplicationBloc] Emitted ApplicationsLoadedState with ${applications.length} applications');
        },
      );
    } catch (e) {
      print('[ApplicationBloc] Exception when loading applications: $e');
      print('[ApplicationBloc] Stack trace: ${StackTrace.current}');
      emit(ApplicationErrorState(message: 'Error: $e'));
      print('[ApplicationBloc] Emitted ApplicationErrorState due to exception');
    }
  }

  Future<void> _onLoadApplication(
    LoadApplicationEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationLoadingState());

    final result =
        await getApplicationByIdUseCase(GetApplicationByIdParams(id: event.id));

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (application) => emit(ApplicationLoadedState(application: application)),
    );
  }

  Future<void> _onCreateApplication(
    CreateApplicationEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationSubmittingState());

    final result = await createApplicationUseCase(
      CreateApplicationParams(
        title: event.title,
        description: event.description,
        formData: event.formData,
        attachments: event.attachments,
      ),
    );

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (application) => emit(ApplicationCreatedState(application: application)),
    );
  }

  Future<void> _onUpdateApplication(
    UpdateApplicationEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationSubmittingState());

    final result = await updateApplicationUseCase(
      UpdateApplicationParams(
        id: event.id,
        title: event.title,
        description: event.description,
        formData: event.formData,
        attachments: event.attachments,
      ),
    );

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (application) => emit(ApplicationUpdatedState(application: application)),
    );
  }

  Future<void> _onSubmitApplication(
    SubmitApplicationEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationSubmittingState());

    final result =
        await submitApplicationUseCase(SubmitApplicationParams(id: event.id));

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (success) {
        if (success) {
          emit(ApplicationSubmittedState(id: event.id));
        } else {
          emit(const ApplicationErrorState(
              message: 'Failed to submit application'));
        }
      },
    );
  }

  Future<void> _onDeleteApplication(
    DeleteApplicationEvent event,
    Emitter<ApplicationState> emit,
  ) async {
    emit(ApplicationDeletingState());

    final result =
        await deleteApplicationUseCase(DeleteApplicationParams(id: event.id));

    result.fold(
      (failure) => emit(ApplicationErrorState(message: failure.message)),
      (success) {
        if (success) {
          emit(ApplicationDeletedState(id: event.id));
        } else {
          emit(const ApplicationErrorState(
              message: 'Failed to delete application'));
        }
      },
    );
  }
}
