part of 'user_bloc.dart';

abstract class UserState extends Equatable {
  const UserState();

  @override
  List<Object?> get props => [];
}

class UserInitialState extends UserState {}

// Loading states
class UserLoadingState extends UserState {}

class UserUpdatingState extends UserState {}

class UserDeletingState extends UserState {}

// Success states
class UserLoadedState extends UserState {
  final User user;

  const UserLoadedState({required this.user});

  @override
  List<Object?> get props => [user];
}

class UserUpdatedState extends UserState {
  final User user;

  const UserUpdatedState({required this.user});

  @override
  List<Object?> get props => [user];
}

class UserPasswordUpdatedState extends UserState {}

class UserDeletedState extends UserState {}

// Error state
class UserErrorState extends UserState {
  final String message;

  const UserErrorState({required this.message});

  @override
  List<Object?> get props => [message];
}
