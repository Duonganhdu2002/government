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
import StaffModal from "@/components/StaffModal";

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
  StaffMember,
  fetchStaffWithAgencyDetails
} from "@/services/staffService";

import { fetchAllAgencies } from "@/services/agencyService";
import { apiClient } from '@/lib/api';

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
      case "staff":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Convert role to Vietnamese
  const getRoleText = () => {
    switch (roleLower) {
      case "admin":
        return "Quản trị viên";
      case "staff":
      default:
        return "Cán bộ";
    }
  };

  return (
    <Badge className={getRoleClass()}>
      {getRoleText()}
    </Badge>
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
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
            className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          >
            Hủy
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleDelete} 
            isLoading={loading}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
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

    // Load agencies first, then staff list
    const initialize = async () => {
      try {
        await loadAgencyList();
        await loadStaffList();
      } catch (err) {
        console.error("Error initializing:", err);
      }
    };

    initialize();
  }, [authLoading, isAuthenticated, router]);

  // Filter staff list when filters change
  useEffect(() => {
    let filtered = [...staffList];

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
        staff.staffid?.toString().includes(term)
      );
    }

    setFilteredStaff(filtered);
    setCurrentPage(1); // Reset to first page
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [staffList, agencyFilter, searchTerm, itemsPerPage]);

  // Load staff list
  const loadStaffList = async () => {
    setLoading(true);
    setError("");

    try {
      // Use the new combined function that fetches staff with agency details
      const enrichedData = await fetchStaffWithAgencyDetails();
      
      if (Array.isArray(enrichedData)) {
        console.log("Staff data with agency details:", enrichedData);
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
        // Check if this is a password update
        if (data.password) {
          console.log(`Updating password for staff ${selectedStaff.staffid} using the dedicated password API endpoint`);
          try {
            // Use the dedicated staff password update endpoint
            await apiClient.post('/api/auth/staff-change-password', {
              staffId: selectedStaff.staffid,
              newPassword: data.password,
              isAdminUpdate: true // Flag to indicate this is an admin update, so old password is not required
            });
            console.log('Password update successful');
            
            // Remove password from data before calling updateStaff
            const { password, passwordhash, ...staffDataWithoutPassword } = data;
            await updateStaff(selectedStaff.staffid, staffDataWithoutPassword);
          } catch (passwordError) {
            console.error('Error updating password via dedicated endpoint:', passwordError);
            // If the dedicated endpoint fails, try the regular update
            console.log('Falling back to regular staff update with password');
            await updateStaff(selectedStaff.staffid, data);
          }
        } else {
          // Regular staff update
          await updateStaff(selectedStaff.staffid, data);
        }
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

  return (
    <Container className="py-6 max-w-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold text-gray-800">
            Quản lý Tài khoản Cán bộ
          </Heading>
          <Text className="text-gray-500 mt-1">
            Quản lý tài khoản và phân quyền cho cán bộ các cơ quan
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetFilters} className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
            Xóa bộ lọc
          </Button>
          <Button variant="secondary" onClick={loadStaffList} className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
            <ArrowPath className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="primary" onClick={handleCreateStaff} className="bg-gray-700 text-white hover:bg-gray-800">
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
              placeholder="Tìm theo tên hoặc mã cán bộ..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full"
            />
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
                    <Table.Cell>
                      {staff.agencyname || "Không xác định"}
                    </Table.Cell>
                    <Table.Cell>
                      <RoleBadge role={staff.role} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleEditStaff(staff)}
                          className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        >
                          <PencilSquare className="w-3.5 h-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(staff);
                          }}
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
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
                  className="border border-gray-200 px-2 py-1 rounded-l bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  className="border border-gray-200 px-2 py-1 rounded-r bg-gray-100 text-gray-700 hover:bg-gray-200"
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