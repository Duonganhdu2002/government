import 'package:equatable/equatable.dart';

class SpecialApplicationType extends Equatable {
  final int id;
  final int applicationTypeId;
  final String name;
  final int processingTimeLimit;
  final String? applicationTypeName;

  const SpecialApplicationType({
    required this.id,
    required this.applicationTypeId,
    required this.name,
    required this.processingTimeLimit,
    this.applicationTypeName,
  });

  SpecialApplicationType copyWith({
    int? id,
    int? applicationTypeId,
    String? name,
    int? processingTimeLimit,
    String? applicationTypeName,
  }) {
    return SpecialApplicationType(
      id: id ?? this.id,
      applicationTypeId: applicationTypeId ?? this.applicationTypeId,
      name: name ?? this.name,
      processingTimeLimit: processingTimeLimit ?? this.processingTimeLimit,
      applicationTypeName: applicationTypeName ?? this.applicationTypeName,
    );
  }

  @override
  List<Object?> get props => [
        id,
        applicationTypeId,
        name,
        processingTimeLimit,
        applicationTypeName,
      ];
}
