"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

// Import Medusa UI components
import {
  Badge,
  Button,
  Text,
  Select,
  Input
} from "@medusajs/ui";

// Import icons
import {
  Check,
  XMark,
  Clock,
  Plus,
  MagnifyingGlass,
  ChevronRight,
  ChevronLeft
} from '@medusajs/icons';

// Định nghĩa kiểu dữ liệu cho một đơn hồ sơ
interface Application {
  id: number;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  serviceType?: string;
}

// Định nghĩa kiểu trạng thái hồ sơ
type ApplicationStatus = 'all' | 'pending' | 'processing' | 'approved' | 'rejected';

/**
 * Component hiển thị trạng thái hồ sơ
 */
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-ui-tag-green-bg text-ui-tag-green-text';
      case 'rejected':
        return 'bg-ui-tag-red-bg text-ui-tag-red-text';
      case 'pending':
        return 'bg-ui-tag-orange-bg text-ui-tag-orange-text';
      case 'processing':
        return 'bg-ui-tag-blue-bg text-ui-tag-blue-text';
      default:
        return 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text';
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Check />;
      case 'rejected':
        return <XMark />;
      case 'pending':
      case 'processing':
        return <Clock />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusClass()}`}>
      {getStatusIcon()}
      <span className="ml-1">{status}</span>
    </Badge>
  );
};

/**
 * Component cho phân trang đơn giản
 */
const SimplePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}) => {
  // Tạo mảng các trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang nếu tổng số trang ít
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Hiển thị trang đầu, trang cuối và một số trang ở giữa
      if (currentPage <= 3) {
        // Gần trang đầu
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Gần trang cuối
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Ở giữa
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="transparent"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-1"
      >
        <ChevronLeft />
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="mx-1 text-ui-fg-subtle">...</span>
          ) : (
            <Button
              variant={page === currentPage ? 'secondary' : 'transparent'}
              size="small"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`min-w-[36px] h-9 ${page === currentPage ? 'bg-ui-bg-base-hover' : ''}`}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}
      
      <Button
        variant="transparent"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-1"
      >
        <ChevronRight />
      </Button>
    </div>
  );
};

/**
 * Trang lịch sử hồ sơ
 */
export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  
  // Các state cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'name' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Các state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchApplications();
  }, [user]);

  // Lọc và sắp xếp khi các tiêu chí thay đổi
  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchQuery, statusFilter, sortField, sortOrder]);

  // Tính toán tổng số trang khi danh sách lọc thay đổi
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage)));
    if (currentPage > Math.ceil(filteredApplications.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredApplications]);

  // Lấy danh sách hồ sơ từ API
  const fetchApplications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/applications?citizenId=${user.id}`);
      
      if (response?.data?.applications) {
        setApplications(response.data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và sắp xếp danh sách hồ sơ theo tiêu chí
  const filterAndSortApplications = () => {
    let filtered = [...applications];
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => 
        app.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(query) || 
        app.type.toLowerCase().includes(query) ||
        (app.description && app.description.toLowerCase().includes(query)) ||
        app.id.toString().includes(query)
      );
    }
    
    // Sắp xếp
    filtered.sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortField === 'status') {
        return sortOrder === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      return 0;
    });
    
    setFilteredApplications(filtered);
  };

  // Lấy danh sách hồ sơ hiện tại theo trang
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  };

  // Chuyển đổi thứ tự sắp xếp
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Định dạng ngày giờ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="mb-6">
        <Text className="text-ui-fg-subtle mb-4">
          Lịch sử hồ sơ đã nộp
        </Text>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass className="text-ui-fg-subtle" />
            </div>
            <Input
              placeholder="Tìm kiếm theo ID, tên, loại hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ApplicationStatus)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Lọc trạng thái" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Tất cả trạng thái</Select.Item>
                <Select.Item value="pending">Chờ xử lý</Select.Item>
                <Select.Item value="processing">Đang xử lý</Select.Item>
                <Select.Item value="approved">Đã duyệt</Select.Item>
                <Select.Item value="rejected">Từ chối</Select.Item>
              </Select.Content>
            </Select>
          </div>
          
          <div className="w-full md:w-60">
            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as 'createdAt' | 'name' | 'status')}
            >
              <Select.Trigger>
                <Select.Value placeholder="Sắp xếp theo" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="createdAt">Ngày nộp</Select.Item>
                <Select.Item value="name">Tên hồ sơ</Select.Item>
                <Select.Item value="status">Trạng thái</Select.Item>
              </Select.Content>
            </Select>
          </div>
          
          {/* <Button 
            variant="secondary" 
            size="base"
            className="aspect-square p-2 md:w-10"
            onClick={toggleSortOrder}
          >
            <span className="rotate-90 block">
              {sortOrder === 'desc' ? '↑↓' : '↓↑'}
            </span>
          </Button> */}
        </div>

        {/* Danh sách hồ sơ */}
        <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden mb-6">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-interactive"></div>
            </div>
          ) : getCurrentPageItems().length > 0 ? (
            <div>
              {/* Tiêu đề bảng */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="col-span-1">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">ID</Text>
                </div>
                <div className="col-span-3">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">Tên hồ sơ</Text>
                </div>
                <div className="col-span-2">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">Loại dịch vụ</Text>
                </div>
                <div className="col-span-2">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">Ngày nộp</Text>
                </div>
                <div className="col-span-2">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">Trạng thái</Text>
                </div>
                <div className="col-span-2 text-right">
                  <Text size="small" weight="plus" className="text-ui-fg-subtle">Thao tác</Text>
                </div>
              </div>

              {/* Các hàng trong bảng */}
              {getCurrentPageItems().map((application) => (
                <div 
                  key={application.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b border-ui-border-base hover:bg-ui-bg-base-hover"
                >
                  <div className="col-span-1">
                    <Text size="small">{application.id}</Text>
                  </div>
                  <div className="col-span-3">
                    <Text weight="plus" className="text-ui-fg-base">{application.name}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text size="small" className="text-ui-fg-subtle">{application.serviceType || application.type}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text size="small" className="text-ui-fg-subtle">{formatDate(application.createdAt)}</Text>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={application.status} />
                  </div>
                  <div className="col-span-2 text-right">
                    <Link href={`/dashboard/applications/${application.id}`} className="no-underline">
                      <Button variant="secondary" size="small">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Text className="text-ui-fg-subtle mb-4">
                Không tìm thấy hồ sơ nào{searchQuery ? " phù hợp với tìm kiếm" : ""}
              </Text>
              <Link href="/dashboard/applications/new" className="no-underline">
                <Button variant="secondary">
                  <Plus className="mr-2" />
                  Nộp hồ sơ mới
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {filteredApplications.length > 0 && (
          <div className="flex justify-center mt-6">
            <SimplePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
} 