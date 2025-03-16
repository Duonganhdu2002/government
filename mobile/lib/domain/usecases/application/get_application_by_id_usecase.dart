import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application.dart';
import '../../repositories/application_repository.dart';

class GetApplicationByIdUseCase
    implements UseCase<Application, GetApplicationByIdParams> {
  final ApplicationRepository repository;

  GetApplicationByIdUseCase(this.repository);

  @override
  Future<Either<Failure, Application>> call(
      GetApplicationByIdParams params) async {
    return await repository.getApplicationById(params.id);
  }
}

class GetApplicationByIdParams extends Equatable {
  final String id;

  const GetApplicationByIdParams({required this.id});

  @override
  List<Object> get props => [id];
}
