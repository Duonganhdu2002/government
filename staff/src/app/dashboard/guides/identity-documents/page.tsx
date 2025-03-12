"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Heading, 
  Text, 
  Button,
  Container,
  Badge,
  Table
} from '@medusajs/ui';
import { 
  User, 
  DocumentText, 
  ChevronRight,
  ChevronLeft,
  ArrowUpTray,
  Check
} from '@medusajs/icons';

// DocumentRequirement component
const DocumentRequirement = ({ 
  title, 
  required, 
  description 
}: { 
  title: string; 
  required: boolean; 
  description: string;
}) => {
  return (
    <div className="flex items-start py-3 border-b border-ui-border-base">
      <div className="flex-1">
        <div className="flex items-center">
          <Text weight="plus">{title}</Text>
          {required ? (
            <Badge className="ml-2 bg-red-100 text-red-600">Bắt buộc</Badge>
          ) : (
            <Badge className="ml-2 bg-gray-100 text-gray-600">Tùy chọn</Badge>
          )}
        </div>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {description}
        </Text>
      </div>
    </div>
  );
};

// Step component
const Step = ({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="flex items-start mb-6">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
        <span className="font-medium">{number}</span>
      </div>
      <div className="ml-4">
        <Text weight="plus" className="text-lg mb-1">{title}</Text>
        <Text className="text-ui-fg-subtle">{description}</Text>
      </div>
    </div>
  );
};

// Main Guide Page component
export default function IdentityDocumentsGuidePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center text-ui-fg-subtle text-sm">
        <Link href="/dashboard" className="hover:text-ui-fg-base">
          Trang chủ
        </Link>
        <ChevronRight className="mx-2 w-4 h-4" />
        <Link href="/dashboard/guides" className="hover:text-ui-fg-base">
          Tài liệu hướng dẫn
        </Link>
        <ChevronRight className="mx-2 w-4 h-4" />
        <span className="text-ui-fg-base">Giấy tờ cá nhân</span>
      </div>
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <Heading level="h1" className="text-3xl">Chuẩn bị hồ sơ cá nhân</Heading>
          </div>
        </div>
        <Text className="text-ui-fg-subtle">
          Hướng dẫn chuẩn bị đầy đủ giấy tờ cá nhân cho các dịch vụ hành chính công
        </Text>
      </div>
      
      {/* Main content */}
      <div className="mb-10">
        <Heading level="h2" className="text-2xl mb-4">Giới thiệu</Heading>
        <Text className="mb-4">
          Khi thực hiện các thủ tục hành chính, việc chuẩn bị đầy đủ giấy tờ cá nhân là bước đầu tiên và quan trọng nhất. 
          Hướng dẫn này sẽ giúp bạn hiểu và chuẩn bị các loại giấy tờ cá nhân cần thiết, đảm bảo quá trình nộp hồ sơ diễn ra thuận lợi.
        </Text>
        <Text className="mb-4">
          Các loại giấy tờ cá nhân thường được yêu cầu trong các dịch vụ hành chính công bao gồm giấy tờ tùy thân (CCCD/CMND, hộ chiếu), 
          giấy tờ hộ khẩu, giấy khai sinh, và các giấy tờ chứng minh tình trạng hôn nhân, học vấn, v.v.
        </Text>
      </div>
      
      {/* Documents section */}
      <div className="mb-10">
        <Heading level="h2" className="text-2xl mb-6">Các loại giấy tờ cá nhân cơ bản</Heading>
        
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 mb-8">
          <Heading level="h3" className="text-xl mb-4">Giấy tờ tùy thân</Heading>
          
          <DocumentRequirement 
            title="Căn cước công dân (CCCD)" 
            required={true} 
            description="CCCD gắn chip là giấy tờ quan trọng nhất, được sử dụng trong hầu hết các thủ tục hành chính. Đối với công dân từ đủ 14 tuổi trở lên."
          />
          
          <DocumentRequirement 
            title="Chứng minh nhân dân (CMND)" 
            required={false} 
            description="Có thể thay thế CCCD trong một số trường hợp. Tuy nhiên, CMND đang dần được thay thế bằng CCCD gắn chip."
          />
          
          <DocumentRequirement 
            title="Hộ chiếu" 
            required={false} 
            description="Cần thiết cho các thủ tục liên quan đến xuất nhập cảnh hoặc một số giao dịch đặc biệt."
          />
        </div>
        
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 mb-8">
          <Heading level="h3" className="text-xl mb-4">Giấy tờ hộ khẩu và cư trú</Heading>
          
          <DocumentRequirement 
            title="Sổ hộ khẩu" 
            required={true} 
            description="Chứng minh nơi cư trú chính thức của công dân. Từ ngày 01/07/2023, sổ hộ khẩu giấy được thay thế bằng dữ liệu điện tử."
          />
          
          <DocumentRequirement 
            title="Giấy xác nhận thông tin về cư trú" 
            required={false} 
            description="Thay thế cho sổ hộ khẩu giấy sau ngày 01/07/2023, có thể lấy tại công an phường/xã hoặc qua cổng dịch vụ công."
          />
          
          <DocumentRequirement 
            title="Giấy tạm trú" 
            required={false} 
            description="Dành cho người không đăng ký thường trú tại nơi đang sinh sống."
          />
        </div>
        
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
          <Heading level="h3" className="text-xl mb-4">Giấy tờ chứng minh nhân thân khác</Heading>
          
          <DocumentRequirement 
            title="Giấy khai sinh" 
            required={true} 
            description="Chứng minh thông tin cá nhân cơ bản, quan trọng trong nhiều thủ tục hành chính."
          />
          
          <DocumentRequirement 
            title="Giấy chứng nhận kết hôn" 
            required={false} 
            description="Cần thiết cho các thủ tục liên quan đến tài sản chung, thừa kế, v.v."
          />
          
          <DocumentRequirement 
            title="Bằng cấp, chứng chỉ" 
            required={false} 
            description="Cần thiết cho các thủ tục liên quan đến công việc, giáo dục, v.v."
          />
        </div>
      </div>
      
      {/* Guidance section */}
      <div className="mb-10">
        <Heading level="h2" className="text-2xl mb-6">Quy trình chuẩn bị hồ sơ</Heading>
        
        <Step 
          number={1} 
          title="Xác định loại giấy tờ cần thiết" 
          description="Tùy thuộc vào loại dịch vụ hành chính, hãy xác định chính xác các loại giấy tờ cần chuẩn bị. Bạn có thể tham khảo thông tin trên cổng dịch vụ công hoặc liên hệ trực tiếp cơ quan chức năng."
        />
        
        <Step 
          number={2} 
          title="Kiểm tra tính hợp lệ của giấy tờ" 
          description="Đảm bảo giấy tờ còn hiệu lực, không bị hư hỏng, rách nát. Đối với CCCD/CMND và hộ chiếu, hãy kiểm tra ngày hết hạn."
        />
        
        <Step 
          number={3} 
          title="Chuẩn bị bản sao công chứng" 
          description="Nhiều thủ tục yêu cầu bản sao công chứng của giấy tờ gốc. Hãy chuẩn bị đủ số lượng bản sao cần thiết, thường là 01-02 bản cho mỗi loại giấy tờ."
        />
        
        <Step 
          number={4} 
          title="Sắp xếp hồ sơ theo thứ tự" 
          description="Sắp xếp giấy tờ theo thứ tự yêu cầu của thủ tục, giúp cán bộ tiếp nhận dễ dàng kiểm tra và xử lý hồ sơ của bạn."
        />
        
        <Step 
          number={5} 
          title="Kiểm tra lại toàn bộ hồ sơ" 
          description="Trước khi nộp, hãy kiểm tra lại một lần nữa để đảm bảo đã chuẩn bị đầy đủ và đúng yêu cầu."
        />
      </div>
      
      {/* Tips section */}
      <div className="mb-10 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <Heading level="h2" className="text-xl mb-4 text-blue-700">Lưu ý quan trọng</Heading>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <Text>Luôn mang theo bản gốc các giấy tờ khi đi nộp hồ sơ để đối chiếu khi cần.</Text>
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <Text>Bản sao công chứng thường có giá trị trong vòng 6 tháng kể từ ngày công chứng.</Text>
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <Text>Đối với dịch vụ công trực tuyến, hãy chuẩn bị bản scan hoặc ảnh chụp rõ nét của các giấy tờ.</Text>
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <Text>Nếu bạn không chắc chắn về giấy tờ cần chuẩn bị, hãy liên hệ trước với cơ quan tiếp nhận hồ sơ.</Text>
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <Text>Một số thủ tục đặc biệt có thể yêu cầu giấy tờ bổ sung, hãy chú ý đọc kỹ hướng dẫn.</Text>
          </li>
        </ul>
      </div>
      
      {/* FAQ section */}
      <div className="mb-10">
        <Heading level="h2" className="text-2xl mb-6">Câu hỏi thường gặp</Heading>
        
        <div className="space-y-6">
          <div>
            <Heading level="h3" className="text-lg mb-2">CCCD bị mất thì làm thế nào?</Heading>
            <Text className="text-ui-fg-subtle">
              Khi bị mất CCCD, bạn cần báo cho cơ quan công an nơi gần nhất và làm thủ tục cấp lại tại công an quận/huyện nơi đã đăng ký thường trú. 
              Cần mang theo giấy tờ tùy thân khác để chứng minh nhân thân.
            </Text>
          </div>
          
          <div>
            <Heading level="h3" className="text-lg mb-2">Có thể sử dụng CCCD/CMND đã hết hạn không?</Heading>
            <Text className="text-ui-fg-subtle">
              CCCD/CMND đã hết hạn sẽ không được chấp nhận trong hầu hết các thủ tục hành chính. 
              Bạn nên làm thủ tục đổi CCCD/CMND trước khi thực hiện các thủ tục hành chính khác.
            </Text>
          </div>
          
          <div>
            <Heading level="h3" className="text-lg mb-2">Đã bỏ sổ hộ khẩu giấy, làm sao để chứng minh nơi cư trú?</Heading>
            <Text className="text-ui-fg-subtle">
              Từ ngày 01/07/2023, bạn có thể sử dụng VNeID hoặc yêu cầu cấp giấy xác nhận thông tin về cư trú tại công an cấp xã nơi cư trú 
              hoặc truy cập Cổng Dịch vụ công quốc gia, Cổng Dịch vụ công Bộ Công an để yêu cầu cấp giấy này.
            </Text>
          </div>
        </div>
      </div>
      
      {/* Related guides */}
      <div className="mb-10">
        <Heading level="h2" className="text-2xl mb-6">Hướng dẫn liên quan</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/guides/identity-cards" className="no-underline">
            <div className="border border-ui-border-base rounded-lg p-4 hover:border-ui-border-base-hover hover:shadow-sm transition-all">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Text weight="plus">Giấy tờ tùy thân</Text>
                  <Text size="small" className="text-ui-fg-subtle">Hướng dẫn chi tiết về CCCD, CMND và hộ chiếu</Text>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/guides/household-registration" className="no-underline">
            <div className="border border-ui-border-base rounded-lg p-4 hover:border-ui-border-base-hover hover:shadow-sm transition-all">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <DocumentText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Text weight="plus">Giấy tờ hộ khẩu</Text>
                  <Text size="small" className="text-ui-fg-subtle">Thông tin về sổ hộ khẩu và đăng ký thường trú</Text>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Footer navigation */}
      <div className="flex justify-between pt-8 border-t border-ui-border-base">
        <Link href="/guides">
          <Button variant="secondary">
            <ChevronLeft className="mr-2" />
            Quay lại danh sách hướng dẫn
          </Button>
        </Link>
        
        <Link href="/dashboard/applications">
          <Button>
            Nộp hồ sơ ngay
            <ChevronRight className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
} 