import 'package:dartz/dartz.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/special_application_type.dart';
import '../../repositories/application_type_repository.dart';

class GetAllSpecialApplicationTypesUseCase
    implements UseCase<Map<int, List<SpecialApplicationType>>, NoParams> {
  final ApplicationTypeRepository repository;

  GetAllSpecialApplicationTypesUseCase(this.repository);

  @override
  Future<Either<Failure, Map<int, List<SpecialApplicationType>>>> call(
      NoParams params) async {
    return await repository.getAllSpecialApplicationTypes();
  }
}
