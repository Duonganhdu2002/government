"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Textarea,
  Label,
  Select
} from '@medusajs/ui';
import {
  ChevronLeft,
  Calendar,
  Clock,
  ExclamationCircle,
  ArrowPath,
  Check,
  XMark,
  User,
  Eye,
  PencilSquare,
  ChevronDown,
  MapPin
} from '@medusajs/icons';
import { fetchPendingApplications, updateApplicationStatus, fetchApplicationDetailForStaff } from '@/services/applicationService';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { getAuthHeaders } from '@/lib/api';
import ApplicationDetailModal from '@/components/ApplicationDetailModal';
import Modal from '@/components/Modal';
import AgencySelector from '@/components/AgencySelector';

// Application status component
const ApplicationStatus = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    // Sử dụng màu trung tính (xám, đen, trắng) thay vì màu rực rỡ
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-gray-200 text-gray-900';
      case 'pending':
      case 'in_review':
      case 'submitted':
        return 'bg-gray-50 text-gray-700';
      case 'pending_additional_info':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang chờ';
      case 'in_review':
        return 'Đang xem xét';
      case 'submitted':
        return 'Đã nộp';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending_additional_info':
        return 'Cần bổ sung';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusClass()}>
      {getStatusText()}
    </Badge>
  );
};

// Loading Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

// Status update modal component
type StatusUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
};

const StatusUpdateModal = ({ isOpen, onClose, applicationId, onSuccess }: StatusUpdateModalProps) => {
  const [status, setStatus] = useState('in_review');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  // Define status options with proper display values and backend values
  const statusOptions = [
    { value: 'in_review', label: 'Đang xem xét' },
    { value: 'approved', label: 'Duyệt đơn' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'pending_additional_info', label: 'Yêu cầu bổ sung thông tin' }
  ];

  // Get display value for the current status
  const getStatusDisplayValue = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
  };

  // Reset error state when status or comments change
  useEffect(() => {
    if (error) {
      setError('');
      setErrorDetail('');
    }
  }, [status, comments]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setErrorDetail('');
    
    try {
      console.log(`Updating application ${applicationId} with status: ${status}`);
      await updateApplicationStatus(
        applicationId, 
        status, 
        comments
      );
      console.log('Update successful');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
      
      // Extract more detailed error information
      if (err && err.message) {
        if (err.message.includes('500')) {
          setErrorDetail('Lỗi máy chủ nội bộ. Hệ thống đang gặp sự cố, vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        } else if (err.message.includes('timeout')) {
          setErrorDetail('Yêu cầu đã hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          setErrorDetail(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <div className="flex w-full justify-between items-center">
          <Text size="large" weight="plus" className="font-bold">
            Cập nhật trạng thái đơn
          </Text>
          <Button variant="secondary" size="small" onClick={onClose}>
            <XMark />
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col py-6 px-8 gap-y-8">
        {error && (
          <div className="p-4 mb-4 bg-gray-100 border border-gray-300 text-gray-700 rounded">
            <div className="font-semibold text-red-600">{error}</div>
            {errorDetail && <div className="mt-2 text-sm">{errorDetail}</div>}
            <div className="mt-3 text-sm">
              <span className="font-medium">Hướng dẫn:</span> Vui lòng thử lại sau vài phút. Nếu lỗi vẫn tiếp tục xảy ra, hãy liên hệ với bộ phận hỗ trợ kỹ thuật.
            </div>
          </div>
        )}
        
        <div>
          <Label className="mb-2 block">Trạng thái mới</Label>
          <div className="relative">
            <Select
              value={status}
              onValueChange={(value) => {
                console.log(`Status changed to: ${value}`);
                setStatus(value);
              }}
            >
              <Select.Trigger className="w-full z-20 relative">
                <Select.Value placeholder="Chọn trạng thái">
                  {getStatusDisplayValue(status)}
                </Select.Value>
              </Select.Trigger>
              <Select.Content position="popper" className="z-[100]">
                {statusOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value} className="cursor-pointer hover:bg-gray-100">
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="mb-2 block">Ghi chú/Ý kiến</Label>
          <Textarea
            value={comments}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
            placeholder="Nhập ghi chú hoặc ý kiến về đơn này..."
            rows={4}
            className="w-full"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex w-full justify-end gap-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Cập nhật
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

// Custom collapsible section component
const CollapsibleSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-md mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 rounded-t-md text-left"
      >
        <Text size="base" weight="plus">{title}</Text>
        <div className={`w-4 h-4 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

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

export default function PendingApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApplicationDetailId, setSelectedApplicationDetailId] = useState<number | null>(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadApplications();
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Calculate total pages whenever applications array changes
    if (applications.length > 0) {
      setTotalPages(Math.ceil(applications.length / itemsPerPage));
    } else {
      setTotalPages(1);
    }
  }, [applications, itemsPerPage]);

  const loadApplications = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchPendingApplications();
      // Handle the response data structure properly
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        setApplications(response.data);
      } else if (response && Array.isArray(response)) {
        // For backward compatibility
        setApplications(response);
      } else {
        console.error('Unexpected response format:', response);
        setApplications([]);
        setError('Dữ liệu không đúng định dạng. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      console.error('Error loading applications:', err);

      // Check if it's an authentication error and provide helpful instructions
      if (err.message && (err.message.includes('đăng nhập') || err.message.includes('quyền truy cập'))) {
        setError(err.message);
      } else {
        setError(err.message || 'Không thể tải danh sách đơn. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      // Reset to first page when reloading data
      setCurrentPage(1);
    }
  };

  // Function to handle re-login
  const handleReLogin = () => {
    // Clear current session and redirect to login
    router.push('/login');
  };

  const handleViewDetail = (id: number) => {
    setSelectedApplicationDetailId(id);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (id: number) => {
    setSelectedApplicationId(id.toString());
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdateSuccess = () => {
    loadApplications();
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return applications.slice(startIndex, endIndex);
  };

  if (authLoading) {
    return <Spinner />;
  }

  return (
    <Container className="py-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold">
            Đơn cần xử lý
          </Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Danh sách đơn cần xử lý tại cơ quan của bạn.
          </Text>
        </div>
        <Button variant="secondary" onClick={loadApplications}>
          <ArrowPath className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-gray-100 border border-gray-300 text-gray-700 rounded flex items-center">
          <ExclamationCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            {(error.includes('đăng nhập') || error.includes('quyền truy cập')) && (
              <Button
                variant="secondary"
                className="mt-2"
                onClick={handleReLogin}
              >
                Đăng nhập lại
              </Button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heading level="h2" className="text-xl mb-2">
            Không có đơn nào cần xử lý
          </Heading>
          <Text className="text-ui-fg-subtle">
            Hiện tại không có đơn nào cần xử lý tại cơ quan của bạn.
          </Text>
        </div>
      ) : (
        <div className="relative flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="overflow-auto flex-grow">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Tiêu đề</Table.HeaderCell>
                  <Table.HeaderCell>Loại đơn</Table.HeaderCell>
                  <Table.HeaderCell>Người nộp</Table.HeaderCell>
                  <Table.HeaderCell>Ngày nộp</Table.HeaderCell>
                  <Table.HeaderCell>Hạn xử lý</Table.HeaderCell>
                  <Table.HeaderCell>Trạng thái</Table.HeaderCell>
                  <Table.HeaderCell>Quá hạn</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Hành động</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {getCurrentPageItems().map((app) => (
                  <Table.Row key={app.applicationid} className="cursor-pointer hover:bg-gray-50">
                    <Table.Cell>{app.applicationid}</Table.Cell>
                    <Table.Cell className="max-w-[200px] truncate">{app.title}</Table.Cell>
                    <Table.Cell>{app.applicationtypename || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-500" />
                        {app.citizenname || 'N/A'}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{app.submissiondate ? formatDate(app.submissiondate) : 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        {app.duedate ? (
                          <>
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            {formatDate(app.duedate)}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <ApplicationStatus status={app.status} />
                    </Table.Cell>
                    <Table.Cell>
                      {app.isoverdue ? (
                        <Badge className="bg-gray-200 text-gray-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Quá hạn
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">
                          <Check className="w-3 h-3 mr-1" />
                          Trong hạn
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleViewDetail(app.applicationid)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Chi tiết
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(app.applicationid);
                          }}
                        >
                          <PencilSquare className="w-3.5 h-3.5 mr-1" />
                          Cập nhật
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Simplified fixed pagination controls */}
          <div className="border-t border-gray-200 bg-white py-3 px-4 absolute bottom-0 left-0 right-0 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, applications.length)} trong tổng số {applications.length} đơn
            </div>

            <div className="flex items-center">
              <div className="mr-4 flex items-center">
                <Text size="small" className="mr-2">Số dòng mỗi trang:</Text>
                <Select
                  size="small"
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <Select.Trigger className="w-16">
                    <Select.Value placeholder="Chọn" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="5">5</Select.Item>
                    <Select.Item value="10">10</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="flex items-center">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border border-gray-200 px-2 py-1 rounded-l"
                >
                  &lsaquo;
                </Button>

                <Text className="px-3 py-1 border-t border-b border-gray-200 bg-white">
                  {currentPage}
                </Text>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border border-gray-200 px-2 py-1 rounded-r"
                >
                  &rsaquo;
                </Button>

                <Text className="ml-2">
                  Hiển thị 1 đến {totalPages} trong tổng số {totalPages} trang
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fix modal backdrop issue */}
      {selectedApplicationId && (
        <div className={`${isStatusModalOpen ? 'fixed inset-0 bg-black/60 z-50' : 'hidden'}`} style={{ pointerEvents: isStatusModalOpen ? 'auto' : 'none' }}>
          <StatusUpdateModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            applicationId={selectedApplicationId}
            onSuccess={handleStatusUpdateSuccess}
          />
        </div>
      )}

      <div className={`${isDetailModalOpen ? 'fixed inset-0 bg-black/60 z-50' : 'hidden'}`} style={{ pointerEvents: isDetailModalOpen ? 'auto' : 'none' }}>
        <ApplicationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          applicationId={selectedApplicationDetailId}
        />
      </div>
    </Container>
  );
}