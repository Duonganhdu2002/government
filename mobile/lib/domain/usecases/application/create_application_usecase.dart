import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application.dart';
import '../../repositories/application_repository.dart';

class CreateApplicationUseCase
    implements UseCase<Application, CreateApplicationParams> {
  final ApplicationRepository repository;

  CreateApplicationUseCase(this.repository);

  @override
  Future<Either<Failure, Application>> call(
      CreateApplicationParams params) async {
    return await repository.createApplication(
      title: params.title,
      description: params.description,
      formData: params.formData,
      attachments: params.attachments,
    );
  }
}

class CreateApplicationParams extends Equatable {
  final String title;
  final String description;
  final Map<String, dynamic> formData;
  final List<String> attachments;

  const CreateApplicationParams({
    required this.title,
    required this.description,
    required this.formData,
    this.attachments = const [],
  });

  @override
  List<Object> get props => [title, description, formData, attachments];
}
