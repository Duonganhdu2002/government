import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../repositories/application_repository.dart';

class SubmitApplicationUseCase
    implements UseCase<bool, SubmitApplicationParams> {
  final ApplicationRepository repository;

  SubmitApplicationUseCase(this.repository);

  @override
  Future<Either<Failure, bool>> call(SubmitApplicationParams params) async {
    return await repository.submitApplication(params.id);
  }
}

class SubmitApplicationParams extends Equatable {
  final String id;

  const SubmitApplicationParams({required this.id});

  @override
  List<Object> get props => [id];
}
