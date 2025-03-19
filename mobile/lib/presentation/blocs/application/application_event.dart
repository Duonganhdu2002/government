part of 'application_bloc.dart';

abstract class ApplicationEvent extends Equatable {
  const ApplicationEvent();

  @override
  List<Object?> get props => [];
}

class LoadApplicationsEvent extends ApplicationEvent {}

class LoadCurrentUserApplicationsEvent extends ApplicationEvent {}

class LoadApplicationEvent extends ApplicationEvent {
  final String id;

  const LoadApplicationEvent({required this.id});

  @override
  List<Object?> get props => [id];
}

class CreateApplicationEvent extends ApplicationEvent {
  final String title;
  final String description;
  final Map<String, dynamic> formData;
  final List<String> attachments;

  const CreateApplicationEvent({
    required this.title,
    required this.description,
    required this.formData,
    this.attachments = const [],
  });

  @override
  List<Object?> get props => [title, description, formData, attachments];
}

class UpdateApplicationEvent extends ApplicationEvent {
  final String id;
  final String? title;
  final String? description;
  final Map<String, dynamic>? formData;
  final List<String>? attachments;

  const UpdateApplicationEvent({
    required this.id,
    this.title,
    this.description,
    this.formData,
    this.attachments,
  });

  @override
  List<Object?> get props => [id, title, description, formData, attachments];
}

class SubmitApplicationEvent extends ApplicationEvent {
  final String id;

  const SubmitApplicationEvent({required this.id});

  @override
  List<Object?> get props => [id];
}

class DeleteApplicationEvent extends ApplicationEvent {
  final String id;

  const DeleteApplicationEvent({required this.id});

  @override
  List<Object?> get props => [id];
}
