"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Textarea,
  Label,
  Select,
  Tabs,
  Input
} from "@medusajs/ui";

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
  MapPin,
  MagnifyingGlass,
  Buildings
} from "@medusajs/icons";

import {
  fetchAllApplications,
  updateApplicationStatus,
  fetchApplicationDetailForStaff,
  fetchStaffList
} from "@/services/applicationService";

import { fetchAllAgencies } from "@/services/agencyService";

import { formatDate, formatDateTime } from "@/utils/dateUtils";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import Modal from "@/components/Modal";

/** 
 * CHỈ DÙNG TRẮNG, ĐEN, XÁM – KHÔNG DÙNG CÁC MÀU SẶC SỠ
 */

/**
 * Application Status Component (Chỉ màu xám/đen/trắng)
 */
const ApplicationStatus = ({ status }: { status: string }) => {
  const statusLower = status?.toLowerCase() || "";

  // Chuyển đổi mọi trạng thái thành class xám
  // Có thể chỉnh cho approved/rejected khác chút, nhưng vẫn trong tông xám
  const getStatusClass = () => {
    switch (statusLower) {
      case "approved":
        return "bg-gray-200 text-gray-700"; // phê duyệt
      case "rejected":
        return "bg-gray-300 text-gray-800"; // từ chối
      case "in_review":
        return "bg-gray-200 text-gray-700"; // đang xem xét
      case "pending_additional_info":
        return "bg-gray-200 text-gray-700"; // cần bổ sung
      case "submitted":
      case "pending":
        return "bg-gray-100 text-gray-800"; // trạng thái chờ
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (statusLower) {
      case "pending":
        return "Đang chờ";
      case "in_review":
        return "Đang xem xét";
      case "submitted":
        return "Đã nộp";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "pending_additional_info":
        return "Cần bổ sung";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <Badge className={getStatusClass()}>
      {getStatusText()}
    </Badge>
  );
};

/**
 * Loading Spinner (chỉ xám)
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

/**
 * StatusUpdateModal – Modal cập nhật trạng thái (tông xám)
 */
type StatusUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
};

const StatusUpdateModal = ({
  isOpen,
  onClose,
  applicationId,
  onSuccess
}: StatusUpdateModalProps) => {
  const [status, setStatus] = useState("in_review");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  // Tùy chọn trạng thái (hiển thị xám)
  const statusOptions = [
    { value: "in_review", label: "Đang xem xét" },
    { value: "approved", label: "Duyệt đơn" },
    { value: "rejected", label: "Từ chối" },
    { value: "pending_additional_info", label: "Yêu cầu bổ sung thông tin" }
  ];

  const getStatusDisplayValue = (value: string) => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  useEffect(() => {
    if (error) {
      setError("");
      setErrorDetail("");
    }
  }, [status, comments]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setErrorDetail("");

    try {
      await updateApplicationStatus(applicationId, status, comments);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
      if (err && err.message) {
        if (err.message.includes("500")) {
          setErrorDetail(
            "Lỗi máy chủ nội bộ. Hệ thống đang gặp sự cố, vui lòng thử lại sau hoặc liên hệ quản trị viên."
          );
        } else if (err.message.includes("timeout")) {
          setErrorDetail(
            "Yêu cầu đã hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại."
          );
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
      <div className="z-[9000] relative">
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
            <div className="p-4 mb-4 bg-gray-50 border border-gray-300 text-gray-700 rounded">
              <div className="font-semibold text-gray-800">{error}</div>
              {errorDetail && (
                <div className="mt-2 text-sm text-gray-600">{errorDetail}</div>
              )}
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Hướng dẫn:</span>{" "}
                Vui lòng thử lại sau vài phút. Nếu lỗi vẫn tiếp tục, hãy liên hệ
                với bộ phận hỗ trợ kỹ thuật.
              </div>
            </div>
          )}

          <div>
            <Label className="mb-2 block">Trạng thái mới</Label>
            <div className="relative">
              <Select
                value={status}
                onValueChange={value => setStatus(value)}
              >
                <Select.Trigger className="w-full z-20 relative">
                  <Select.Value placeholder="Chọn trạng thái">
                    {getStatusDisplayValue(status)}
                  </Select.Value>
                </Select.Trigger>
                <Select.Content position="popper" className="z-[10000]">
                  {statusOptions.map(option => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-100"
                    >
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComments(e.target.value)
              }
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
      </div>
    </Modal>
  );
};

/**
 * Trang hiển thị tất cả đơn (chỉ tông xám, trắng, đen)
 */
export default function AllApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] =
    useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApplicationDetailId, setSelectedApplicationDetailId] =
    useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Thêm state cho việc lọc theo staff và agency
  const [staffFilter, setStaffFilter] = useState<number | null>(null);
  const [agencyFilter, setAgencyFilter] = useState<number | null>(null);
  const [manualStaffId, setManualStaffId] = useState<string>("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [agencyList, setAgencyList] = useState<any[]>([]);
  const [loadingStaffList, setLoadingStaffList] = useState(false);
  const [loadingAgencyList, setLoadingAgencyList] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Thêm hook để fetch danh sách staff và agencies
  useEffect(() => {
    if (isAuthenticated) {
      loadStaffList();
      loadAgencyList();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    loadApplications();
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Lọc dữ liệu theo tab, status, search, staff, agency
    let filtered = [...applications];

    // Tab logic
    if (activeTab === "pending") {
      filtered = filtered.filter(app =>
        ["pending", "submitted", "in_review"].includes(
          app.status?.toLowerCase()
        )
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter(app =>
        ["approved", "rejected"].includes(app.status?.toLowerCase())
      );
    }

    // Status filter (nếu != 'all')
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        app => app.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Staff filter
    if (staffFilter !== null) {
      filtered = filtered.filter(app => app.staffid === staffFilter);
    }

    // Agency filter
    if (agencyFilter !== null) {
      filtered = filtered.filter(app => {
        // Handle different property names
        const appAgencyId = app.agencyid || app.agency_id || app.agency;
        return appAgencyId === agencyFilter;
      });
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.title?.toLowerCase().includes(term) ||
          app.citizenname?.toLowerCase().includes(term) ||
          app.applicationid?.toString().includes(term)
      );
    }

    setFilteredApplications(filtered);
    setCurrentPage(1); // reset page

    // Tính total pages
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [applications, activeTab, searchTerm, statusFilter, staffFilter, agencyFilter, itemsPerPage]);

  // Thêm function để load danh sách nhân viên
  const loadStaffList = async () => {
    setLoadingStaffList(true);
    try {
      const staff = await fetchStaffList();
      setStaffList(Array.isArray(staff) ? staff : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhân viên:", err);
    } finally {
      setLoadingStaffList(false);
    }
  };

  // Thêm function để load danh sách cơ quan
  const loadAgencyList = async (retryCount = 0) => {
    setLoadingAgencyList(true);
    try {
      console.log('Fetching agencies from server...');
      const agencies = await fetchAllAgencies();
      
      console.log('Agency data received:', agencies);
      
      // Ensure agencies is always an array even if the API returns unexpected data
      if (Array.isArray(agencies)) {
        // Filter out invalid agencies without an ID
        const validAgencies = agencies.filter(agency => 
          agency && (agency.agencyid || agency.id)
        );
        
        console.log('Valid agencies:', validAgencies.length);
        setAgencyList(validAgencies);
        
        if (validAgencies.length === 0 && retryCount < 2) {
          console.warn(`No valid agencies found, retry attempt ${retryCount + 1}`);
          setTimeout(() => loadAgencyList(retryCount + 1), 3000);
        }
      } else {
        console.warn('Received non-array agency data');
        setAgencyList([]);
        
        if (retryCount < 2) {
          setTimeout(() => loadAgencyList(retryCount + 1), 3000);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách cơ quan:", err);
      // Set empty array as fallback
      setAgencyList([]);
      
      // Retry up to 2 times with delay
      if (retryCount < 2) {
        setTimeout(() => loadAgencyList(retryCount + 1), 3000);
      }
    } finally {
      setLoadingAgencyList(false);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchAllApplications();

      if (response && response.status === "success" && Array.isArray(response.data)) {
        setApplications(response.data);
        setFilteredApplications(response.data);
      } else if (Array.isArray(response)) {
        // API trả mảng trực tiếp
        setApplications(response);
        setFilteredApplications(response);
      } else {
        setApplications([]);
        setFilteredApplications([]);
        setError("Dữ liệu không đúng định dạng. Vui lòng thử lại sau.");
      }
    } catch (err: any) {
      if (err.message?.includes("401") || err.message?.includes("đăng nhập")) {
        setError("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
      } else if (
        err.message?.includes("403") ||
        err.message?.includes("quyền truy cập")
      ) {
        setError("Bạn không có quyền truy cập vào tài nguyên này.");
      } else if (err.message?.includes("timeout") || err.message?.includes("quá thời gian")) {
        setError("Máy chủ không phản hồi. Vui lòng thử lại sau.");
      } else if (err.message?.includes("404")) {
        setError("Không tìm thấy dữ liệu hoặc endpoint API không tồn tại.");
      } else if (err.message?.includes("400")) {
        setError("Yêu cầu không hợp lệ. Vui lòng kiểm tra cấu hình API và thử lại.");
      } else {
        setError(err.message || "Không thể tải danh sách đơn. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi lọc theo staff
  const handleStaffFilterChange = (value: string) => {
    if (value === "all") {
      setStaffFilter(null);
      setManualStaffId("");
    } else {
      const staffId = parseInt(value, 10);
      if (!isNaN(staffId)) {
        setStaffFilter(staffId);
        setManualStaffId(staffId.toString());
      }
    }
  };

  // Hàm xử lý khi thay đổi lọc theo cơ quan
  const handleAgencyFilterChange = (value: string) => {
    try {
      if (value === "all") {
        setAgencyFilter(null);
      } else {
        const agencyId = parseInt(value, 10);
        if (!isNaN(agencyId)) {
          setAgencyFilter(agencyId);
        } else {
          setAgencyFilter(null);
          console.warn("Invalid agency ID format");
        }
      }
    } catch (error) {
      console.error("Error handling agency filter change:", error);
      setAgencyFilter(null);
    }
  };

  // Hàm xử lý khi nhập trực tiếp ID nhân viên
  const handleManualStaffIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualStaffId(e.target.value);
  };

  // Hàm xử lý khi tìm kiếm theo ID nhân viên
  const handleSearchByStaffId = () => {
    if (manualStaffId) {
      const staffId = parseInt(manualStaffId, 10);
      if (!isNaN(staffId) && staffId > 0) {
        setStaffFilter(staffId);
      } else {
        alert("Vui lòng nhập ID nhân viên hợp lệ");
      }
    } else {
      setStaffFilter(null);
    }
  };

  // Hàm xử lý khi reset tất cả bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStaffFilter(null);
    setAgencyFilter(null);
    setManualStaffId("");
    setActiveTab("all");
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

  // Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Lấy các items theo page
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  };

  if (authLoading) {
    return <Spinner />;
  }

  // Options cho dropdown trạng thái
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "submitted", label: "Đã nộp" },
    { value: "in_review", label: "Đang xem xét" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" },
    { value: "pending_additional_info", label: "Cần bổ sung thông tin" }
  ];

  return (
    <Container className="py-6 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold">
            Quản lý tất cả đơn
          </Heading>
          <Text className="text-gray-500 mt-1">
            Tất cả đơn trong hệ thống và các bộ lọc để quản lý hiệu quả.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
          <Button variant="secondary" onClick={loadApplications}>
            <ArrowPath className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-gray-50 border border-gray-300 text-gray-700 rounded flex items-center">
          <ExclamationCircle className="w-5 h-5 mr-2 flex-shrink-0 text-gray-600" />
          <div className="flex-1">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        {loadingAgencyList && (
          <div className="mb-4 p-2 bg-gray-50 text-gray-600 text-sm rounded">
            Đang tải dữ liệu cơ quan...
          </div>
        )}
        
        {agencyList.length === 0 && !loadingAgencyList && (
          <div className="mb-4 p-2 bg-gray-50 text-gray-600 text-sm rounded flex items-center">
            <ExclamationCircle className="w-4 h-4 mr-2 text-gray-500" />
            <span>
              Không thể tải danh sách cơ quan. Một số bộ lọc có thể không khả dụng.
              <Button variant="transparent" onClick={() => loadAgencyList()} className="ml-2 text-gray-700 underline">
                Thử lại
              </Button>
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2 block">
              Tìm kiếm đơn
            </Label>
            <Input
              id="search"
              placeholder="Tìm theo tiêu đề, ID, người nộp..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <Label htmlFor="statusFilter" className="mb-2 block">
              Lọc theo trạng thái
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Chọn trạng thái" />
              </Select.Trigger>
              <Select.Content position="popper" className="z-[100]">
                {statusOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* Staff và Agency Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <Label htmlFor="agencyFilter" className="mb-2 block">
              <div className="flex items-center">
                <Buildings className="w-4 h-4 mr-1 text-gray-500" />
                Lọc theo cơ quan
              </div>
            </Label>
            <Select 
              value={agencyFilter?.toString() || "all"} 
              onValueChange={handleAgencyFilterChange}
              disabled={loadingAgencyList}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={loadingAgencyList ? "Đang tải..." : "Chọn cơ quan"} />
              </Select.Trigger>
              <Select.Content position="popper" className="z-[100]">
                <Select.Item value="all">Tất cả cơ quan</Select.Item>
                {agencyList.length > 0 ? (
                  agencyList.map(agency => {
                    // Handle different property names from the backend
                    const id = agency.agencyid || agency.id;
                    const name = agency.agencyname || agency.name;
                    
                    if (!id) return null; // Skip if no valid ID
                    
                    return (
                      <Select.Item key={id} value={id.toString()}>
                        {name || `Cơ quan #${id}`}
                      </Select.Item>
                    );
                  })
                ) : !loadingAgencyList ? (
                  <Select.Item value="all" disabled>
                    Không thể tải danh sách cơ quan
                  </Select.Item>
                ) : null}
              </Select.Content>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <Label htmlFor="staffFilter" className="mb-2 block">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1 text-gray-500" />
                Lọc theo nhân viên
              </div>
            </Label>
            <Select 
              value={staffFilter?.toString() || "all"} 
              onValueChange={handleStaffFilterChange}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Chọn nhân viên" />
              </Select.Trigger>
              <Select.Content position="popper" className="z-[100]">
                <Select.Item value="all">Tất cả nhân viên</Select.Item>
                {staffList.map(staff => (
                  <Select.Item key={staff.staffid} value={staff.staffid.toString()}>
                    {staff.fullname || `Nhân viên #${staff.staffid}`}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <Label className="mb-2 block">
              <div className="flex items-center">
                <MagnifyingGlass className="w-4 h-4 mr-1 text-gray-500" />
                Tìm theo mã nhân viên
              </div>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập ID nhân viên"
                value={manualStaffId}
                onChange={handleManualStaffIdChange}
                className="flex-1"
                type="number"
                min="1"
              />
              <Button 
                variant="secondary" 
                onClick={handleSearchByStaffId}
              >
                Tìm
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="all" className="px-4 py-2">
              Tất cả đơn
            </Tabs.Trigger>
            <Tabs.Trigger value="pending" className="px-4 py-2">
              Đơn đang xử lý
            </Tabs.Trigger>
            <Tabs.Trigger value="completed" className="px-4 py-2">
              Đơn đã xử lý
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>

      {/* Table hiển thị đơn */}
      {loading ? (
        <Spinner />
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heading level="h2" className="text-xl mb-2">
            Không tìm thấy đơn nào
          </Heading>
          <Text className="text-gray-500">
            Không có đơn nào phù hợp với điều kiện tìm kiếm.
          </Text>
        </div>
      ) : (
        <div
          className="relative flex flex-col"
          style={{ height: "calc(100vh - 400px)" }}
        >
          <div className="overflow-auto flex-grow">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Tiêu đề</Table.HeaderCell>
                  <Table.HeaderCell>Loại đơn</Table.HeaderCell>
                  <Table.HeaderCell>Người nộp</Table.HeaderCell>
                  <Table.HeaderCell>Ngày nộp</Table.HeaderCell>
                  <Table.HeaderCell>Cơ quan</Table.HeaderCell>
                  <Table.HeaderCell>Nhân viên</Table.HeaderCell>
                  <Table.HeaderCell>Trạng thái</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Hành động
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {getCurrentPageItems().map(app => (
                  <Table.Row
                    key={app.applicationid}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Table.Cell>{app.applicationid}</Table.Cell>
                    <Table.Cell className="max-w-[200px] truncate">
                      {app.title}
                    </Table.Cell>
                    <Table.Cell>
                      {app.applicationtypename || "N/A"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-500" />
                        {app.citizenname || "N/A"}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {app.submissiondate
                        ? formatDate(app.submissiondate)
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>{app.agencyname || "N/A"}</Table.Cell>
                    <Table.Cell>{app.staffname || "Chưa phân công"}</Table.Cell>
                    <Table.Cell>
                      <ApplicationStatus status={app.status} />
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
                          onClick={e => {
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

          {/* Pagination */}
          <div className="border-t border-gray-200 bg-white py-3 px-4 absolute bottom-0 left-0 right-0 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              {filteredApplications.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              đến{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredApplications.length
              )}{" "}
              trong tổng số {filteredApplications.length} đơn
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
                    <Select.Item value="5">5</Select.Item>
                    <Select.Item value="10">10</Select.Item>
                    <Select.Item value="20">20</Select.Item>
                    <Select.Item value="50">50</Select.Item>
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

                <Text className="px-3 py-1 border-t border-b border-gray-200 bg-white text-gray-600">
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

                <Text className="ml-2 text-gray-600">
                  Trang {currentPage} / {totalPages}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedApplicationId && (
        <>
          <div
            className={`${
              isStatusModalOpen ? "fixed inset-0 bg-black/60 z-50" : "hidden"
            }`}
            style={{ pointerEvents: isStatusModalOpen ? "auto" : "none" }}
          >
            <StatusUpdateModal
              isOpen={isStatusModalOpen}
              onClose={() => setIsStatusModalOpen(false)}
              applicationId={selectedApplicationId}
              onSuccess={handleStatusUpdateSuccess}
            />
          </div>
        </>
      )}

      <div
        className={`${
          isDetailModalOpen ? "fixed inset-0 bg-black/60 z-50" : "hidden"
        }`}
        style={{ pointerEvents: isDetailModalOpen ? "auto" : "none" }}
      >
        <ApplicationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          applicationId={selectedApplicationDetailId}
        />
      </div>
    </Container>
  );
}
