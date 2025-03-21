import 'package:dartz/dartz.dart';

import '../../core/utils/failure.dart';
import '../entities/application.dart';

abstract class HistoryRepository {
  /// Get application history from cache or remote if cache is empty
  Future<Either<Failure, List<Application>>> getApplicationHistory();

  /// Force refresh application history from remote and update cache
  Future<Either<Failure, List<Application>>> refreshApplicationHistory();

  /// Get application details by id
  Future<Either<Failure, Application>> getApplicationDetails(String id);

  /// Cache application history for offline access
  Future<void> cacheApplicationHistory(List<Application> applications);

  /// Clear cached history
  Future<void> clearCachedHistory();
}
