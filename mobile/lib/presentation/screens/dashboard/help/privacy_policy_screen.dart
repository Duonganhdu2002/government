import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Chính sách bảo mật'),
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
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.medusaLightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Chính sách bảo mật thông tin',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.medusaBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Cập nhật lần cuối: ${_formatDate(DateTime.now())}',
                      style: const TextStyle(
                        color: AppTheme.medusaGray,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              _buildSectionContainer(
                'Giới thiệu',
                'Ứng dụng Dịch vụ Công (sau đây gọi là "chúng tôi") cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. Chính sách bảo mật này nhằm giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng ứng dụng và dịch vụ của chúng tôi.',
              ),
              _buildSectionContainer(
                'Thông tin chúng tôi thu thập',
                '',
                bulletPoints: [
                  'Thông tin cá nhân: họ tên, địa chỉ, số điện thoại, email, số CMND/CCCD',
                  'Thông tin đăng nhập: tên đăng nhập, mật khẩu (được mã hóa)',
                  'Thông tin thiết bị: loại thiết bị, phiên bản hệ điều hành, định danh thiết bị',
                  'Dữ liệu sử dụng: thao tác sử dụng, thời gian truy cập, lỗi ứng dụng',
                ],
              ),
              _buildSectionContainer(
                'Mục đích sử dụng thông tin',
                '',
                bulletPoints: [
                  'Cung cấp các dịch vụ hành chính công',
                  'Xác thực danh tính người dùng',
                  'Xử lý và theo dõi các hồ sơ, yêu cầu của bạn',
                  'Liên hệ với bạn về tình trạng hồ sơ và các thông báo quan trọng',
                  'Cải thiện chất lượng dịch vụ',
                  'Đảm bảo an toàn và bảo mật thông tin',
                ],
              ),
              _buildSectionContainer(
                'Bảo mật thông tin',
                '',
                bulletPoints: [
                  'Áp dụng các biện pháp bảo mật kỹ thuật tiên tiến',
                  'Mã hóa dữ liệu nhạy cảm',
                  'Giới hạn quyền truy cập vào thông tin cá nhân',
                  'Thường xuyên đánh giá và cập nhật các biện pháp bảo mật',
                ],
              ),
              _buildSectionContainer(
                'Chia sẻ thông tin',
                '',
                bulletPoints: [
                  'Các cơ quan nhà nước có thẩm quyền để xử lý hồ sơ',
                  'Đơn vị cung cấp dịch vụ kỹ thuật và hỗ trợ',
                  'Các bên khác khi có yêu cầu của pháp luật',
                ],
                additionalText:
                    'Trong mọi trường hợp, chúng tôi chỉ chia sẻ thông tin cần thiết và đảm bảo bên nhận có biện pháp bảo vệ thông tin phù hợp.',
              ),
              _buildSectionContainer(
                'Quyền của người dùng',
                '',
                bulletPoints: [
                  'Quyền truy cập và xem thông tin',
                  'Quyền yêu cầu chỉnh sửa thông tin không chính xác',
                  'Quyền yêu cầu hạn chế xử lý thông tin',
                  'Quyền yêu cầu xóa thông tin (trong phạm vi pháp luật cho phép)',
                  'Quyền phản đối việc xử lý thông tin',
                ],
              ),
              _buildSectionContainer(
                'Thời gian lưu trữ',
                'Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để thực hiện mục đích thu thập hoặc theo quy định của pháp luật. Sau thời gian này, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn.',
              ),
              _buildSectionContainer(
                'Cookie và công nghệ theo dõi',
                'Ứng dụng của chúng tôi có thể sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm người dùng, phân tích xu hướng sử dụng và quản lý ứng dụng. Bạn có thể điều chỉnh cài đặt thiết bị để từ chối một số cookie, nhưng điều này có thể ảnh hưởng đến chức năng của ứng dụng.',
              ),
              _buildSectionContainer(
                'Thay đổi chính sách',
                'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Khi có thay đổi đáng kể, chúng tôi sẽ thông báo cho bạn thông qua ứng dụng hoặc bằng các phương tiện phù hợp khác. Việc bạn tiếp tục sử dụng ứng dụng sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.',
              ),
              _buildSectionContainer(
                'Liên hệ',
                'Nếu bạn có câu hỏi hoặc thắc mắc về chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin của bạn, vui lòng liên hệ:',
                contactInfo: [
                  'Email: privacy@gov.vn',
                  'Điện thoại: 1900 1234',
                  'Địa chỉ: Tòa nhà Chính phủ điện tử, 1 Ngô Quyền, Hà Nội',
                ],
              ),
              Container(
                margin: const EdgeInsets.only(top: 16, bottom: 24),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.medusaLightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.medusaLightGray,
                    width: 1,
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.security,
                      color: AppTheme.medusaDarkGray,
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và tuân thủ các quy định pháp luật về bảo vệ dữ liệu.',
                        style: TextStyle(
                          color: AppTheme.medusaDarkGray,
                          fontStyle: FontStyle.italic,
                          fontSize: 14,
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

  Widget _buildSectionContainer(
    String title,
    String content, {
    List<String>? bulletPoints,
    String? additionalText,
    List<String>? contactInfo,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.medusaLightGray.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: AppTheme.medusaBlack,
            ),
          ),
          const SizedBox(height: 8),
          if (content.isNotEmpty)
            Text(
              content,
              style: const TextStyle(
                fontSize: 15,
                color: AppTheme.medusaDarkGray,
                height: 1.5,
              ),
            ),
          if (bulletPoints != null && bulletPoints.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...bulletPoints.map((point) => _buildBulletPoint(point)),
          ],
          if (additionalText != null && additionalText.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              additionalText,
              style: const TextStyle(
                fontSize: 15,
                color: AppTheme.medusaDarkGray,
                height: 1.5,
              ),
            ),
          ],
          if (contactInfo != null && contactInfo.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...contactInfo.map((info) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Text(
                    info,
                    style: const TextStyle(
                      fontSize: 15,
                      color: AppTheme.medusaDarkGray,
                      height: 1.3,
                    ),
                  ),
                )),
          ],
        ],
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              fontSize: 15,
              color: AppTheme.medusaDarkGray,
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 15,
                color: AppTheme.medusaDarkGray,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
