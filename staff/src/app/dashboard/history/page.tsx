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

// Định nghĩa kiểu dữ liệu cho một đơn hồ sơ
interface Application {
  applicationid: number;
  title: string;
  applicationtypename: string;
  status: string;
  submissiondate: string;
}

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

export default function ApplicationHistoryPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  
  useEffect(() => {
    // Lấy danh sách đơn của người dùng
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Không thể tải lịch sử đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);
  
  return (
    <Container className="py-6">
      <Heading level="h1" className="mb-6">Lịch sử hồ sơ đã nộp</Heading>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
          <Text>Đang tải dữ liệu...</Text>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <Text className="text-red-600">{error}</Text>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <div className="w-10 h-10 mx-auto mb-2 text-gray-400">
            <FileTextIcon />
          </div>
          <Text className="text-gray-600 mb-4">Bạn chưa nộp đơn nào</Text>
          <Button 
            onClick={() => router.push('/dashboard/applications')}
          >
            Tạo đơn mới
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200">
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
        </div>
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