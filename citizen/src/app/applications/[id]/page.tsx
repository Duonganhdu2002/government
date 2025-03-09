"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Badge
} from '@medusajs/ui';
import { ChevronLeft, Calendar, MapPin } from '@medusajs/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { fetchApplicationById } from '@/services/applicationService';
import PrintPreview from '@/components/PrintPreview';

// Custom icons
interface IconProps {
  className?: string;
}

const FileTextIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ImageIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="10" y1="8" x2="10" y2="16" />
    <line x1="14" y1="8" x2="14" y2="16" />
  </svg>
);

// Custom Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardPartProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>{children}</div>;
};

Card.Header = ({ children, className = "" }: CardPartProps) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

Card.Content = ({ children, className = "" }: CardPartProps) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

// Spinner component
interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className = "" }: SpinnerProps) => (
  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 ${className}`}></div>
);

// Hàm để lấy status badge dựa trên trạng thái của đơn
const getStatusBadge = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'submitted':
      return <Badge color="blue">Đã nộp</Badge>;
    case 'processing':
      return <Badge color="orange">Đang xử lý</Badge>;
    case 'completed':
      return <Badge color="green">Hoàn thành</Badge>;
    case 'rejected':
      return <Badge color="red">Từ chối</Badge>;
    default:
      return <Badge color="grey">{status}</Badge>;
  }
};

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // Lấy ID từ params
  const id = params?.id as string;
  
  useEffect(() => {
    // Kiểm tra nếu người dùng đã đăng nhập
    if (!isAuthenticated) {
      router.push(`/login?redirect=/applications/${id}`);
      return;
    }
    
    // Lấy chi tiết đơn
    const getApplicationDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApplicationById(id);
        setApplication(data);
      } catch (err) {
        console.error('Failed to fetch application details:', err);
        setError('Không thể tải thông tin chi tiết của đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      getApplicationDetail();
    }
  }, [id, isAuthenticated, router]);
  
  // Quay lại trang lịch sử đơn
  const handleBackToHistory = () => {
    router.push('/applications/history');
  };
  
  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center items-center py-20">
          <Spinner className="mr-2" />
          <Text>Đang tải dữ liệu...</Text>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="secondary" 
            size="small"
            onClick={handleBackToHistory}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <Text className="text-red-600">{error}</Text>
        </div>
      </Container>
    );
  }
  
  if (!application) {
    return (
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="secondary" 
            size="small"
            onClick={handleBackToHistory}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <Text className="text-yellow-700">Không tìm thấy thông tin đơn.</Text>
        </div>
      </Container>
    );
  }
  
  return (
    <>
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="secondary" 
            size="small"
            onClick={handleBackToHistory}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <Heading level="h1" className="mb-2">{application.title}</Heading>
            <div className="flex items-center gap-4">
              <Text className="text-gray-600">Mã đơn: {application.applicationid}</Text>
              {getStatusBadge(application.status)}
            </div>
          </div>
          
          <div>
            <Button 
              variant="secondary"
              onClick={() => setShowPrintPreview(true)}
            >
              <span className="w-4 h-4 mr-1"><FileTextIcon /></span>
              In đơn
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <Card.Header>
              <Heading level="h3">Thông tin cơ bản</Heading>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div>
                  <Text className="text-gray-500 text-sm">Loại đơn</Text>
                  <Text className="font-medium">{application.applicationtypename}</Text>
                </div>
                
                {application.specialapplicationtypename && (
                  <div>
                    <Text className="text-gray-500 text-sm">Loại đơn đặc biệt</Text>
                    <Text className="font-medium">{application.specialapplicationtypename}</Text>
                  </div>
                )}
                
                <div>
                  <Text className="text-gray-500 text-sm">Ngày nộp</Text>
                  <Text className="font-medium">{formatDateTime(application.submissiondate)}</Text>
                </div>
                
                <div>
                  <Text className="text-gray-500 text-sm">Hạn xử lý</Text>
                  <Text className="font-medium">{formatDate(application.duedate)}</Text>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          <Card className="md:col-span-2">
            <Card.Header>
              <Heading level="h3">Nội dung</Heading>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {application.description && (
                  <div>
                    <Text className="text-gray-500 text-sm mb-1">Mô tả</Text>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <Text>{application.description}</Text>
                    </div>
                  </div>
                )}
                
                {application.eventdate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Text>Ngày diễn ra: {formatDate(application.eventdate)}</Text>
                  </div>
                )}
                
                {application.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Text>Địa điểm: {application.location}</Text>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
        
        {application.hasmedia && (
          <Card className="mb-8">
            <Card.Header>
              <Heading level="h3">Tài liệu đính kèm</Heading>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Phần này sẽ hiển thị ảnh và video đính kèm - trong thực tế, chúng ta sẽ cần thêm API để lấy danh sách media */}
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <div className="flex justify-center items-center h-32 bg-gray-100 rounded mb-2">
                      <span className="w-8 h-8 text-gray-400"><ImageIcon /></span>
                    </div>
                    <Text className="text-sm text-gray-500">Đang tải tệp đính kèm...</Text>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <div className="flex justify-center items-center h-32 bg-gray-100 rounded mb-2">
                      <span className="w-8 h-8 text-gray-400"><VideoIcon /></span>
                    </div>
                    <Text className="text-sm text-gray-500">Đang tải tệp đính kèm...</Text>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}
        
        <Card>
          <Card.Header>
            <Heading level="h3">Lịch sử xử lý</Heading>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="w-6 h-6 text-blue-700"><FileTextIcon /></span>
                </div>
                <div>
                  <Text className="font-medium">Đơn đã được nộp</Text>
                  <Text className="text-gray-500 text-sm">{formatDateTime(application.submissiondate)}</Text>
                  <Text className="text-sm mt-1">Đơn của bạn đã được nộp thành công và đang chờ xử lý.</Text>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </Container>

      {/* Print Preview Modal */}
      {showPrintPreview && application && (
        <PrintPreview 
          application={application} 
          onClose={() => setShowPrintPreview(false)} 
        />
      )}
    </>
  );
} 