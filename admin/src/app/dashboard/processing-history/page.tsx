"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Label,
  Select,
  Tabs,
  DatePicker
} from "@medusajs/ui";

import {
  User,
  Buildings,
  ExclamationCircle,
  ArrowPath,
  Clock as ClockIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MagnifyingGlass,
  Check as FileCheck
} from "@medusajs/icons";

import { 
  fetchProcessingHistory, 
  ProcessingHistoryItem 
} from "@/services/staffService";

import { fetchAllAgencies } from "@/services/agencyService";
import { fetchAllStaff } from "@/services/staffService";

/**
 * Spinner component for loading states
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

/**
 * Action Badge Component
 */
const ActionBadge = ({ action }: { action: string }) => {
  const getStyleClass = () => {
    if (action.toLowerCase().includes("hoàn thành")) {
      return "bg-green-100 text-green-700";
    } else if (action.toLowerCase().includes("từ chối")) {
      return "bg-red-100 text-red-700";
    } else if (action.toLowerCase().includes("chuyển")) {
      return "bg-blue-100 text-blue-700";
    } else {
      return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Badge className={getStyleClass()}>
      {action}
    </Badge>
  );
};

/**
 * Delayed Badge Component
 */
const DelayedBadge = ({ isDelayed }: { isDelayed: boolean }) => {
  if (!isDelayed) return null;
  
  return (
    <Badge className="bg-yellow-100 text-yellow-700 ml-2">
      <AlertCircle className="w-3.5 h-3.5 mr-1" />
      Chậm trễ
    </Badge>
  );
};

/**
 * Format a date string to Vietnamese locale
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Custom AlertCircle icon component
const AlertCircle = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

/**
 * Trang Lịch sử xử lý hồ sơ
 */
export default function ProcessingHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // States
  const [historyItems, setHistoryItems] = useState<ProcessingHistoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agencyList, setAgencyList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  
  // Filters
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30)) // Default to 30 days ago
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Authorization check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Initialize
    if (isAuthenticated) {
      loadData();
      loadDropdownData();
    }
  }, [authLoading, isAuthenticated, router]);

  // Load data whenever filters or pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [agencyId, staffId, startDate, endDate, currentPage, itemsPerPage]);

  // Load dropdown data (agencies and staff)
  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Load agencies
      const agencies = await fetchAllAgencies();
      if (Array.isArray(agencies)) {
        setAgencyList(agencies.filter(a => a && (a.agencyid || a.id)));
      }

      // Load staff
      const staff = await fetchAllStaff();
      if (Array.isArray(staff)) {
        setStaffList(staff);
      }
    } catch (err) {
      console.error("Error loading dropdown data:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Load processing history data
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // Format dates for API
      const formattedStartDate = startDate ? startDate.toISOString() : undefined;
      const formattedEndDate = endDate ? endDate.toISOString() : undefined;

      // Calculate offset
      const offset = (currentPage - 1) * itemsPerPage;

      // Fetch data
      const result = await fetchProcessingHistory({
        agencyId: agencyId || undefined,
        staffId: staffId || undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        limit: itemsPerPage,
        offset
      });

      setHistoryItems(result.data);
      setTotalItems(result.total);
    } catch (err: any) {
      console.error("Error loading processing history:", err);
      setError(err.message || "Không thể tải lịch sử xử lý. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const handleAgencyChange = (value: string) => {
    setAgencyId(value === "all" ? null : parseInt(value, 10));
    setStaffId(null); // Reset staff filter when agency changes
  };

  const handleStaffChange = (value: string) => {
    setStaffId(value === "all" ? null : parseInt(value, 10));
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleResetFilters = () => {
    setAgencyId(null);
    setStaffId(null);
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Filter staff list based on selected agency
  const filteredStaffList = agencyId
    ? staffList.filter(staff => staff.agencyid === agencyId)
    : staffList;

  if (authLoading) {
    return <Spinner />;
  }

  return (
    <Container className="py-6 max-w-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold text-gray-800">
            Lịch sử xử lý hồ sơ
          </Heading>
          <Text className="text-gray-500 mt-1">
            Theo dõi quá trình xử lý hồ sơ theo cán bộ và cơ quan
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetFilters} className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
            Xóa bộ lọc
          </Button>
          <Button variant="secondary" onClick={loadData} className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
            <ArrowPath className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-gray-50 border border-gray-300 text-gray-700 rounded flex items-center">
          <ExclamationCircle className="w-5 h-5 mr-2 flex-shrink-0 text-gray-600" />
          <div className="flex-1">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agency Filter */}
          <div>
            <Label htmlFor="agencyFilter" className="mb-2 block">
              <div className="flex items-center">
                <Buildings className="w-4 h-4 mr-2 text-gray-500" />
                Cơ quan
              </div>
            </Label>
            <Select
              value={agencyId?.toString() || "all"}
              onValueChange={handleAgencyChange}
              disabled={loadingDropdowns}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={loadingDropdowns ? "Đang tải..." : "Tất cả cơ quan"} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Tất cả cơ quan</Select.Item>
                {agencyList.map(agency => (
                  <Select.Item key={agency.agencyid || agency.id} value={(agency.agencyid || agency.id).toString()}>
                    {agency.agencyname || agency.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* Staff Filter */}
          <div>
            <Label htmlFor="staffFilter" className="mb-2 block">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Cán bộ
              </div>
            </Label>
            <Select
              value={staffId?.toString() || "all"}
              onValueChange={handleStaffChange}
              disabled={loadingDropdowns}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={loadingDropdowns ? "Đang tải..." : "Tất cả cán bộ"} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Tất cả cán bộ</Select.Item>
                {filteredStaffList.map(staff => (
                  <Select.Item key={staff.staffid} value={staff.staffid.toString()}>
                    {staff.fullname}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div>
            <Label htmlFor="startDate" className="mb-2 block">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Từ ngày
              </div>
            </Label>
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              id="startDate"
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="mb-2 block">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Đến ngày
              </div>
            </Label>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              id="endDate"
            />
          </div>
        </div>
      </div>

      {/* Processing History Table */}
      {loading ? (
        <Spinner />
      ) : historyItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heading level="h2" className="text-xl mb-2">
            Không tìm thấy lịch sử xử lý
          </Heading>
          <Text className="text-gray-500">
            Không có dữ liệu lịch sử xử lý phù hợp với điều kiện tìm kiếm.
          </Text>
        </div>
      ) : (
        <div className="relative flex flex-col" style={{ height: "calc(100vh - 400px)" }}>
          <div className="overflow-auto flex-grow">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Thời gian</Table.HeaderCell>
                  <Table.HeaderCell>Cán bộ xử lý</Table.HeaderCell>
                  <Table.HeaderCell>Cơ quan</Table.HeaderCell>
                  <Table.HeaderCell>Hồ sơ</Table.HeaderCell>
                  <Table.HeaderCell>Thao tác</Table.HeaderCell>
                  <Table.HeaderCell>Ghi chú</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {historyItems.map(item => (
                  <Table.Row key={item.historyid} className="hover:bg-gray-50">
                    <Table.Cell>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                        {formatDate(item.actiondate)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        {item.staff_name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <Buildings className="w-4 h-4 mr-2 text-gray-500" />
                        {item.agency_name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{item.application_title}</span>
                        <span className="text-gray-500 text-sm">#{item.applicationid}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <ActionBadge action={item.actiontaken} />
                        <DelayedBadge isDelayed={item.isdelayed} />
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="text-gray-600 line-clamp-2" title={item.notes || ""}>
                        {item.notes || "—"}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 bg-white py-3 px-4 absolute bottom-0 left-0 right-0 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
              đến{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
              trong tổng số {totalItems} bản ghi
            </div>

            <div className="flex items-center">
              <div className="mr-4 flex items-center">
                <Text size="small" className="mr-2 text-gray-600">
                  Số dòng mỗi trang:
                </Text>
                <Select
                  size="small"
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <Select.Trigger className="w-16">
                    <Select.Value placeholder="Chọn" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="10">10</Select.Item>
                    <Select.Item value="20">20</Select.Item>
                    <Select.Item value="50">50</Select.Item>
                    <Select.Item value="100">100</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="flex items-center">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border border-gray-200 px-2 py-1 rounded-l bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <Text className="px-3 py-1 border-t border-b border-gray-200 bg-white text-gray-600">
                  {currentPage}
                </Text>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border border-gray-200 px-2 py-1 rounded-r bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Text className="ml-2 text-gray-600">
                  Trang {currentPage} / {totalPages || 1}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
} 