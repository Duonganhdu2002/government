import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/special_application_type.dart';
import '../../repositories/application_type_repository.dart';

class GetSpecialApplicationTypesUseCase
    implements
        UseCase<List<SpecialApplicationType>,
            GetSpecialApplicationTypesParams> {
  final ApplicationTypeRepository repository;

  GetSpecialApplicationTypesUseCase(this.repository);

  @override
  Future<Either<Failure, List<SpecialApplicationType>>> call(
      GetSpecialApplicationTypesParams params) async {
    return await repository
        .getSpecialApplicationTypes(params.applicationTypeId);
  }
}

class GetSpecialApplicationTypesParams extends Equatable {
  final int applicationTypeId;

  const GetSpecialApplicationTypesParams({required this.applicationTypeId});

  @override
  List<Object?> get props => [applicationTypeId];
}
