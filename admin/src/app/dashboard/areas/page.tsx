"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  IconButton,
  Input,
} from "@medusajs/ui";

import {
  PencilSquare,
  Plus,
  Trash,
  MagnifyingGlass,
  ArrowPath,
  ExclamationCircle,
} from "@medusajs/icons";

import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import AreaModal from "@/components/AreaModal";
import { Area } from "@/components/AreaModal";

import {
  fetchAreasByLevel,
  createArea,
  updateArea,
  deleteArea
} from "@/services/areaService";

/**
 * Spinner component for loading states
 */
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

/**
 * Trang quản lý khu vực địa lý (tỉnh/thành phố)
 */
export default function AreasPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Areas data
  const [provinces, setProvinces] = useState<Area[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");

  // Selected items for editing
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Modal states
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user has admin/manager role
    if (user && user.role !== 'admin' && user.role !== 'manager') {
      router.push("/dashboard");
      return;
    }

    // Initialize
    if (isAuthenticated) {
      loadProvinces();
    }
  }, [authLoading, isAuthenticated, router]);

  // Load provinces
  const loadProvinces = async () => {
    setLoading(true);
    try {
      const data = await fetchAreasByLevel('province');
      setProvinces(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu tỉnh/thành phố");
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setSearchQuery("");
    loadProvinces();
  };

  // Filter areas based on search query
  const filteredProvinces = useMemo(() => {
    if (!searchQuery) return provinces;
    return provinces.filter(province => 
      province.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [provinces, searchQuery]);

  // Area Modal Handlers
  const handleOpenAreaModal = (area?: Area) => {
    if (area) {
      setSelectedArea(area);
    } else {
      setSelectedArea(null);
    }
    
    setIsAreaModalOpen(true);
  };

  const handleCloseAreaModal = () => {
    setIsAreaModalOpen(false);
    setSelectedArea(null);
  };

  const handleSaveArea = async (areaData: Area) => {
    try {
      if (selectedArea) {
        // Update existing area
        await updateArea(selectedArea.id || 0, areaData);
      } else {
        // Create new area
        await createArea(areaData);
      }
      
      // Refresh data
      handleCloseAreaModal();
      loadProvinces();
    } catch (err: any) {
      console.error("Lỗi khi lưu khu vực:", err);
      setError(err.message || "Không thể lưu khu vực");
    }
  };

  const handleDeleteArea = (area: Area) => {
    setSelectedArea(area);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteArea = async () => {
    if (!selectedArea) return;
    
    try {
      await deleteArea(selectedArea.id || 0);
      setIsDeleteModalOpen(false);
      loadProvinces();
    } catch (err: any) {
      console.error("Lỗi khi xóa khu vực:", err);
      setError(err.message || "Không thể xóa khu vực");
    }
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
            Quản lý khu vực
          </Heading>
          <Text className="text-gray-500 mt-1">
            Quản lý các khu vực địa lý: tỉnh/thành phố
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRefresh} className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
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

      {/* Search and Add button */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/3">
          <div className="relative max-w-sm">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MagnifyingGlass className="text-gray-500 w-4 h-4" />
            </div>
            <Input
              placeholder="Tìm kiếm tỉnh/thành phố..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <div>
          <Button 
            variant="primary" 
            onClick={() => handleOpenAreaModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm tỉnh/thành phố
          </Button>
        </div>
      </div>

      {/* Province Table */}
      <div className="bg-white rounded-lg border border-ui-border-base">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Tên tỉnh/thành phố</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Thao tác</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <td colSpan={3}>
                  <Spinner />
                </td>
              </Table.Row>
            ) : filteredProvinces.length === 0 ? (
              <Table.Row>
                <td colSpan={3}>
                  <div className="text-center py-8">
                    <Text className="text-gray-500">Không tìm thấy tỉnh/thành phố nào</Text>
                  </div>
                </td>
              </Table.Row>
            ) : (
              filteredProvinces.map((province) => (
                <Table.Row key={province.id}>
                  <Table.Cell>{province.id}</Table.Cell>
                  <Table.Cell>{province.name}</Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-2">
                      <IconButton
                        variant="transparent"
                        onClick={() => handleOpenAreaModal(province)}
                      >
                        <PencilSquare className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        variant="transparent"
                        onClick={() => handleDeleteArea(province)}
                      >
                        <Trash className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Area Modal */}
      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={handleCloseAreaModal}
        selectedArea={selectedArea}
        onSave={handleSaveArea}
        parentAreas={[]}
        areaLevel="province"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa tỉnh/thành phố"
        itemName={selectedArea?.name}
        description="Lưu ý: Việc xóa sẽ xóa tỉnh/thành phố này. Thao tác này không thể hoàn tác."
        onConfirm={confirmDeleteArea}
      />
    </Container>
  );
} 