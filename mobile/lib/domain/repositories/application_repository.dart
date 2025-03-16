import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/application.dart';

abstract class ApplicationRepository {
  Future<Either<Failure, List<Application>>> getApplications();

  Future<Either<Failure, Application>> getApplicationById(String id);

  Future<Either<Failure, Application>> createApplication({
    required String title,
    required String description,
    required Map<String, dynamic> formData,
    List<String> attachments = const [],
  });

  Future<Either<Failure, Application>> updateApplication({
    required String id,
    String? title,
    String? description,
    Map<String, dynamic>? formData,
    List<String>? attachments,
  });

  Future<Either<Failure, bool>> submitApplication(String id);

  Future<Either<Failure, bool>> deleteApplication(String id);
}
