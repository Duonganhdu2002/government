import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'help_and_faq_screen.dart';
import 'contact_support_screen.dart';
import 'privacy_policy_screen.dart';

class HelpMenuScreen extends StatelessWidget {
  const HelpMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Hỗ trợ'),
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
              // Header section with icon and text
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.medusaLightGray,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.support_agent,
                        size: 48,
                        color: AppTheme.medusaBlack,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.medusaBlack,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Chọn một trong các tùy chọn dưới đây để được giúp đỡ',
                      style: TextStyle(
                        color: AppTheme.medusaGray,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

              // Help options container
              Container(
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: AppTheme.medusaLightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    // Help & FAQ option
                    _buildHelpOption(
                      context,
                      Icons.help_outline,
                      'Trợ giúp & FAQ',
                      'Các câu hỏi và câu trả lời thường gặp',
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const HelpAndFaqScreen(),
                        ),
                      ),
                    ),

                    const Divider(height: 1, indent: 16, endIndent: 16),

                    // Contact Support option
                    _buildHelpOption(
                      context,
                      Icons.headset_mic,
                      'Liên hệ hỗ trợ',
                      'Gửi yêu cầu hỗ trợ tới đội ngũ chúng tôi',
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ContactSupportScreen(),
                        ),
                      ),
                    ),

                    const Divider(height: 1, indent: 16, endIndent: 16),

                    // Privacy Policy option
                    _buildHelpOption(
                      context,
                      Icons.privacy_tip_outlined,
                      'Chính sách bảo mật',
                      'Thông tin về cách chúng tôi bảo vệ dữ liệu của bạn',
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const PrivacyPolicyScreen(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Additional info section
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.medusaLightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Working hours section
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.medusaLightGray,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.access_time,
                            color: AppTheme.medusaDarkGray,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Giờ làm việc',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.medusaBlack,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Thứ Hai - Thứ Sáu: 8:00 - 17:00\nThứ Bảy: 8:00 - 12:00\nChủ Nhật: Nghỉ',
                                style: TextStyle(
                                  color: AppTheme.medusaDarkGray,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 16),

                    // Hotline section
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.medusaLightGray,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.phone,
                            color: AppTheme.medusaDarkGray,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Đường dây nóng',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.medusaBlack,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                '1900 1234',
                                style: TextStyle(
                                  color: AppTheme.medusaDarkGray,
                                  fontSize: 14,
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

              // App version
              const Center(
                child: Padding(
                  padding: EdgeInsets.only(top: 8.0, bottom: 16.0),
                  child: Text(
                    'Phiên bản ứng dụng: 1.0.0',
                    style: TextStyle(
                      color: AppTheme.medusaGray,
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHelpOption(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.medusaLightGray,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: AppTheme.medusaBlack,
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.medusaBlack,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppTheme.medusaGray,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: AppTheme.medusaGray,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
