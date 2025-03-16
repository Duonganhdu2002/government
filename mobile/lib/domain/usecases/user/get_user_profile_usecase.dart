import 'package:dartz/dartz.dart';

import '../../../core/utils/failure.dart';
import '../../../core/utils/usecase.dart';
import '../../entities/user.dart';
import '../../repositories/user_repository.dart';

class GetUserProfileUseCase implements UseCase<User, NoParams> {
  final UserRepository repository;

  GetUserProfileUseCase(this.repository);

  @override
  Future<Either<Failure, User>> call(NoParams params) async {
    return await repository.getCurrentUser();
  }
}
