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
    IconButton,
    Input,
    Tabs,
    Select,
    Label,
    Textarea
} from "@medusajs/ui";

import {
    PencilSquare,
    Plus,
    Trash,
    MagnifyingGlass,
    ArrowPath,
    ExclamationCircle
} from "@medusajs/icons";

import Modal from "@/components/Modal";

import {
    ApplicationType,
    SpecialApplicationType
} from "@/types/application";

import {
    fetchApplicationTypes,
    createApplicationType,
    updateApplicationType,
    deleteApplicationType,
    fetchSpecialApplicationTypes,
    createSpecialApplicationType,
    updateSpecialApplicationType,
    deleteSpecialApplicationType
} from "@/services/applicationService";

/**
 * Spinner component for loading states
 */
const Spinner = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
    </div>
);

/**
 * Extended TableRow component to support expansion
 */
const ExtendedTableRow = ({
    appType,
    isExpanded,
    onToggleExpand,
    specialTypes,
    onEdit,
    onDelete,
    onAddSpecial,
    onEditSpecial,
    onDeleteSpecial
}: {
    appType: ApplicationType;
    isExpanded: boolean;
    onToggleExpand: () => void;
    specialTypes: SpecialApplicationType[];
    onEdit: () => void;
    onDelete: () => void;
    onAddSpecial: () => void;
    onEditSpecial: (specialType: SpecialApplicationType) => void;
    onDeleteSpecial: (specialTypeId: number) => void;
}) => {
    return (
        <>
            <Table.Row>
                <Table.Cell>{appType.applicationtypeid}</Table.Cell>
                <Table.Cell>
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={onToggleExpand}
                    >
                        {isExpanded ? (
                            <div className="w-4 h-4 mr-2 text-gray-500">−</div>
                        ) : (
                            <div className="w-4 h-4 mr-2 text-gray-500">+</div>
                        )}
                        <span>{appType.typename}</span>
                    </div>
                </Table.Cell>
                <Table.Cell>{appType.processingtimelimit}</Table.Cell>
                <Table.Cell>
                    <div className="flex justify-end gap-2">
                        <IconButton
                            variant="transparent"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <PencilSquare className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                            variant="transparent"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash className="w-4 h-4" />
                        </IconButton>
                    </div>
                </Table.Cell>
            </Table.Row>

            {isExpanded && (
                <tr className="bg-gray-50">
                    <td className="p-0" colSpan={4}>
                        <div className="py-3 px-8">
                            <div className="flex justify-between items-center mb-3">
                                <Text className="font-medium">Hồ sơ đặc biệt</Text>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSpecial();
                                    }}
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Thêm đặc biệt
                                </Button>
                            </div>

                            {specialTypes.length === 0 ? (
                                <Text className="text-gray-500 text-sm italic">Không có hồ sơ đặc biệt</Text>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {specialTypes.map((specialType) => (
                                        <div
                                            key={specialType.specialapplicationtypeid}
                                            className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                                        >
                                            <div>
                                                <Text className="font-medium">{specialType.typename}</Text>
                                                <Text className="text-sm text-gray-500">
                                                    Thời hạn: {specialType.processingtimelimit} ngày
                                                </Text>
                                            </div>
                                            <div className="flex gap-2">
                                                <IconButton
                                                    variant="transparent"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditSpecial(specialType);
                                                    }}
                                                >
                                                    <PencilSquare className="w-3 h-3" />
                                                </IconButton>
                                                <IconButton
                                                    variant="transparent"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteSpecial(specialType.specialapplicationtypeid);
                                                    }}
                                                >
                                                    <Trash className="w-3 h-3" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

/**
 * Trang quản lý loại hồ sơ
 */
export default function ApplicationTypesPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading, user } = useAuth();

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Application types data
    const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
    const [specialApplicationTypes, setSpecialApplicationTypes] = useState<SpecialApplicationType[]>([]);

    // UI state
    const [activeTab, setActiveTab] = useState("application-types");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTypeId, setExpandedTypeId] = useState<number | null>(null);

    // Selected items for editing
    const [selectedAppType, setSelectedAppType] = useState<ApplicationType | null>(null);
    const [selectedSpecialAppType, setSelectedSpecialAppType] = useState<SpecialApplicationType | null>(null);

    // Modal states
    const [isAppTypeModalOpen, setIsAppTypeModalOpen] = useState(false);
    const [isSpecialAppTypeModalOpen, setIsSpecialAppTypeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSpecialTypeDeleteModalOpen, setIsSpecialTypeDeleteModalOpen] = useState(false);

    // Form state
    const [appTypeFormData, setAppTypeFormData] = useState({
        typename: "",
        description: "",
        processingtimelimit: 30
    });

    const [specialAppTypeFormData, setSpecialAppTypeFormData] = useState({
        applicationtypeid: 0,
        typename: "",
        description: "",
        processingtimelimit: 30
    });

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
            loadApplicationTypes();
            loadSpecialApplicationTypes();
        }
    }, [authLoading, isAuthenticated, router]);

    // Load application types data
    const loadApplicationTypes = async () => {
        setLoading(true);
        try {
            const data = await fetchApplicationTypes();
            setApplicationTypes(data);
        } catch (err: any) {
            setError(err.message || "Không thể tải dữ liệu loại hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    // Load special application types data
    const loadSpecialApplicationTypes = async () => {
        try {
            const data = await fetchSpecialApplicationTypes();
            setSpecialApplicationTypes(data);
        } catch (err: any) {
            console.error("Lỗi khi tải loại hồ sơ đặc biệt:", err);
        }
    };

    // Handle refresh button click
    const handleRefresh = () => {
        loadApplicationTypes();
        loadSpecialApplicationTypes();
    };

    // Filter application types based on search query
    const filteredApplicationTypes = applicationTypes.filter(
        (appType) =>
            appType.typename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appType.description && appType.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Filter special application types based on search query
    const filteredSpecialApplicationTypes = specialApplicationTypes.filter(
        (specialAppType) =>
            specialAppType.typename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (specialAppType.description && specialAppType.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Map application type ID to name for display in special application types table
    const getApplicationTypeName = (appTypeId: number) => {
        const appType = applicationTypes.find(type => type.applicationtypeid === appTypeId);
        return appType ? appType.typename : `Loại hồ sơ ID: ${appTypeId}`;
    };

    // Get special types for a specific application type ID
    const getSpecialTypesForAppType = (appTypeId: number) => {
        return specialApplicationTypes.filter(
            (specialType) => specialType.applicationtypeid === appTypeId
        );
    };

    // Toggle expanded application type
    const toggleExpandAppType = (appTypeId: number) => {
        if (expandedTypeId === appTypeId) {
            setExpandedTypeId(null);
        } else {
            setExpandedTypeId(appTypeId);
        }
    };

    // Application Type Form Handlers
    const handleOpenAppTypeModal = (appType?: ApplicationType) => {
        if (appType) {
            setSelectedAppType(appType);
            setAppTypeFormData({
                typename: appType.typename,
                description: appType.description || "",
                processingtimelimit: appType.processingtimelimit
            });
        } else {
            setSelectedAppType(null);
            setAppTypeFormData({
                typename: "",
                description: "",
                processingtimelimit: 30
            });
        }
        setIsAppTypeModalOpen(true);
    };

    const handleCloseAppTypeModal = () => {
        setIsAppTypeModalOpen(false);
        setSelectedAppType(null);
    };

    const handleAppTypeFormChange = (field: string, value: string | number) => {
        setAppTypeFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitAppTypeForm = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (selectedAppType) {
                // Update existing application type
                await updateApplicationType(selectedAppType.applicationtypeid, appTypeFormData);
            } else {
                // Create new application type
                await createApplicationType(appTypeFormData);
            }

            // Refresh data and close modal
            loadApplicationTypes();
            handleCloseAppTypeModal();
        } catch (err: any) {
            console.error("Lỗi khi lưu loại hồ sơ:", err);
            setError(err.message || "Không thể lưu loại hồ sơ. Vui lòng thử lại.");
        }
    };

    // Special Application Type Form Handlers
    const handleOpenSpecialAppTypeModal = (specialAppType?: SpecialApplicationType) => {
        // Make sure we have application types loaded before opening the modal
        if (applicationTypes.length === 0) {
            setError("Không có loại hồ sơ nào. Vui lòng tạo loại hồ sơ trước.");
            return;
        }

        if (specialAppType) {
            setSelectedSpecialAppType(specialAppType);
            setSpecialAppTypeFormData({
                applicationtypeid: specialAppType.applicationtypeid || 0,
                typename: specialAppType.typename || "",
                description: specialAppType.description || "",
                processingtimelimit: specialAppType.processingtimelimit || 30
            });
        } else {
            setSelectedSpecialAppType(null);
            setSpecialAppTypeFormData({
                applicationtypeid: applicationTypes.length > 0 ? applicationTypes[0].applicationtypeid : 0,
                typename: "",
                description: "",
                processingtimelimit: 30
            });
        }
        setIsSpecialAppTypeModalOpen(true);
    };

    const handleCloseSpecialAppTypeModal = () => {
        setIsSpecialAppTypeModalOpen(false);
        setSelectedSpecialAppType(null);
    };

    const handleSpecialAppTypeFormChange = (field: string, value: string | number) => {
        setSpecialAppTypeFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitSpecialAppTypeForm = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (selectedSpecialAppType) {
                // Update existing special application type
                await updateSpecialApplicationType(selectedSpecialAppType.specialapplicationtypeid, specialAppTypeFormData);
            } else {
                // Create new special application type
                await createSpecialApplicationType(specialAppTypeFormData);
            }

            // Refresh data and close modal
            loadSpecialApplicationTypes();
            handleCloseSpecialAppTypeModal();
        } catch (err: any) {
            console.error("Lỗi khi lưu loại hồ sơ đặc biệt:", err);
            setError(err.message || "Không thể lưu loại hồ sơ đặc biệt. Vui lòng thử lại.");
        }
    };

    // Delete Application Type Handlers
    const handleDeleteAppType = async (appTypeId: number) => {
        const appType = applicationTypes.find(type => type.applicationtypeid === appTypeId);
        if (appType) {
            setSelectedAppType(appType);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDeleteAppType = async () => {
        if (!selectedAppType) return;

        try {
            await deleteApplicationType(selectedAppType.applicationtypeid);
            loadApplicationTypes();
            loadSpecialApplicationTypes(); // Also refresh special types as they might be affected
            setIsDeleteModalOpen(false);
            setSelectedAppType(null);
        } catch (err: any) {
            console.error("Lỗi khi xóa loại hồ sơ:", err);
            setError(err.message || "Không thể xóa loại hồ sơ. Vui lòng thử lại.");
        }
    };

    // Delete Special Application Type Handlers
    const handleDeleteSpecialAppType = async (specialAppTypeId: number) => {
        const specialAppType = specialApplicationTypes.find(type => type.specialapplicationtypeid === specialAppTypeId);
        if (specialAppType) {
            setSelectedSpecialAppType(specialAppType);
            setIsSpecialTypeDeleteModalOpen(true);
        }
    };

    const confirmDeleteSpecialAppType = async () => {
        if (!selectedSpecialAppType) return;

        try {
            await deleteSpecialApplicationType(selectedSpecialAppType.specialapplicationtypeid);
            loadSpecialApplicationTypes();
            setIsSpecialTypeDeleteModalOpen(false);
            setSelectedSpecialAppType(null);
        } catch (err: any) {
            console.error("Lỗi khi xóa loại hồ sơ đặc biệt:", err);
            setError(err.message || "Không thể xóa loại hồ sơ đặc biệt. Vui lòng thử lại.");
        }
    };

    // Add this function to safely handle the toString conversion
    const safeToString = (value: any) => {
        if (value === null || value === undefined) {
            return "0";
        }
        return value.toString();
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
                        Quản lý hồ sơ
                    </Heading>
                    <Text className="text-gray-500 mt-1">
                        Thêm, sửa và xóa các hồ sơ và hồ sơ đặc biệt
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
                            placeholder="Tìm kiếm hồ sơ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 max-w-sm"
                        />
                    </div>
                </div>
                <div>
                    <Button variant="primary" onClick={() => handleOpenAppTypeModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Application Types Tab Content */}
            <div className="bg-white rounded-lg border border-ui-border-base">
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Tên hồ sơ</Table.HeaderCell>
                            <Table.HeaderCell>Thời hạn xử lý (ngày)</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Thao tác</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? (
                            <Table.Row>
                                <Table.Cell>
                                    <div className="col-span-4">
                                        <Spinner />
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ) : filteredApplicationTypes.length === 0 ? (
                            <Table.Row>
                                <Table.Cell>
                                    <div className="col-span-4 text-center py-8">
                                        <Text className="text-gray-500">Không tìm thấy hồ sơ nào</Text>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            filteredApplicationTypes.map((appType) => (
                                <ExtendedTableRow
                                    key={appType.applicationtypeid}
                                    appType={appType}
                                    isExpanded={expandedTypeId === appType.applicationtypeid}
                                    onToggleExpand={() => toggleExpandAppType(appType.applicationtypeid)}
                                    specialTypes={getSpecialTypesForAppType(appType.applicationtypeid)}
                                    onEdit={() => handleOpenAppTypeModal(appType)}
                                    onDelete={() => handleDeleteAppType(appType.applicationtypeid)}
                                    onAddSpecial={() => {
                                        // Pre-select the application type in the form
                                        setSpecialAppTypeFormData(prev => ({
                                            ...prev,
                                            applicationtypeid: appType.applicationtypeid
                                        }));
                                        handleOpenSpecialAppTypeModal();
                                    }}
                                    onEditSpecial={(specialType) => handleOpenSpecialAppTypeModal(specialType)}
                                    onDeleteSpecial={(specialTypeId) => handleDeleteSpecialAppType(specialTypeId)}
                                />
                            ))
                        )}
                    </Table.Body>
                </Table>
            </div>

            {/* Special Application Types Tab Content */}
            {/* Removed */}

            {/* Application Type Modal */}
            <Modal
                isOpen={isAppTypeModalOpen}
                onClose={handleCloseAppTypeModal}
            >
                <Modal.Header>
                    <Heading level="h3">
                        {selectedAppType ? "Chỉnh sửa hồ sơ" : "Thêm hồ sơ mới"}
                    </Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <div className="mb-4">
                        <Text className="text-ui-fg-subtle">
                            {selectedAppType
                                ? "Chỉnh sửa thông tin hồ sơ"
                                : "Điền thông tin để thêm hồ sơ mới"}
                        </Text>
                    </div>

                    <form onSubmit={handleSubmitAppTypeForm}>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <Label htmlFor="typename">Tên hồ sơ</Label>
                                <Input
                                    id="typename"
                                    required
                                    value={appTypeFormData.typename}
                                    onChange={(e) => handleAppTypeFormChange("typename", e.target.value)}
                                    placeholder="Nhập tên hồ sơ"
                                />
                            </div>

                            {/* Hidden field for description to maintain data structure */}
                            <input
                                type="hidden"
                                id="description"
                                value={appTypeFormData.description}
                                onChange={(e) => handleAppTypeFormChange("description", e.target.value)}
                            />

                            <div>
                                <Label htmlFor="processingtimelimit">Thời hạn xử lý (ngày)</Label>
                                <Input
                                    id="processingtimelimit"
                                    type="number"
                                    min={1}
                                    max={365}
                                    required
                                    value={appTypeFormData.processingtimelimit.toString()}
                                    onChange={(e) => handleAppTypeFormChange("processingtimelimit", parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={handleCloseAppTypeModal}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                            >
                                {selectedAppType ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Special Application Type Modal */}
            <Modal
                isOpen={isSpecialAppTypeModalOpen}
                onClose={handleCloseSpecialAppTypeModal}
            >
                <Modal.Header>
                    <Heading level="h3">
                        {selectedSpecialAppType ? "Chỉnh sửa hồ sơ đặc biệt" : "Thêm hồ sơ đặc biệt mới"}
                    </Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <div className="mb-4">
                        <Text className="text-ui-fg-subtle">
                            {selectedSpecialAppType
                                ? "Chỉnh sửa thông tin hồ sơ đặc biệt"
                                : "Điền thông tin để thêm hồ sơ đặc biệt mới"}
                        </Text>
                    </div>

                    <form onSubmit={handleSubmitSpecialAppTypeForm}>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <Label htmlFor="applicationtypeid">Thuộc hồ sơ</Label>
                                <Select
                                    onValueChange={(value) => handleSpecialAppTypeFormChange("applicationtypeid", parseInt(value))}
                                    value={safeToString(specialAppTypeFormData.applicationtypeid)}
                                    required
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder="Chọn hồ sơ" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {applicationTypes.map((appType) => (
                                            <Select.Item
                                                key={appType.applicationtypeid}
                                                value={appType.applicationtypeid.toString()}
                                            >
                                                {appType.typename}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </div>

                            {/* Hidden fields for typename and description to maintain data structure */}
                            <input
                                type="hidden"
                                id="specialtypename"
                                value={specialAppTypeFormData.typename}
                                onChange={(e) => handleSpecialAppTypeFormChange("typename", e.target.value)}
                            />

                            <input
                                type="hidden"
                                id="specialdescription"
                                value={specialAppTypeFormData.description}
                                onChange={(e) => handleSpecialAppTypeFormChange("description", e.target.value)}
                            />

                            <div>
                                <Label htmlFor="processingtimelimit">Thời hạn xử lý (ngày)</Label>
                                <Input
                                    id="processingtimelimit"
                                    type="number"
                                    min={1}
                                    max={365}
                                    required
                                    value={specialAppTypeFormData.processingtimelimit.toString()}
                                    onChange={(e) => handleSpecialAppTypeFormChange("processingtimelimit", parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={handleCloseSpecialAppTypeModal}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                            >
                                {selectedSpecialAppType ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Delete Application Type Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <Modal.Header>
                    <Heading level="h3">Xác nhận xóa</Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 bg-red-50 p-2 rounded-full">
                                <ExclamationCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <Text className="text-gray-700">
                                Bạn có chắc chắn muốn xóa "<strong>{selectedAppType?.typename}</strong>"?
                            </Text>
                        </div>
                        <Text className="text-gray-500 text-sm">
                            Lưu ý: Việc xóa sẽ xóa tất cả các hồ sơ đặc biệt thuộc loại này.
                            Các hồ sơ đã tồn tại thuộc loại này sẽ không bị xóa, nhưng có thể gây ra lỗi khi truy cập.
                        </Text>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDeleteAppType}
                        >
                            Xóa
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Delete Special Application Type Confirmation Modal */}
            <Modal
                isOpen={isSpecialTypeDeleteModalOpen}
                onClose={() => setIsSpecialTypeDeleteModalOpen(false)}
            >
                <Modal.Header>
                    <Heading level="h3">Xác nhận xóa hồ sơ đặc biệt</Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 bg-red-50 p-2 rounded-full">
                                <ExclamationCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <Text className="text-gray-700">
                                Bạn có chắc chắn muốn xóa hồ sơ đặc biệt "<strong>{selectedSpecialAppType?.typename}</strong>"?
                            </Text>
                        </div>
                        <Text className="text-gray-500 text-sm">
                            Lưu ý: Các hồ sơ đã tồn tại thuộc loại đặc biệt này sẽ không bị xóa,
                            nhưng có thể gây ra lỗi khi truy cập.
                        </Text>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsSpecialTypeDeleteModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDeleteSpecialAppType}
                        >
                            Xóa
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
} 