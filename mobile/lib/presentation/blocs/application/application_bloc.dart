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

// A simple logger to replace print statements
class _Logger {
  static const bool _enableLogging =
      false; // Set to true only during development

  static void log(String message) {
    if (_enableLogging) {
      // ignore: avoid_print
      print('[AppBloc] $message');
    }
  }
}

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
    emit(ApplicationsLoadingState());

    try {
      final result = await getCurrentUserApplicationsUseCase(NoParams());

      result.fold(
        (failure) {
          emit(ApplicationErrorState(message: failure.message));
        },
        (applications) {
          // Ensure all applications are valid
          if (applications.isNotEmpty) {}

          final newState = ApplicationsLoadedState(applications: applications);
          emit(newState);
        },
      );
    } catch (e) {
      emit(ApplicationErrorState(message: 'Error: $e'));
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

    try {
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
        (application) {
          try {
            emit(ApplicationCreatedState(application: application));
          } catch (e) {
            _Logger.log('Error in emitting ApplicationCreatedState: $e');
            // Still consider this a success but with an error message
            emit(ApplicationErrorState(
                message: 'Gửi hồ sơ thành công nhưng có lỗi hiển thị: $e'));
          }
        },
      );
    } catch (e) {
      _Logger.log('Unexpected error in _onCreateApplication: $e');
      emit(ApplicationErrorState(message: 'Lỗi không xác định: $e'));
    }
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
