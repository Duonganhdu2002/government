"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Text, 
  Heading, 
  Button,
  Table,
  Badge
} from '@medusajs/ui';
import { fetchUserApplications } from '@/services/applicationService';
import { formatDate } from '@/utils/dateUtils';
import ApplicationDetailModal from '@/components/ApplicationDetailModal';

// Các icon cần thiết
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// Custom refresh icon
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6"></path>
    <path d="M2.5 12a10 10 0 0 1 19-4h-3.5"></path>
    <path d="M2.5 22v-6h6"></path>
    <path d="M21.5 12a10 10 0 0 1-19 4h3.5"></path>
  </svg>
);

// Định nghĩa kiểu dữ liệu cho một đơn hồ sơ
interface Application {
  applicationid: number;
  title: string;
  applicationtypename: string;
  status: string;
  submissiondate: string;
}

// Khóa lưu trữ trong localStorage
const APPLICATIONS_STORAGE_KEY = 'user-applications-data';
const APPLICATIONS_TIMESTAMP_KEY = 'user-applications-timestamp';

// Hàm để lấy status badge dựa trên trạng thái của đơn
const getStatusBadge = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'submitted':
      return <Badge className="bg-ui-bg-subtle text-ui-fg-base border border-ui-border-base">Đã nộp</Badge>;
    case 'processing':
      return <Badge className="bg-ui-bg-base text-ui-fg-base border border-ui-border-base">Đang xử lý</Badge>;
    case 'completed':
      return <Badge className="bg-ui-fg-base text-ui-bg-base">Hoàn thành</Badge>;
    case 'rejected':
      return <Badge className="bg-ui-bg-base text-ui-fg-subtle border border-ui-border-base">Từ chối</Badge>;
    default:
      return <Badge className="bg-ui-bg-subtle text-ui-fg-subtle">{status}</Badge>;
  }
};

export default function ApplicationHistoryPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Hàm lấy dữ liệu từ API
  const fetchApplications = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra dữ liệu đã lưu trong localStorage
      const storedData = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(APPLICATIONS_TIMESTAMP_KEY);
      
      // Nếu có dữ liệu đã lưu và không yêu cầu refresh
      if (storedData && storedTimestamp && !forceRefresh) {
        const applications = JSON.parse(storedData);
        setApplications(applications);
        setLastUpdated(new Date(parseInt(storedTimestamp)).toLocaleString('vi-VN'));
        setLoading(false);
        return;
      }
      
      // Nếu không có dữ liệu hoặc yêu cầu refresh, gọi API
      const data = await fetchUserApplications();
      
      // Lưu dữ liệu mới vào localStorage
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(data));
      const timestamp = Date.now();
      localStorage.setItem(APPLICATIONS_TIMESTAMP_KEY, timestamp.toString());
      
      setApplications(data);
      setLastUpdated(new Date(timestamp).toLocaleString('vi-VN'));
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Không thể tải lịch sử đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Lấy dữ liệu khi component được mount
    fetchApplications();
  }, []);
  
  return (
    <Container className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <Heading level="h1">Lịch sử hồ sơ đã nộp</Heading>
        
        <div className="flex items-center mt-2 sm:mt-0">
          {lastUpdated && (
            <Text size="small" className="text-ui-fg-subtle mr-3">
              Cập nhật lần cuối: {lastUpdated}
            </Text>
          )}
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => fetchApplications(true)}
            disabled={loading}
            className="hover:shadow-sm transition-shadow duration-200"
          >
            <RefreshIcon />
            <span className="ml-1">Làm mới</span>
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ui-fg-base mr-2"></div>
          <Text>Đang tải dữ liệu...</Text>
        </div>
      ) : error ? (
        <div className="bg-ui-bg-subtle rounded-md p-4 mb-4">
          <Text className="text-ui-fg-base">{error}</Text>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-ui-bg-subtle rounded-md p-6 text-center">
          <div className="w-10 h-10 mx-auto mb-2 text-ui-fg-subtle">
            <FileTextIcon />
          </div>
          <Text className="text-ui-fg-subtle mb-4">Bạn chưa nộp đơn nào</Text>
          <Button 
            onClick={() => router.push('/dashboard/applications')}
          >
            Tạo đơn mới
          </Button>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Mã đơn</Table.HeaderCell>
              <Table.HeaderCell>Tiêu đề</Table.HeaderCell>
              <Table.HeaderCell>Loại đơn</Table.HeaderCell>
              <Table.HeaderCell>Ngày nộp</Table.HeaderCell>
              <Table.HeaderCell>Trạng thái</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {applications.map((application) => (
              <Table.Row key={application.applicationid}>
                <Table.Cell>{application.applicationid}</Table.Cell>
                <Table.Cell>{application.title}</Table.Cell>
                <Table.Cell>{application.applicationtypename}</Table.Cell>
                <Table.Cell>{formatDate(application.submissiondate)}</Table.Cell>
                <Table.Cell>{getStatusBadge(application.status)}</Table.Cell>
                <Table.Cell>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => {
                      setSelectedApplicationId(application.applicationid);
                      setIsModalOpen(true);
                    }}
                  >
                    Xem chi tiết
                    <span className="w-4 h-4 ml-1"><ArrowRightIcon /></span>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      
      {/* Modal chi tiết đơn */}
      <ApplicationDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicationId={selectedApplicationId}
      />
    </Container>
  );
} 