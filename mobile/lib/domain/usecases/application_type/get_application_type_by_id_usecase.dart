import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application_type.dart';
import '../../repositories/application_type_repository.dart';

class GetApplicationTypeByIdUseCase
    implements UseCase<ApplicationType, GetApplicationTypeByIdParams> {
  final ApplicationTypeRepository repository;

  GetApplicationTypeByIdUseCase(this.repository);

  @override
  Future<Either<Failure, ApplicationType>> call(
      GetApplicationTypeByIdParams params) async {
    return await repository.getApplicationTypeById(params.id);
  }
}

class GetApplicationTypeByIdParams extends Equatable {
  final int id;

  const GetApplicationTypeByIdParams({required this.id});

  @override
  List<Object?> get props => [id];
}
