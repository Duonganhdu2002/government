import 'package:dartz/dartz.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/application.dart';
import '../../repositories/application_repository.dart';

class GetCurrentUserApplicationsUseCase
    implements UseCase<List<Application>, NoParams> {
  final ApplicationRepository repository;

  GetCurrentUserApplicationsUseCase(this.repository);

  @override
  Future<Either<Failure, List<Application>>> call(NoParams params) async {
    return await repository.getCurrentUserApplications();
  }
}
