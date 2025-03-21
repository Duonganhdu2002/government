// ignore_for_file: empty_catches

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application.dart';
import '../../../blocs/application/application_bloc.dart';

class ApplicationDetailsScreen extends StatelessWidget {
  final String applicationId;
  final Application? initialApplication;
  final bool isBottomSheet;
  final ScrollController? scrollController;

  const ApplicationDetailsScreen({
    super.key,
    required this.applicationId,
    this.initialApplication,
    this.isBottomSheet = false,
    this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    // Load application details always, regardless of initialApplication
    // This ensures we have the most up-to-date data from the server
    context
        .read<ApplicationBloc>()
        .add(LoadApplicationEvent(id: applicationId));

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
          if (state is ApplicationLoadingState) {
            return _buildLoadingView();
          } else if (state is ApplicationErrorState) {
            return _buildErrorView(context, state.message);
          } else if (state is ApplicationLoadedState) {
            return _buildApplicationContent(context, state.application);
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
        if (state is ApplicationLoadingState) {
          return _buildLoadingView();
        } else if (state is ApplicationErrorState) {
          return _buildErrorView(context, state.message);
        } else if (state is ApplicationLoadedState) {
          return _buildBottomSheetApplicationContent(context,
              scrollController ?? ScrollController(), state.application);
        }

        // Show initial application while loading
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
              // Title at the top center
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    'Chi tiết đơn',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ),

              // Status badge (prominent at the top)
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: _buildStatusIndicator(app.status),
                ),
              ),

              // Simple list of details with labels and values - Using a card style for basic info
              Card(
                margin: const EdgeInsets.only(bottom: 16),
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(
                          'Thông tin cơ bản',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                      _buildSimpleDetailItem(context, 'Mã đơn',
                          app.referenceNumber ?? app.id.toString()),
                      const SizedBox(height: 12),
                      _buildSimpleDetailItem(context, 'Tiêu đề', app.title),
                      const SizedBox(height: 12),
                      _buildSimpleDetailItem(context, 'Mô tả', app.description),
                      const SizedBox(height: 12),
                      _buildSimpleDetailItem(context, 'Ngày nộp',
                          _formatDate(app.submittedAt ?? app.createdAt)),
                    ],
                  ),
                ),
              ),

              // Application metadata - form data details
              if (app.formData.isNotEmpty) ...[
                Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Text(
                            'Loại đơn',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                        ),
                        if (app.formData['applicationtypename'] != null)
                          _buildSimpleDetailItem(context, 'Loại đơn',
                              app.formData['applicationtypename']),
                        if (app.formData['specialapplicationtypename'] !=
                            null) ...[
                          const SizedBox(height: 12),
                          _buildSimpleDetailItem(context, 'Loại đơn đặc biệt',
                              app.formData['specialapplicationtypename']),
                        ],
                      ],
                    ),
                  ),
                ),
              ],

              // Attachments section
              if (app.attachments.isNotEmpty) ...[
                const SizedBox(height: 16),
                // Attachments header
                Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              const Icon(Icons.attach_file,
                                  size: 20, color: AppTheme.primaryColor),
                              const SizedBox(width: 8),
                              Text(
                                'Tài liệu đính kèm',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  // Don't count placeholder as multiple attachments
                                  app.attachments.length == 1 &&
                                          app.attachments[0] ==
                                              'Có tài liệu đính kèm'
                                      ? '1 tệp'
                                      : '${app.attachments.length} tệp',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.blue.shade700,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (app.attachments.length == 1 &&
                            app.attachments[0] == 'Có tài liệu đính kèm')
                          _buildPlaceholderAttachment(context)
                        else
                          ..._buildAttachmentItems(
                              context, app.attachments, app.id),
                      ],
                    ),
                  ),
                ),
              ],

              // Application history section
              const SizedBox(height: 16),
              Card(
                margin: const EdgeInsets.only(bottom: 16),
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          children: [
                            const Icon(Icons.history,
                                size: 20, color: AppTheme.primaryColor),
                            const SizedBox(width: 8),
                            Text(
                              'Lịch sử xử lý',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Submission history item
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Circle icon
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.assignment_outlined,
                              color: Colors.blue.shade700,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Text content
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Đơn đã được nộp',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _formatDateTime(
                                      app.submittedAt ?? app.createdAt),
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Đơn của bạn đã được nộp thành công và đang chờ xử lý.',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
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

  // Create a placeholder for applications that have attachments but no URLs
  Widget _buildPlaceholderAttachment(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.insert_drive_file_outlined,
              color: Colors.blue.shade700,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tài liệu đã được đính kèm',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Vui lòng liên hệ với cơ quan nhà nước để biết chi tiết',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Get appropriate icon for file based on filename
  IconData _getFileIcon(String filename) {
    final extension = filename.split('.').last.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].contains(extension)) {
      return Icons.image;
    } else if (['mp4', 'mov', 'avi'].contains(extension)) {
      return Icons.video_file;
    } else if (['pdf'].contains(extension)) {
      return Icons.picture_as_pdf;
    } else if (['doc', 'docx'].contains(extension)) {
      return Icons.description;
    } else if (['xls', 'xlsx'].contains(extension)) {
      return Icons.table_chart;
    }

    return Icons.insert_drive_file;
  }

  // Get a full URL for attachment with better fallback options
  String _getAttachmentUrl(String attachment, String applicationId) {
    // If it's already a full URL, return it
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }

    // If it's a placeholder message and not an actual URL
    if (attachment == 'Có tài liệu đính kèm') {
      return '';
    }

    // Handle paths that start with /uploads/ directly - this is the main path we should use
    if (attachment.startsWith('/uploads/')) {
      return '${ApiConstants.baseUrl}$attachment';
    }

    // For direct filepath that might not start with /uploads/
    if (attachment.contains('/') && !RegExp(r'^\d+$').hasMatch(attachment)) {
      String cleanPath =
          attachment.startsWith('/') ? attachment : '/$attachment';
      return '${ApiConstants.baseUrl}$cleanPath';
    }

    // For mediafileid direct access - LAST RESORT approach, prefer filepath when available
    if (RegExp(r'^\d+$').hasMatch(attachment)) {
      return '${ApiConstants.baseUrl}/api/media-files/serve/$attachment';
    }

    // Otherwise, construct the standard URL
    return '${ApiConstants.baseUrl}${ApiConstants.applicationsEndpoint}/$applicationId/attachments/$attachment';
  }

  // Simple detail item without dividers
  Widget _buildSimpleDetailItem(
      BuildContext context, String label, String value) {
    return Column(
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
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  // Get auth token from shared preferences

  // Advanced attachment items that look like the web UI
  List<Widget> _buildAttachmentItems(
      BuildContext context, List<String> attachments, String applicationId) {

    return attachments.map((attachment) {
      final String fileSize = "101 KB";
      final String date = _formatDate(DateTime.now());
      final String fileName = attachment.split('/').last.isEmpty
          ? "File-13"
          : attachment.split('/').last;
      final IconData fileIcon = _getFileIcon(fileName);

      // Always treat uploads as image files
      final bool isImage = true;

      // Get the full URL using our helper method
      final String fullAttachmentUrl =
          _getAttachmentUrl(attachment, applicationId);


      return InkWell(
        onTap: () => _showMediaFullScreen(context, fullAttachmentUrl),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // File info header
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(fileIcon, color: AppTheme.textSecondary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tài liệu #$fileName',
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "$fileSize • $date",
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.open_in_full,
                        size: 18, color: Colors.grey.shade600),
                  ],
                ),
              ),

              // Luôn hiển thị ảnh cho tất cả tài liệu từ API
              if (isImage) ...[
                const Divider(height: 1),
                Container(
                  constraints: const BoxConstraints(maxHeight: 180),
                  width: double.infinity,
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    child: DirectImageView(
                      imageUrl: fullAttachmentUrl,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }).toList();
  }

  // Hiển thị ảnh toàn màn hình khi nhấn vào
  void _showMediaFullScreen(BuildContext context, String url) async {
    // Log the URL we're trying to display

    // Lấy token trước khi hiển thị

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            backgroundColor: Colors.black,
            iconTheme: const IconThemeData(color: Colors.white),
            title: const Text(
              'Xem tài liệu',
              style: TextStyle(color: Colors.white),
            ),
          ),
          backgroundColor: Colors.black,
          body: Center(
            // Use our improved DirectImageView instead of Image.network directly
            child: InteractiveViewer(
              minScale: 0.5,
              maxScale: 4.0,
              child: DirectImageView(imageUrl: url),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(ApplicationStatus status) {
    late Color bgColor;
    late Color textColor;
    late String label;

    switch (status) {
      case ApplicationStatus.draft:
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        label = 'Bản nháp';
        break;
      case ApplicationStatus.submitted:
        bgColor = Colors.blue.shade50;
        textColor = Colors.blue.shade700;
        label = 'Đã nộp';
        break;
      case ApplicationStatus.inReview:
        bgColor = Colors.orange.shade50;
        textColor = Colors.orange.shade700;
        label = 'Đang xử lý';
        break;
      case ApplicationStatus.approved:
      case ApplicationStatus.completed:
        bgColor = Colors.green.shade50;
        textColor = Colors.green.shade700;
        label = 'Hoàn thành';
        break;
      case ApplicationStatus.rejected:
        bgColor = Colors.red.shade50;
        textColor = Colors.red.shade700;
        label = 'Từ chối';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
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
        final String fileName = attachment.split('/').last.isEmpty
            ? "File"
            : attachment.split('/').last;
        final IconData fileIcon = _getFileIcon(fileName);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Icon(fileIcon, color: AppTheme.textSecondary),
            title: Text(
              fileName,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            onTap: () {
              // Implement file open/download
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Đang tải xuống: $fileName'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        );
      }).toList(),
    );
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

  // Format date with time
  String _formatDateTime(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }
}

// Helper function to show application details in bottom sheet
Future<void> showApplicationDetailsSheet(
    BuildContext context, Application application) async {
  // Always call the LoadApplicationEvent when showing the details sheet
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
      initialChildSize: 0.7,
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

// Thêm một widget mới để hiển thị ảnh trực tiếp với token và retry mechanism
class DirectImageView extends StatefulWidget {
  final String imageUrl;

  const DirectImageView({
    super.key,
    required this.imageUrl,
  });

  @override
  DirectImageViewState createState() => DirectImageViewState();
}

class DirectImageViewState extends State<DirectImageView> {
  String? _authToken;
  int _loadAttempt = 0;
  static const int _maxRetries = 3;

  @override
  void initState() {
    super.initState();
    _getAuthToken();
  }

  Future<void> _getAuthToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.tokenKey);
      if (mounted) {
        setState(() {
          _authToken = token;
        });
      }
    } catch (e) {
    }
  }

  // Tạo URL cho media dựa vào số lần thử, tương tự web application
  String _getImageUrlWithRetry() {
    final url = widget.imageUrl;

    // Phân tích URL
    final isUploadPath = url.contains('/uploads/');
    final isMediaServe = url.contains('/api/media-files/serve/');

    // Strategy 1: Dùng URL gốc (1st attempt)
    if (_loadAttempt == 0) {
      return url;
    }

    // Strategy 2: Thêm timestamp để bypass cache (2nd attempt)
    if (_loadAttempt == 1) {
      return '$url?v=${DateTime.now().millisecondsSinceEpoch}';
    }

    // Strategy 3: Nếu là URL uploads, thử chuyển sang dùng media-files/serve API
    if (_loadAttempt == 2 && isUploadPath) {
      // Extract filename or ID from path
      final mediaId = url.split('/').last.split('-').first;
      if (mediaId.isNotEmpty) {
        final baseUrl = url.split('/uploads/').first;
        return '$baseUrl/api/media-files/serve/$mediaId';
      }
    }

    // Strategy 4: Nếu là API serve, thử dùng đường dẫn trực tiếp
    if (_loadAttempt == 3 && isMediaServe) {
      // Try using a direct path instead
      final baseUrl = url.split('/api/media-files/serve/').first;
      final mediaId = url.split('/').last;
      if (mediaId.isNotEmpty) {
        return '$baseUrl/uploads/$mediaId.png'; // Thử với extension .png
      }
    }

    // Fallback - Dùng URL gốc
    return url;
  }

  void _retryLoading() {
    if (_loadAttempt < _maxRetries) {
      setState(() {
        _loadAttempt++;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_authToken == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final imageUrl = _getImageUrlWithRetry();

    return Image.network(
      imageUrl,
      fit: BoxFit.cover,
      headers: {'Authorization': 'Bearer $_authToken'},
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) {
          return child;
        }
        return Center(
          child: CircularProgressIndicator(
            value: loadingProgress.expectedTotalBytes != null
                ? loadingProgress.cumulativeBytesLoaded /
                    loadingProgress.expectedTotalBytes!
                : null,
          ),
        );
      },
      errorBuilder: (context, error, stackTrace) {

        if (_loadAttempt < _maxRetries) {
          // Auto retry with a slight delay for UI feedback
          Future.delayed(const Duration(milliseconds: 800), () {
            if (mounted) _retryLoading();
          });
        }

        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.broken_image),
              const SizedBox(height: 8),
              const Text('Không thể tải ảnh'),
              const SizedBox(height: 4),
              Text('Đang thử cách khác... (${_loadAttempt + 1}/$_maxRetries)',
                  style: const TextStyle(fontSize: 10, color: Colors.grey)),
              if (_loadAttempt >= _maxRetries) ...[
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: _retryLoading,
                  child: const Text('Thử lại'),
                ),
              ]
            ],
          ),
        );
      },
    );
  }
}
