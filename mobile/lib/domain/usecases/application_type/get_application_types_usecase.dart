import 'package:dartz/dartz.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application_type.dart';
import '../../repositories/application_type_repository.dart';

class GetApplicationTypesUseCase
    implements UseCase<List<ApplicationType>, NoParams> {
  final ApplicationTypeRepository repository;

  GetApplicationTypesUseCase(this.repository);

  @override
  Future<Either<Failure, List<ApplicationType>>> call(NoParams params) async {
    return await repository.getApplicationTypes();
  }
}
