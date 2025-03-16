"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Input,
  Label,
  Select,
} from "@medusajs/ui";

import {
  User,
  MapPin,
  ExclamationCircle,
  ArrowPath,
  PencilSquare,
  Trash,
  Plus,
  MagnifyingGlass
} from "@medusajs/icons";

import { 
  fetchCitizensWithAreaDetails,
  createCitizen, 
  updateCitizen, 
  deleteCitizen, 
  CitizenUser
} from "@/services/citizenService";

import CitizenModal from "@/components/CitizenModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

export default function CitizenAccountsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Core data states
  const [citizenList, setCitizenList] = useState<CitizenUser[]>([]);
  const [areaList, setAreaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState<number | null>(null);
  
  // Modal states
  const [modalState, setModalState] = useState({
    isEditOpen: false,
    isDeleteOpen: false,
    selectedCitizen: null as CitizenUser | null,
    isCreating: false
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load data function - consolidated for better performance
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Load citizens data
      const citizensData = await fetchCitizensWithAreaDetails();
      setCitizenList(Array.isArray(citizensData) ? citizensData : []);
      
      // Load areas data
      const areasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/areas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!areasResponse.ok) throw new Error(`Failed to fetch areas: ${areasResponse.status}`);
      
      const areasData = await areasResponse.json();
      
      let areas: any[] = [];
      if (areasData && areasData.status === 'success' && Array.isArray(areasData.data)) {
        areas = areasData.data;
      } else if (Array.isArray(areasData)) {
        areas = areasData;
      }
      
      setAreaList(areas.filter(area => area && (area.areacode || area.id)));
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, loadData]);

  // Memoized filtered citizens list
  const filteredCitizens = useMemo(() => {
    let result = [...citizenList];

    if (areaFilter !== null) {
      result = result.filter(citizen => citizen.areacode === areaFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(citizen =>
        citizen.fullname?.toLowerCase().includes(term) ||
        citizen.identificationnumber?.toString().includes(term) ||
        citizen.citizenid?.toString().includes(term)
      );
    }

    return result;
  }, [citizenList, areaFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCitizens.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCitizens.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCitizens, currentPage, itemsPerPage]);

  // Make sure currentPage is valid when filters or pagination changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  // Modal handlers - consolidated into functions
  const openCreateModal = () => {
    setModalState({
      isEditOpen: true, 
      isDeleteOpen: false,
      selectedCitizen: null,
      isCreating: true
    });
  };

  const openEditModal = (citizen: CitizenUser) => {
    setModalState({
      isEditOpen: true,
      isDeleteOpen: false,
      selectedCitizen: citizen,
      isCreating: false
    });
  };

  const openDeleteModal = (citizen: CitizenUser) => {
    setModalState({
      isEditOpen: false,
      isDeleteOpen: true,
      selectedCitizen: citizen,
      isCreating: false
    });
  };

  const closeModals = () => {
    setModalState(prev => ({
      ...prev,
      isEditOpen: false,
      isDeleteOpen: false
    }));
  };

  // Action handlers
  const handleSaveCitizen = async (data: CitizenUser): Promise<void> => {
    try {
      if (modalState.isCreating) {
        await createCitizen(data);
      } else if (modalState.selectedCitizen?.citizenid) {
        await updateCitizen(modalState.selectedCitizen.citizenid, data);
      }
      
      closeModals();
      loadData(); // Reload data immediately
    } catch (err) {
      console.error("Error saving citizen:", err);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!modalState.selectedCitizen?.citizenid) return;
    
    try {
      await deleteCitizen(modalState.selectedCitizen.citizenid);
      closeModals();
      loadData(); // Reload data immediately
    } catch (err) {
      console.error("Error deleting citizen:", err);
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setAreaFilter(null);
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
            Quản lý Tài khoản Người dân
          </Heading>
          <Text className="text-gray-500 mt-1">
            Quản lý tài khoản và thông tin người dân trên hệ thống
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
          <Button variant="primary" onClick={openCreateModal} className="bg-gray-700 text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dân
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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2 block">
              <div className="flex items-center">
                <MagnifyingGlass className="w-4 h-4 mr-2 text-gray-500" />
                Tìm kiếm người dân
              </div>
            </Label>
            <Input
              id="search"
              placeholder="Tìm theo tên, CCCD hoặc mã người dân..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Label htmlFor="areaFilter" className="mb-2 block">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                Lọc theo khu vực
              </div>
            </Label>
            <Select 
              value={areaFilter?.toString() || "all"} 
              onValueChange={(value) => {
                setAreaFilter(value === "all" ? null : parseInt(value, 10))
              }}
              disabled={loading}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={loading ? "Đang tải..." : "Chọn khu vực"} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Tất cả khu vực</Select.Item>
                {areaList.map(area => {
                  const id = area.areacode || area.id;
                  const name = area.areaname || area.name;
                  
                  if (!id) return null;
                  
                  return (
                    <Select.Item key={id} value={id.toString()}>
                      {name || `Khu vực #${id}`}
                    </Select.Item>
                  );
                })}
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* Citizen Table */}
      {loading ? (
        <Spinner />
      ) : filteredCitizens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heading level="h2" className="text-xl mb-2">
            Không tìm thấy người dân nào
          </Heading>
          <Text className="text-gray-500">
            Không có người dân nào phù hợp với điều kiện tìm kiếm.
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
                  <Table.HeaderCell>CCCD/CMND</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Điện thoại</Table.HeaderCell>
                  <Table.HeaderCell>Khu vực</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Hành động
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {currentItems.map(citizen => (
                  <Table.Row
                    key={citizen.citizenid}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Table.Cell>{citizen.citizenid}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        {citizen.fullname}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{citizen.identificationnumber}</Table.Cell>
                    <Table.Cell>{citizen.email || "—"}</Table.Cell>
                    <Table.Cell>{citizen.phonenumber || "—"}</Table.Cell>
                    <Table.Cell>
                      {citizen.areaname || "Không xác định"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => openEditModal(citizen)}
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
                            openDeleteModal(citizen);
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
              {filteredCitizens.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              đến{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredCitizens.length
              )}{" "}
              trong tổng số {filteredCitizens.length} người dân
            </div>

            <div className="flex items-center">
              <div className="mr-4 flex items-center">
                <Text size="small" className="mr-2 text-gray-600">
                  Số dòng mỗi trang:
                </Text>
                <Select
                  size="small"
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
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
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-gray-200 px-2 py-1 rounded-r bg-gray-100 text-gray-700 hover:bg-gray-200"
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

      {/* Edit modal */}
      <CitizenModal
        isOpen={modalState.isEditOpen}
        onClose={closeModals}
        citizen={modalState.selectedCitizen}
        areaList={areaList}
        onSave={handleSaveCitizen}
        isCreating={modalState.isCreating}
      />

      {/* Delete confirmation modal */}
      {modalState.selectedCitizen && (
        <DeleteConfirmDialog
          isOpen={modalState.isDeleteOpen}
          onClose={closeModals}
          citizenName={modalState.selectedCitizen.fullname}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Container>
  );
} 