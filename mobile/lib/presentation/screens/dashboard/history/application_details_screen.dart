import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application.dart';
import '../../../blocs/application/application_bloc.dart';

class ApplicationDetailsScreen extends StatelessWidget {
  final String applicationId;
  final Application? initialApplication;
  final bool isBottomSheet;
  final ScrollController? scrollController;

  const ApplicationDetailsScreen({
    Key? key,
    required this.applicationId,
    this.initialApplication,
    this.isBottomSheet = false,
    this.scrollController,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Load application details if not provided
    if (initialApplication == null) {
      context
          .read<ApplicationBloc>()
          .add(LoadApplicationEvent(id: applicationId));
    }

    // If it's a bottom sheet, only return the content
    if (isBottomSheet) {
      return _buildBottomSheetContent(context);
    }

    // Otherwise show a full screen with app bar
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết đơn'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (initialApplication?.status == ApplicationStatus.submitted ||
              initialApplication?.status == ApplicationStatus.inReview)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: ElevatedButton(
                onPressed: () {
                  // Implement rejection logic
                  _showRejectConfirmation(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: const BorderSide(color: Colors.black26, width: 1),
                  ),
                ),
                child: const Text('Từ chối'),
              ),
            ),
        ],
      ),
      body: BlocBuilder<ApplicationBloc, ApplicationState>(
        builder: (context, state) {
          if (state is ApplicationLoadingState && initialApplication == null) {
            return _buildLoadingView();
          } else if (state is ApplicationErrorState) {
            return _buildErrorView(context, state.message);
          } else if (state is ApplicationLoadedState) {
            return _buildApplicationContent(context, state.application);
          }

          // Use the initial application if provided
          if (initialApplication != null) {
            return _buildApplicationContent(context, initialApplication!);
          }

          // Fallback loading view
          return _buildLoadingView();
        },
      ),
    );
  }

  // Content specifically for bottom sheet
  Widget _buildBottomSheetContent(BuildContext context) {
    return BlocBuilder<ApplicationBloc, ApplicationState>(
      builder: (context, state) {
        if (state is ApplicationLoadingState && initialApplication == null) {
          return _buildLoadingView();
        } else if (state is ApplicationErrorState) {
          return _buildErrorView(context, state.message);
        } else if (state is ApplicationLoadedState) {
          return _buildBottomSheetApplicationContent(context,
              scrollController ?? ScrollController(), state.application);
        }

        // Use the initial application if provided
        if (initialApplication != null) {
          return _buildBottomSheetApplicationContent(context,
              scrollController ?? ScrollController(), initialApplication!);
        }

        // Fallback loading view
        return _buildLoadingView();
      },
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 50,
            height: 50,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Đang tải chi tiết...'),
        ],
      ),
    );
  }

  Widget _buildErrorView(BuildContext context, String errorMessage) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: AppTheme.textSecondary, size: 48),
            const SizedBox(height: 16),
            Text(
              'Đã xảy ra lỗi',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Đóng'),
            ),
          ],
        ),
      ),
    );
  }

  // Content for full screen view
  Widget _buildApplicationContent(BuildContext context, Application app) {
    return Stack(
      children: [
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Application status badge
              _buildStatusIndicator(app.status),
              const SizedBox(height: 24),

              // Application details
              _buildDetailItem(
                  context, 'Mã đơn', app.referenceNumber ?? app.id),
              _buildDetailItem(context, 'Tiêu đề', app.title),
              _buildDetailItem(context, 'Mô tả', app.description),
              _buildDetailItem(context, 'Ngày nộp',
                  _formatDate(app.submittedAt ?? app.createdAt)),

              // Attachments section
              if (app.attachments.isNotEmpty) ...[
                const SizedBox(height: 24),
                const Text(
                  'Tài liệu đính kèm',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(height: 16),
                _buildAttachmentsList(context, app.attachments),
              ],
            ],
          ),
        ),

        // Bottom action button
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Đóng'),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Content specifically for bottom sheet
  Widget _buildBottomSheetApplicationContent(
      BuildContext context, ScrollController controller, Application app) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
      ),
      child: Stack(
        children: [
          ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 80),
            children: [
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0E0E0),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Chi tiết đơn',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Application status badge
              Center(
                child: _buildStatusIndicator(app.status),
              ),
              const SizedBox(height: 24),

              // Application details
              _buildDetailItem(
                  context, 'Mã đơn', app.referenceNumber ?? app.id.toString()),
              _buildDetailItem(context, 'Tiêu đề', app.title),
              _buildDetailItem(context, 'Mô tả', app.description),
              _buildDetailItem(context, 'Ngày nộp',
                  _formatDate(app.submittedAt ?? app.createdAt)),

              // Display attachments if available
              if (app.attachments.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text(
                  'Tài liệu đính kèm',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                ..._buildAttachmentsWithPreview(context, app.attachments),
              ],
            ],
          ),

          // Fixed button at bottom
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Đóng'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusIndicator(ApplicationStatus status) {
    late Color color;
    late String label;
    late Color backgroundColor;
    late Color textColor;

    switch (status) {
      case ApplicationStatus.draft:
        backgroundColor = Colors.grey.shade200;
        color = AppTheme.statusDraft;
        textColor = Colors.black87;
        label = 'Bản nháp';
        break;
      case ApplicationStatus.submitted:
        backgroundColor = Colors.white;
        color = AppTheme.statusSubmitted;
        textColor = AppTheme.statusSubmitted;
        label = 'Đã nộp';
        break;
      case ApplicationStatus.inReview:
        backgroundColor = Colors.orange.shade50;
        color = AppTheme.statusInReview;
        textColor = Colors.orange;
        label = 'Đang xử lý';
        break;
      case ApplicationStatus.approved:
      case ApplicationStatus.completed:
        backgroundColor = Colors.green.shade50;
        color = AppTheme.statusApproved;
        textColor = Colors.green;
        label = 'Hoàn thành';
        break;
      case ApplicationStatus.rejected:
        backgroundColor = Colors.red.shade50;
        color = AppTheme.statusRejected;
        textColor = Colors.red;
        label = 'Từ chối';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }

  Widget _buildDetailItem(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppTheme.textLight,
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Divider(),
        ],
      ),
    );
  }

  // Regular attachments list without image preview
  Widget _buildAttachmentsList(BuildContext context, List<String> attachments) {
    return Column(
      children: attachments.map((attachment) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: const Icon(Icons.attach_file),
            title: Text(
              attachment,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            onTap: () {
              // Implement file open/download
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Đang tải xuống: $attachment'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        );
      }).toList(),
    );
  }

  // Attachments with image preview for bottom sheet
  List<Widget> _buildAttachmentsWithPreview(
      BuildContext context, List<String> attachments) {
    return attachments.map((attachment) {
      final bool isImage = attachment.toLowerCase().endsWith('.jpg') ||
          attachment.toLowerCase().endsWith('.jpeg') ||
          attachment.toLowerCase().endsWith('.png') ||
          attachment.toLowerCase().endsWith('.gif');

      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // File info row
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Icon(
                    isImage ? Icons.image : Icons.attach_file,
                    color: AppTheme.textSecondary,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      attachment,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),

            // Show image preview if it's an image file
            if (isImage) ...[
              const Divider(height: 1),
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(8),
                  bottomRight: Radius.circular(8),
                ),
                child: Container(
                  constraints: const BoxConstraints(
                    maxHeight: 200,
                  ),
                  width: double.infinity,
                  child: Image.network(
                    attachment,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 100,
                        color: Colors.grey.shade100,
                        child: const Center(
                          child: Text('Không thể tải ảnh'),
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        height: 100,
                        color: Colors.grey.shade50,
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                            strokeWidth: 2,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ],
        ),
      );
    }).toList();
  }

  void _showRejectConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận từ chối'),
        content: const Text('Bạn có chắc chắn muốn từ chối đơn này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Handle rejection
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã từ chối đơn')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Từ chối'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }
}

// Helper function to show application details in bottom sheet
Future<void> showApplicationDetailsSheet(
    BuildContext context, Application application) async {
  // When user taps on an application, load the details
  context.read<ApplicationBloc>().add(LoadApplicationEvent(id: application.id));

  // Use a simpler initial view to avoid freezes
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    elevation: 10,
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      expand: false,
      builder: (_, controller) {
        return ApplicationDetailsScreen(
          applicationId: application.id,
          initialApplication: application,
          isBottomSheet: true,
          scrollController: controller,
        );
      },
    ),
  );
}
