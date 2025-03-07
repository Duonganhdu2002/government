"use client";

import React, { useState, useEffect } from 'react';
import { 
  Heading, 
  Text, 
  Button, 
  Badge
} from '@medusajs/ui';
import { ChevronLeft, Calendar, MapPin } from '@medusajs/icons';
import { fetchApplicationById } from '@/services/applicationService';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import Modal from './Modal';

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
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>{children}</div>;
};

Card.Header = ({ children, className = "" }: CardPartProps) => {
  return <div className={`px-4 py-3 border-b border-gray-200 bg-gray-50 ${className}`}>{children}</div>;
};

Card.Content = ({ children, className = "" }: CardPartProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
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

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number | null;
}

export default function ApplicationDetailModal({ isOpen, onClose, applicationId }: ApplicationDetailModalProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isOpen || !applicationId) return;
    
    const fetchApplicationDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApplicationById(applicationId.toString());
        setApplication(data);
      } catch (err) {
        console.error('Failed to fetch application details:', err);
        setError('Không thể tải thông tin chi tiết của đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationDetail();
  }, [isOpen, applicationId]);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <Modal.Header className="px-6 py-5">
        {application ? (
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2">{application.title}</Heading>
              <div className="flex items-center gap-2 mt-1">
                <Text size="small" className="text-ui-fg-subtle">Mã đơn: {application.applicationid}</Text>
                {getStatusBadge(application.status)}
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="small"
              disabled={true}
            >
              <span className="w-4 h-4 mr-1"><FileTextIcon /></span>
              In đơn
            </Button>
          </div>
        ) : (
          <Heading level="h2">Chi tiết đơn</Heading>
        )}
      </Modal.Header>
      
      <Modal.Body className="px-6 py-5">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner className="mr-2" />
            <Text>Đang tải dữ liệu...</Text>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <Text className="text-red-600">{error}</Text>
          </div>
        ) : !application ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <Text className="text-yellow-700">Không tìm thấy thông tin đơn.</Text>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className="p-4 bg-gray-50 rounded-md">
                          <Text>{application.description}</Text>
                        </div>
                      </div>
                    )}
                    
                    {application.eventdate && (
                      <div className="flex items-center gap-2 mt-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Text>Ngày diễn ra: {formatDate(application.eventdate)}</Text>
                      </div>
                    )}
                    
                    {application.location && (
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <Text>Địa điểm: {application.location}</Text>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
            
            {application.hasmedia && (
              <Card className="mt-6">
                <Card.Header>
                  <Heading level="h3">Tài liệu đính kèm</Heading>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Phần này sẽ hiển thị ảnh và video đính kèm */}
                      <div className="border border-gray-200 rounded-md p-4 text-center hover:shadow-md transition-shadow">
                        <div className="flex justify-center items-center h-36 bg-gray-100 rounded mb-2">
                          <span className="w-10 h-10 text-gray-400"><ImageIcon /></span>
                        </div>
                        <Text className="text-sm text-gray-500">Đang tải tệp đính kèm...</Text>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md p-4 text-center hover:shadow-md transition-shadow">
                        <div className="flex justify-center items-center h-36 bg-gray-100 rounded mb-2">
                          <span className="w-10 h-10 text-gray-400"><VideoIcon /></span>
                        </div>
                        <Text className="text-sm text-gray-500">Đang tải tệp đính kèm...</Text>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}
            
            <Card className="mt-6">
              <Card.Header>
                <Heading level="h3">Lịch sử xử lý</Heading>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
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
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="px-6 py-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
} 