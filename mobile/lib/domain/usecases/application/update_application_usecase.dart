import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application.dart';
import '../../repositories/application_repository.dart';

class UpdateApplicationUseCase
    implements UseCase<Application, UpdateApplicationParams> {
  final ApplicationRepository repository;

  UpdateApplicationUseCase(this.repository);

  @override
  Future<Either<Failure, Application>> call(
      UpdateApplicationParams params) async {
    return await repository.updateApplication(
      id: params.id,
      title: params.title,
      description: params.description,
      formData: params.formData,
      attachments: params.attachments,
    );
  }
}

class UpdateApplicationParams extends Equatable {
  final String id;
  final String? title;
  final String? description;
  final Map<String, dynamic>? formData;
  final List<String>? attachments;

  const UpdateApplicationParams({
    required this.id,
    this.title,
    this.description,
    this.formData,
    this.attachments,
  });

  @override
  List<Object?> get props => [id, title, description, formData, attachments];
}
