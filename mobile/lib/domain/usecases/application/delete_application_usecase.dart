import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../repositories/application_repository.dart';

class DeleteApplicationUseCase
    implements UseCase<bool, DeleteApplicationParams> {
  final ApplicationRepository repository;

  DeleteApplicationUseCase(this.repository);

  @override
  Future<Either<Failure, bool>> call(DeleteApplicationParams params) async {
    return await repository.deleteApplication(params.id);
  }
}

class DeleteApplicationParams extends Equatable {
  final String id;

  const DeleteApplicationParams({required this.id});

  @override
  List<Object> get props => [id];
}
