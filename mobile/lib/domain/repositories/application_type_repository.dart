import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/application_type.dart';
import '../entities/special_application_type.dart';

abstract class ApplicationTypeRepository {
  Future<Either<Failure, List<ApplicationType>>> getApplicationTypes();
  Future<Either<Failure, ApplicationType>> getApplicationTypeById(int id);
  Future<Either<Failure, List<SpecialApplicationType>>>
      getSpecialApplicationTypes(int applicationTypeId);
  Future<Either<Failure, Map<int, List<SpecialApplicationType>>>>
      getAllSpecialApplicationTypes();
}
