class Notification {
  final String id;
  final String title;
  final String message;
  final DateTime date;
  final bool read;
  final String type; // 'success', 'warning', 'error', 'info'

  Notification({
    required this.id,
    required this.title,
    required this.message,
    required this.date,
    required this.read,
    required this.type,
  });
}
