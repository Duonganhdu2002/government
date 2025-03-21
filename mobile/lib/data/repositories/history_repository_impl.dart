import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../core/utils/failure.dart';
import '../../domain/entities/application.dart';
import '../../domain/repositories/history_repository.dart';
import '../datasources/application_local_data_source.dart';
import '../datasources/application_remote_data_source.dart';
import '../models/application_model.dart';

class HistoryRepositoryImpl implements HistoryRepository {
  final ApplicationRemoteDataSource remoteDataSource;
  final ApplicationLocalDataSource localDataSource;

  HistoryRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<Application>>> getApplicationHistory() async {
    try {
      // First try to get cached data
      try {
        final cachedApplications =
            await localDataSource.getCachedApplications();
        return Right(cachedApplications);
      } catch (_) {
        // If cache fails, fetch from remote
        return refreshApplicationHistory();
      }
    } catch (e) {
      return Left(Failure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Application>>> refreshApplicationHistory() async {
    try {
      final remoteApplications =
          await remoteDataSource.getCurrentUserApplications();

      // Cache the new data
      await cacheApplicationHistory(remoteApplications);

      return Right(remoteApplications);
    } on DioException catch (e) {
      return Left(Failure(
        message: e.response?.data?['message'] ??
            'Failed to fetch application history',
      ));
    } catch (e) {
      return Left(Failure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Application>> getApplicationDetails(String id) async {
    try {
      // Try to get from cache first
      try {
        final cachedApplication =
            await localDataSource.getCachedApplicationById(id);
        return Right(cachedApplication);
      } catch (_) {
        // If not in cache, get from remote
        final application = await remoteDataSource.getApplicationById(id);
        return Right(application);
      }
    } on DioException catch (e) {
      return Left(Failure(
        message: e.response?.data?['message'] ??
            'Failed to fetch application details',
      ));
    } catch (e) {
      return Left(Failure(message: e.toString()));
    }
  }

  @override
  Future<void> cacheApplicationHistory(List<Application> applications) async {
    try {
      final List<ApplicationModel> applicationModels = [];

      for (var app in applications) {
        if (app is ApplicationModel) {
          applicationModels.add(app);
        } else {
          // Create a new ApplicationModel from the entity fields we have
          applicationModels.add(ApplicationModel(
            id: app.id,
            title: app.title,
            description: app.description,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            submittedAt: app.submittedAt,
            status: app.status,
            formData: app.formData,
            attachments: app.attachments,
            referenceNumber: app.referenceNumber,
            userId: app.userId,
          ));
        }
      }

      await localDataSource.cacheApplications(applicationModels);
    } catch (e) {
      // Silent fail for caching operations
      // We don't want to interrupt the user experience for cache failures
    }
  }

  @override
  Future<void> clearCachedHistory() async {
    try {
      await localDataSource.clearCachedApplications();
    } catch (e) {
      // Silent fail for caching operations
    }
  }
}
