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
  Tabs
} from "@medusajs/ui";

import Modal from "@/components/Modal";

import {
  User,
  Buildings,
  ExclamationCircle,
  ArrowPath,
  XMark,
  Eye,
  PencilSquare,
  Trash,
  Plus,
  MagnifyingGlass
} from "@medusajs/icons";

import { 
  fetchAllStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  StaffMember 
} from "@/services/staffService";

import { fetchAllAgencies } from "@/services/agencyService";

/**
 * Spinner component for loading states
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

/**
 * Staff role badge component
 */
const RoleBadge = ({ role }: { role: string }) => {
  const roleLower = role?.toLowerCase() || "";

  const getRoleClass = () => {
    switch (roleLower) {
      case "admin":
        return "bg-gray-200 text-gray-700";
      case "manager":
        return "bg-gray-200 text-gray-700";
      case "staff":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge className={getRoleClass()}>
      {role || "Không xác định"}
    </Badge>
  );
};

/**
 * Staff Edit Modal Component
 */
type StaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
  agencyList: any[];
  onSave: (data: StaffMember) => Promise<void>;
  isCreating: boolean;
};

const StaffModal = ({
  isOpen,
  onClose,
  staff,
  agencyList,
  onSave,
  isCreating
}: StaffModalProps) => {
  const [formData, setFormData] = useState<StaffMember>({
    fullname: "",
    role: "staff",
    agencyid: 0,
    email: "",
    phonenumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing existing staff
  useEffect(() => {
    if (staff) {
      setFormData({
        fullname: staff.fullname || "",
        role: staff.role || "staff",
        agencyid: staff.agencyid || 0,
        email: staff.email || "",
        phonenumber: staff.phonenumber || "",
        // For existing staff, include ID
        ...(staff.staffid ? { staffid: staff.staffid } : {})
      });
    } else {
      // Reset form for new staff
      setFormData({
        fullname: "",
        role: "staff",
        agencyid: agencyList.length > 0 ? agencyList[0].agencyid || agencyList[0].id || 0 : 0,
        email: "",
        phonenumber: ""
      });
    }
  }, [staff, agencyList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "agencyid") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate form
      if (!formData.fullname.trim()) {
        setError("Vui lòng nhập họ tên cán bộ");
        return;
      }

      if (!formData.agencyid) {
        setError("Vui lòng chọn cơ quan");
        return;
      }
      
      // If creating new staff and password is not provided
      if (isCreating && !formData.password) {
        setError("Vui lòng nhập mật khẩu");
        return;
      }

      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error("Error saving staff:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu thông tin cán bộ");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "staff", label: "Cán bộ" },
    { value: "manager", label: "Quản lý" },
    { value: "admin", label: "Quản trị viên" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <Heading level="h3" className="font-medium">
          {isCreating ? "Thêm tài khoản cán bộ mới" : "Cập nhật thông tin cán bộ"}
        </Heading>
        <Text className="text-gray-500 mt-1">
          {isCreating 
            ? "Điền thông tin để tạo tài khoản mới cho cán bộ" 
            : "Chỉnh sửa thông tin cán bộ"}
        </Text>
      </Modal.Header>
      
      <Modal.Body className="py-4 space-y-4">
        {error && (
          <div className="p-3 bg-gray-50 border border-gray-200 text-gray-700 rounded flex items-center">
            <ExclamationCircle className="w-4 h-4 mr-2 text-gray-500" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Label htmlFor="fullname">Họ và tên <span className="text-gray-500">*</span></Label>
          <Input
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Nhập họ và tên cán bộ"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phonenumber">Số điện thoại</Label>
          <Input
            id="phonenumber"
            name="phonenumber"
            value={formData.phonenumber || ""}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="agencyid">Cơ quan <span className="text-gray-500">*</span></Label>
          <div className="mt-1">
            <Select 
              value={formData.agencyid?.toString()} 
              onValueChange={(value) => handleSelectChange("agencyid", value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Chọn cơ quan" />
              </Select.Trigger>
              <Select.Content>
                {agencyList.map(agency => {
                  const id = agency.agencyid || agency.id;
                  const name = agency.agencyname || agency.name;
                  
                  if (!id) return null;
                  
                  return (
                    <Select.Item key={id} value={id.toString()}>
                      {name || `Cơ quan #${id}`}
                    </Select.Item>
                  );
                })}
              </Select.Content>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="role">Vai trò <span className="text-gray-500">*</span></Label>
          <div className="mt-1">
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleSelectChange("role", value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Chọn vai trò" />
              </Select.Trigger>
              <Select.Content>
                {roleOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>

        {isCreating && (
          <div>
            <Label htmlFor="password">Mật khẩu <span className="text-gray-500">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="mt-1"
              required
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={loading}
          >
            {isCreating ? "Tạo tài khoản" : "Lưu thay đổi"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

/**
 * DeleteConfirmDialog Component
 */
type DeleteConfirmProps = {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  onConfirm: () => Promise<void>;
};

const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  staffName,
  onConfirm
}: DeleteConfirmProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error("Error deleting staff:", err);
      setError(err.message || "Có lỗi xảy ra khi xóa cán bộ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <Heading level="h3" className="font-medium">
          Xác nhận xóa tài khoản cán bộ
        </Heading>
      </Modal.Header>
      
      <Modal.Body className="py-4">
        {error && (
          <div className="p-3 mb-4 bg-gray-50 border border-gray-200 text-gray-700 rounded flex items-center">
            <ExclamationCircle className="w-4 h-4 mr-2 text-gray-500" />
            <span>{error}</span>
          </div>
        )}

        <Text>
          Bạn có chắc chắn muốn xóa tài khoản cán bộ <strong>{staffName}</strong>? 
          Hành động này không thể hoàn tác.
        </Text>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            isLoading={loading}
          >
            Xóa
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

/**
 * Trang Quản lý Tài khoản Cán bộ
 */
export default function StaffAccountsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [agencyFilter, setAgencyFilter] = useState<number | null>(null);
  const [agencyList, setAgencyList] = useState<any[]>([]);
  const [loadingAgencyList, setLoadingAgencyList] = useState(false);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Initial loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    loadStaffList();
    loadAgencyList();
  }, [authLoading, isAuthenticated, router]);

  // Filter staff list when filters change
  useEffect(() => {
    let filtered = [...staffList];

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(staff => 
        staff.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Apply agency filter
    if (agencyFilter !== null) {
      filtered = filtered.filter(staff => {
        const staffAgencyId = staff.agencyid || staff.agency_id || staff.agency;
        return staffAgencyId === agencyFilter;
      });
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.fullname?.toLowerCase().includes(term) ||
        staff.email?.toLowerCase().includes(term) ||
        staff.phonenumber?.includes(term) ||
        staff.staffid?.toString().includes(term)
      );
    }

    setFilteredStaff(filtered);
    setCurrentPage(1); // Reset to first page
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [staffList, roleFilter, agencyFilter, searchTerm, itemsPerPage]);

  // Load staff list
  const loadStaffList = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAllStaff();
      
      if (Array.isArray(data)) {
        // Enrich staff data with agency names
        const enrichedData = data.map(staff => {
          const agency = agencyList.find(a => (a.agencyid || a.id) === staff.agencyid);
          return {
            ...staff,
            agencyname: agency ? (agency.agencyname || agency.name) : `Cơ quan #${staff.agencyid}`
          };
        });
        
        setStaffList(enrichedData);
        setFilteredStaff(enrichedData);
      } else {
        setStaffList([]);
        setFilteredStaff([]);
        setError("Dữ liệu không đúng định dạng. Vui lòng thử lại sau.");
      }
    } catch (err: any) {
      console.error("Error loading staff list:", err);
      setError(err.message || "Không thể tải danh sách cán bộ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Load agency list
  const loadAgencyList = async () => {
    setLoadingAgencyList(true);
    try {
      const agencies = await fetchAllAgencies();
      
      if (Array.isArray(agencies)) {
        const validAgencies = agencies.filter(agency => 
          agency && (agency.agencyid || agency.id)
        );
        setAgencyList(validAgencies);
      } else {
        setAgencyList([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách cơ quan:", err);
      setAgencyList([]);
    } finally {
      setLoadingAgencyList(false);
    }
  };

  // Handle creating a new staff member
  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setIsCreating(true);
    setIsEditModalOpen(true);
  };

  // Handle editing a staff member
  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsCreating(false);
    setIsEditModalOpen(true);
  };

  // Handle deleting a staff member
  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Save staff (create or update)
  const handleSaveStaff = async (data: StaffMember) => {
    try {
      if (isCreating) {
        await createStaff(data);
      } else if (selectedStaff?.staffid) {
        await updateStaff(selectedStaff.staffid, data);
      }
      
      // Reload staff list after successful operation
      await loadStaffList();
    } catch (err) {
      console.error("Error saving staff:", err);
      throw err;
    }
  };

  // Confirm staff deletion
  const handleConfirmDelete = async () => {
    if (!selectedStaff?.staffid) return;
    
    try {
      await deleteStaff(selectedStaff.staffid);
      await loadStaffList();
    } catch (err) {
      console.error("Error deleting staff:", err);
      throw err;
    }
  };

  // Handle agency filter change
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
        }
      }
    } catch (error) {
      console.error("Error handling agency filter change:", error);
      setAgencyFilter(null);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setAgencyFilter(null);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  };

  if (authLoading) {
    return <Spinner />;
  }

  // Options for role filter dropdown
  const roleOptions = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "staff", label: "Cán bộ" },
    { value: "manager", label: "Quản lý" },
    { value: "admin", label: "Quản trị viên" }
  ];

  return (
    <Container className="py-6 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold">
            Quản lý Tài khoản Cán bộ
          </Heading>
          <Text className="text-gray-500 mt-1">
            Quản lý tài khoản và phân quyền cho cán bộ các cơ quan
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
          <Button variant="secondary" onClick={loadStaffList}>
            <ArrowPath className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="primary" onClick={handleCreateStaff}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm cán bộ
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
        {loadingAgencyList && (
          <div className="mb-4 p-2 bg-gray-50 text-gray-600 text-sm rounded">
            Đang tải dữ liệu cơ quan...
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2 block">
              <div className="flex items-center">
                <MagnifyingGlass className="w-4 h-4 mr-2 text-gray-500" />
                Tìm kiếm cán bộ
              </div>
            </Label>
            <Input
              id="search"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Label htmlFor="roleFilter" className="mb-2 block">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Lọc theo vai trò
              </div>
            </Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Chọn vai trò" />
              </Select.Trigger>
              <Select.Content>
                {roleOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          
          <div className="w-full md:w-64">
            <Label htmlFor="agencyFilter" className="mb-2 block">
              <div className="flex items-center">
                <Buildings className="w-4 h-4 mr-2 text-gray-500" />
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
              <Select.Content>
                <Select.Item value="all">Tất cả cơ quan</Select.Item>
                {agencyList.length > 0 ? (
                  agencyList.map(agency => {
                    const id = agency.agencyid || agency.id;
                    const name = agency.agencyname || agency.name;
                    
                    if (!id) return null;
                    
                    return (
                      <Select.Item key={id} value={id.toString()}>
                        {name || `Cơ quan #${id}`}
                      </Select.Item>
                    );
                  })
                ) : null}
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <Spinner />
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heading level="h2" className="text-xl mb-2">
            Không tìm thấy cán bộ nào
          </Heading>
          <Text className="text-gray-500">
            Không có cán bộ nào phù hợp với điều kiện tìm kiếm.
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
                  <Table.HeaderCell>Họ và tên</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Số điện thoại</Table.HeaderCell>
                  <Table.HeaderCell>Cơ quan</Table.HeaderCell>
                  <Table.HeaderCell>Vai trò</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Hành động
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {getCurrentPageItems().map(staff => (
                  <Table.Row
                    key={staff.staffid}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Table.Cell>{staff.staffid}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        {staff.fullname}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{staff.email || "—"}</Table.Cell>
                    <Table.Cell>{staff.phonenumber || "—"}</Table.Cell>
                    <Table.Cell>{staff.agencyname || `Cơ quan #${staff.agencyid}`}</Table.Cell>
                    <Table.Cell>
                      <RoleBadge role={staff.role} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <PencilSquare className="w-3.5 h-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(staff);
                          }}
                        >
                          <Trash className="w-3.5 h-3.5 mr-1" />
                          Xóa
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
              {filteredStaff.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              đến{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredStaff.length
              )}{" "}
              trong tổng số {filteredStaff.length} cán bộ
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
                  Trang {currentPage} / {totalPages || 1}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <StaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staff={selectedStaff}
        agencyList={agencyList}
        onSave={handleSaveStaff}
        isCreating={isCreating}
      />

      {/* Delete confirmation modal */}
      {selectedStaff && (
        <DeleteConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          staffName={selectedStaff.fullname}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Container>
  );
} 