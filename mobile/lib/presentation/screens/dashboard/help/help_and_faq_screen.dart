import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class HelpAndFaqScreen extends StatelessWidget {
  const HelpAndFaqScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Trợ giúp & FAQ'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.medusaBlack),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Câu hỏi thường gặp',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.medusaBlack,
                ),
              ),
              const SizedBox(height: 16),
              _buildFaqItem(
                context,
                'Làm thế nào để tạo tài khoản mới?',
                'Để tạo tài khoản mới, bạn cần cung cấp thông tin cá nhân như Họ tên, Số CMND/CCCD, địa chỉ, email, và số điện thoại. Đảm bảo thông tin bạn cung cấp chính xác để quá trình xác minh được thuận lợi.',
              ),
              _buildFaqItem(
                context,
                'Tôi quên mật khẩu, phải làm sao?',
                'Nếu bạn quên mật khẩu, hãy nhấn vào liên kết "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi một email đặt lại mật khẩu tới địa chỉ email đã đăng ký của bạn.',
              ),
              _buildFaqItem(
                context,
                'Tôi có thể thay đổi thông tin cá nhân không?',
                'Có, bạn có thể cập nhật thông tin cá nhân bằng cách vào mục "Tài khoản" > "Chỉnh sửa thông tin". Lưu ý rằng một số thông tin quan trọng như CMND/CCCD có thể cần xác minh lại.',
              ),
              _buildFaqItem(
                context,
                'Làm thế nào để gửi hồ sơ trực tuyến?',
                'Để gửi hồ sơ trực tuyến, bạn cần truy cập vào mục "Dịch vụ", chọn dịch vụ cần sử dụng, điền đầy đủ thông tin và tải lên các giấy tờ cần thiết, sau đó nhấn nút "Gửi hồ sơ".',
              ),
              _buildFaqItem(
                context,
                'Tôi có thể theo dõi trạng thái hồ sơ bằng cách nào?',
                'Bạn có thể theo dõi trạng thái hồ sơ trong mục "Hồ sơ" trên ứng dụng. Tại đây hiển thị toàn bộ hồ sơ bạn đã gửi cùng trạng thái xử lý hiện tại.',
              ),
              _buildFaqItem(
                context,
                'Tôi cần chuẩn bị những giấy tờ gì khi nộp hồ sơ?',
                'Giấy tờ cần chuẩn bị tùy thuộc vào loại dịch vụ bạn đang sử dụng. Thông thường bao gồm: CMND/CCCD, hộ khẩu, các giấy tờ liên quan đến dịch vụ cụ thể. Bạn có thể xem chi tiết trong phần hướng dẫn của mỗi dịch vụ.',
              ),
              const SizedBox(height: 24),
              const Text(
                'Vẫn cần hỗ trợ?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.medusaBlack,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.medusaLightGray,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Liên hệ đội ngũ hỗ trợ của chúng tôi',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.medusaBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Chúng tôi sẵn sàng hỗ trợ bạn từ 8:00 - 17:00, Thứ Hai đến Thứ Sáu.',
                      style: TextStyle(color: AppTheme.medusaDarkGray),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    const ContactSupportPlaceholder()));
                      },
                      icon: const Icon(Icons.headset_mic),
                      label: const Text('Liên hệ ngay'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.medusaBlack,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        minimumSize: const Size(double.infinity, 0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFaqItem(BuildContext context, String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.medusaLightGray, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        childrenPadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
        title: Text(
          question,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: AppTheme.medusaBlack,
            fontSize: 15,
          ),
        ),
        children: [
          const Divider(),
          const SizedBox(height: 8),
          Text(
            answer,
            style: const TextStyle(
              color: AppTheme.medusaDarkGray,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

// Placeholder class for navigation - would be replaced with an actual screen
class ContactSupportPlaceholder extends StatelessWidget {
  const ContactSupportPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Liên hệ hỗ trợ'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.medusaBlack),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: const Center(
        child: Text('Màn hình liên hệ hỗ trợ'),
      ),
    );
  }
}
