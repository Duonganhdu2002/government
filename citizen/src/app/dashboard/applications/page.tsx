"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Heading,
  Text,
  Button,
  Tabs,
  Badge,
  Input,
  Textarea,
  Select,
  Container,
  IconButton,
  FocusModal
} from '@medusajs/ui';
import { ChevronRight, Check, Calendar, MagnifyingGlass, Plus, ChevronLeft, Minus } from '@medusajs/icons';

// Interface for ApplicationType
interface ApplicationType {
  applicationtypeid: number;
  typename: string;
  description: string;
  processingtimelimit: number;
  category?: string; // Optional category field
  processingTimeRange?: {
    min: number;
    max: number;
  };
}

// Interface for SpecialApplicationType
interface SpecialApplicationType {
  specialapplicationtypeid: number;
  applicationtypeid: number;
  typename: string;
  processingtimelimit: number;
  applicationtypename?: string;
}

// Application categories
const APPLICATION_CATEGORIES: Record<string, string> = {
  'PERSONAL': 'Hồ sơ cá nhân',
  'LEGAL': 'Pháp lý & Tư pháp',
  'PROPERTY': 'Nhà đất & Tài sản',
  'BUSINESS': 'Doanh nghiệp & Kinh doanh',
  'SOCIAL': 'Xã hội & Cộng đồng',
  'OTHER': 'Loại hồ sơ khác'
};

// Định nghĩa hàm assignCategoryToType ở cấp cao nhất để tránh lỗi
// "Cannot access 'assignCategoryToType' before initialization"
const assignCategoryToType = (type: ApplicationType): string => {
  if (type.category) return type.category;

  const typeName = type.typename.toLowerCase();
  
  if (typeName.includes('khai sinh') || typeName.includes('kết hôn') || typeName.includes('căn cước') || typeName.includes('hộ khẩu') || typeName.includes('thường trú')) {
    return 'PERSONAL';
  }
  
  if (typeName.includes('giấy phép') || typeName.includes('xây dựng') || typeName.includes('nhà đất') || typeName.includes('tài sản')) {
    return 'PROPERTY';
  }
  
  if (typeName.includes('doanh nghiệp') || typeName.includes('kinh doanh') || typeName.includes('thuế')) {
    return 'BUSINESS';
  }
  
  if (typeName.includes('pháp lý') || typeName.includes('tư pháp') || typeName.includes('luật')) {
    return 'LEGAL';
  }
  
  if (typeName.includes('xã hội') || typeName.includes('cộng đồng') || typeName.includes('sự kiện')) {
    return 'SOCIAL';
  }
  
  return 'OTHER';
};

// Application submission form
const ApplicationForm = ({ 
  selectedType, 
  selectedSpecialType,
  onSubmit, 
  isSubmitting 
}: { 
  selectedType: ApplicationType | null;
  selectedSpecialType: SpecialApplicationType | null;
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttachments, setHasAttachments] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Reset form when selected type changes
  useEffect(() => {
    setTitle('');
    setDescription('');
    setHasAttachments(false);
    setFormError('');
  }, [selectedType, selectedSpecialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề hồ sơ');
      return;
    }

    // Submit the form
    onSubmit({
      citizenid: user?.id,
      applicationtypeid: selectedType?.applicationtypeid,
      specialapplicationtypeid: selectedSpecialType?.specialapplicationtypeid || null,
      title,
      description,
      submissiondate: new Date().toISOString(),
      status: 'Submitted',
      hasmedia: hasAttachments
    });
  };

  if (!selectedType) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Heading level="h2">{selectedType.typename}</Heading>
          <Badge className="bg-gray-100 text-gray-700">
            {selectedType.processingtimelimit} ngày
          </Badge>
        </div>
        <Text className="text-ui-fg-subtle">{selectedType.description}</Text>
        
        {selectedSpecialType && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex justify-between">
              <Heading level="h3" className="text-sm font-medium text-blue-800">
                Loại hồ sơ đặc biệt: {selectedSpecialType.typename}
              </Heading>
              <Badge className="bg-blue-100 text-blue-800">
                {selectedSpecialType.processingtimelimit} ngày
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-ui-fg-subtle mb-1">
            Tiêu đề hồ sơ <span className="text-red-500">*</span>
          </label>
          <Input 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề hồ sơ"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-ui-fg-subtle mb-1">
            Mô tả chi tiết
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết về hồ sơ của bạn (không bắt buộc)"
            rows={4}
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="hasAttachments"
            checked={hasAttachments}
            onChange={(e) => setHasAttachments(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="hasAttachments" className="text-ui-fg-subtle">
            Tôi sẽ bổ sung tài liệu đính kèm sau khi nộp hồ sơ
          </label>
        </div>

        {formError && (
          <div className="text-red-500 text-sm mt-2">{formError}</div>
        )}

        <div className="flex justify-end space-x-3 mt-8">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setTitle('');
              setDescription('');
              setHasAttachments(false);
            }}
          >
            Làm mới
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp hồ sơ'}
            {!isSubmitting && <ChevronRight />}
          </Button>
        </div>
      </div>
    </form>
  );
};

// Application type card
const ApplicationTypeCard = ({ 
  type, 
  onSelect, 
  isSelected
}: { 
  type: ApplicationType;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  return (
    <div 
      className="p-4 cursor-pointer transition-all duration-200 border rounded-lg border-ui-border-base hover:border-gray-300 hover:shadow-sm hover:bg-gray-50"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <Heading level="h3" className="text-base font-medium">
          {type.typename}
        </Heading>
      </div>
      <Text className="text-ui-fg-subtle text-sm line-clamp-2">
        {type.description}
      </Text>
    </div>
  );
};

// Category Accordion Component
const CategoryAccordion = ({
  title,
  children,
  isOpen,
  onToggle,
  count
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <Heading level="h3" className="text-lg font-medium">{title}</Heading>
          {count !== undefined && (
            <Badge className="ml-2 bg-blue-50 text-blue-600">
              {count}
            </Badge>
          )}
        </div>
        <span>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </div>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-100">
      <Button 
        variant="secondary" 
        size="small" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, idx) => {
          const pageNumber = idx + 1;
          const isActive = pageNumber === currentPage;
          
          return (
            <button
              key={idx}
              onClick={() => onPageChange(pageNumber)}
              className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${
                isActive 
                  ? 'bg-blue-500 text-white font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      <Button 
        variant="secondary" 
        size="small" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Special Application Type Card
const SpecialApplicationTypeCard = ({
  specialType,
  onSelect,
}: {
  specialType: SpecialApplicationType;
  onSelect: (specialType: SpecialApplicationType) => void;
}) => {
  return (
    <div 
      className="p-4 border rounded-lg cursor-pointer hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 transition-all duration-200"
      onClick={() => onSelect(specialType)}
    >
      <div className="flex justify-between items-start mb-2">
        <Heading level="h3" className="text-base font-medium flex-1 pr-2">
          {specialType.typename}
        </Heading>
        <Badge className="bg-gray-100 text-gray-700 text-xs whitespace-nowrap">
          {specialType.processingtimelimit} ngày
        </Badge>
      </div>
      <Text className="text-ui-fg-subtle text-sm">
        {specialType.applicationtypename}
      </Text>
    </div>
  );
};

// Special Types Modal
const SpecialTypesModal = ({
  isOpen,
  onClose,
  selectedType,
  specialTypes,
  onSelectSpecialType,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedType: ApplicationType | null;
  specialTypes: SpecialApplicationType[];
  onSelectSpecialType: (specialType: SpecialApplicationType) => void;
  loading: boolean;
}) => {
  if (!isOpen || !selectedType) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <div>
              <Heading level="h2" className="text-xl mb-1">
                {selectedType.typename}
              </Heading>
              <Text className="text-ui-fg-subtle">
                Chọn loại hồ sơ đặc biệt hoặc sử dụng hồ sơ chung
              </Text>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-border-base mx-auto"></div>
              <Text className="ml-3">Đang tải loại hồ sơ đặc biệt...</Text>
            </div>
          ) : (
            <>
              {specialTypes.length > 0 ? (
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specialTypes.map((specialType) => (
                      <SpecialApplicationTypeCard
                        key={specialType.specialapplicationtypeid}
                        specialType={specialType}
                        onSelect={onSelectSpecialType}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-ui-fg-subtle">
                  Không có loại hồ sơ đặc biệt cho loại hồ sơ này
                </div>
              )}
            </>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<ApplicationType | null>(null);
  const [specialTypes, setSpecialTypes] = useState<SpecialApplicationType[]>([]);
  const [loadingSpecialTypes, setLoadingSpecialTypes] = useState(false);
  const [selectedSpecialType, setSelectedSpecialType] = useState<SpecialApplicationType | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSpecialTypesModal, setShowSpecialTypesModal] = useState(false);
  
  // Pagination state for each category
  const [paginationState, setPaginationState] = useState<{[key: string]: number}>({});
  const ITEMS_PER_PAGE = 4;
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  // Track which category accordion is open
  const [openCategory, setOpenCategory] = useState<string | null>('PERSONAL');

  useEffect(() => {
    const fetchApplicationTypes = async () => {
      try {
        setLoading(true);
        console.log('Gọi API lấy danh sách loại hồ sơ');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application-types`);
        
        if (!response.ok) {
          throw new Error(`Không thể tải loại hồ sơ: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Đã tải ${data.length} loại hồ sơ`);
        
        // Lấy thông tin processingTimeRange cho từng loại hồ sơ
        const typesWithTimeRanges = await Promise.all(
          data.map(async (type: ApplicationType) => {
            // Gọi API lấy các loại hồ sơ đặc biệt cho từng loại hồ sơ
            try {
              const specialResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/special-application-types/by-application-type/${type.applicationtypeid}`
              );
              
              if (!specialResponse.ok && specialResponse.status !== 404) {
                throw new Error(`Failed to fetch special types: ${specialResponse.status}`);
              }
              
              if (specialResponse.status === 404 || !specialResponse.ok) {
                // Không có loại hồ sơ đặc biệt
                return {
                  ...type,
                  processingTimeRange: { 
                    min: type.processingtimelimit, 
                    max: type.processingtimelimit 
                  }
                };
              }
              
              const specialTypes = await specialResponse.json();
              
              if (!specialTypes || specialTypes.length === 0) {
                return {
                  ...type,
                  processingTimeRange: { 
                    min: type.processingtimelimit, 
                    max: type.processingtimelimit 
                  }
                };
              }
              
              // Tính toán thời gian xử lý nhỏ nhất và lớn nhất
              const processingTimes = specialTypes.map((st: any) => st.processingtimelimit);
              const min = Math.min(...processingTimes, type.processingtimelimit);
              const max = Math.max(...processingTimes, type.processingtimelimit);
              
              return {
                ...type,
                processingTimeRange: { min, max }
              };
            } catch (error) {
              console.error(`Error fetching special types for ${type.typename}:`, error);
              return {
                ...type,
                processingTimeRange: { 
                  min: type.processingtimelimit, 
                  max: type.processingtimelimit 
                }
              };
            }
          })
        );
        
        setApplicationTypes(typesWithTimeRanges);
      } catch (err) {
        console.error('Lỗi khi tải loại hồ sơ:', err);
        setError('Không thể tải danh sách loại hồ sơ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationTypes();
    
    // Khởi tạo phân trang cho mỗi danh mục
    const initPagination = Object.keys(APPLICATION_CATEGORIES).reduce((acc, category) => {
      acc[category] = 1;
      return acc;
    }, {} as {[key: string]: number});
    initPagination['ALL'] = 1;
    
    setPaginationState(initPagination);
  }, []);

  // Fetch special application types for a selected application type
  const fetchSpecialApplicationTypes = async (applicationTypeId: number) => {
    try {
      setLoadingSpecialTypes(true);
      console.log('Fetching special types for:', applicationTypeId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/special-application-types/by-application-type/${applicationTypeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No special types found is normal
          console.log('No special application types found for this category');
          setSpecialTypes([]);
          return [];
        }
        throw new Error(`Failed to fetch special application types: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Special application types:', data);
      setSpecialTypes(data);
      return data;
    } catch (err) {
      console.error('Error fetching special application types:', err);
      setSpecialTypes([]);
      return [];
    } finally {
      setLoadingSpecialTypes(false);
    }
  };

  // Phân loại dữ liệu theo category - hàm này dùng trong trường hợp backend
  // không trả về category, hoặc cần phân loại lại theo logic frontend
  const categorizedApplicationTypes = useMemo(() => {
    // Normalize search query to handle Vietnamese accents
    const normalizedQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Lọc dữ liệu theo từ khóa tìm kiếm
    const filtered = applicationTypes.filter((type) => {
      const normalizedTypeName = type.typename?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
      const normalizedDescription = type.description?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
      
      return normalizedTypeName.includes(normalizedQuery) || 
             normalizedDescription.includes(normalizedQuery) ||
             // Also include original search for exact matches
             (type.typename?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
             (type.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    });
    
    // Nhóm theo danh mục
    const grouped = filtered.reduce((acc, type) => {
      // Sử dụng category đã có hoặc phân loại nếu không có
      const category = type.category || assignCategoryToType(type);
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(type);
      return acc;
    }, {} as {[key: string]: ApplicationType[]});
    
    return grouped;
  }, [applicationTypes, searchQuery]);

  const handleSelectType = async (type: ApplicationType) => {
    // If the same type is clicked again, deselect it
    if (selectedType && selectedType.applicationtypeid === type.applicationtypeid) {
      setSelectedType(null);
      setSelectedSpecialType(null);
      return;
    }
    
    // Set the newly selected type (will unselect previous one)
    setSelectedType(type);
    setSelectedSpecialType(null);
    
    // Fetch special application types for this application type
    const specialTypes = await fetchSpecialApplicationTypes(type.applicationtypeid);
    
    if (specialTypes.length === 0) {
      // If no special types, go directly to the submission form
      setActiveTab("submit");
    } else {
      // Show modal with special application types
      setShowSpecialTypesModal(true);
    }
  };

  const handleSelectSpecialType = (specialType: SpecialApplicationType | null) => {
    setSelectedSpecialType(specialType);
    setShowSpecialTypesModal(false);
    setActiveTab("submit");
  };

  const handleCloseSpecialTypesModal = () => {
    setShowSpecialTypesModal(false);
    setSelectedSpecialType(null);
  };

  const handleSubmitApplication = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      // Show success dialog
      setShowSuccess(true);
      
      // Reset form
      setSelectedType(null);
      setSelectedSpecialType(null);
      setActiveTab("browse");
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Không thể nộp hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset pagination for all categories when searching
    setPaginationState({});
  };

  const handlePageChange = (category: string, page: number) => {
    setPaginationState(prev => ({
      ...prev,
      [category]: page
    }));
  };

  // Get all application types to show when "ALL" is selected
  const allFilteredApplicationTypes = useMemo(() => {
    return Object.values(categorizedApplicationTypes).flat();
  }, [categorizedApplicationTypes]);

  // Handle pagination for a specific category
  const getPaginatedItems = (items: ApplicationType[], category: string) => {
    const currentPage = paginationState[category] || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: items.slice(startIndex, endIndex),
      totalPages: Math.ceil(items.length / ITEMS_PER_PAGE),
      currentPage
    };
  };

  // Format date string for display
  const formatDateString = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Heading level="h1" className="text-ui-fg-base mb-2">Nộp hồ sơ</Heading>
        <Text className="text-ui-fg-subtle">
          Chọn loại hồ sơ bạn muốn nộp và điền thông tin cần thiết
        </Text>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <Tabs.List>
          <Tabs.Trigger value="browse" className="flex items-center gap-1">
            <MagnifyingGlass className="w-4 h-4" />
            Danh sách hồ sơ
          </Tabs.Trigger>
          {selectedType && (
            <Tabs.Trigger value="submit" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Nộp hồ sơ
            </Tabs.Trigger>
          )}
        </Tabs.List>
      </Tabs>

      {activeTab === "browse" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <Input
              placeholder="Tìm kiếm loại hồ sơ..."
              value={searchQuery}
              onChange={handleSearch}
              className="max-w-md flex-grow"
            />
            <div className="min-w-[200px]">
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  // Reset pagination when category changes
                  setPaginationState({});
                  // If selecting a specific category, open it
                  if (value !== 'ALL') {
                    setOpenCategory(value);
                  } else {
                    // If "All" is selected, open the first non-empty category
                    const firstCategory = Object.entries(categorizedApplicationTypes)
                      .find(([_, types]) => types.length > 0)?.[0] || null;
                    setOpenCategory(firstCategory);
                  }
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Chọn loại hồ sơ" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="ALL">Tất cả loại hồ sơ</Select.Item>
                  {Object.entries(APPLICATION_CATEGORIES).map(([key, value]) => (
                    <Select.Item key={key} value={key}>{value}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-border-base mx-auto"></div>
              <Text className="mt-4">Đang tải danh sách hồ sơ...</Text>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-ui-fg-subtle">
              <div className="text-red-500 mb-2">{error}</div>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show message when no search results found */}
              {searchQuery && Object.values(categorizedApplicationTypes).flat().length === 0 && (
                <div className="text-center py-8">
                  <Text className="text-xl font-medium mb-2">Không tìm thấy kết quả</Text>
                  <Text className="text-ui-fg-subtle">
                    Không tìm thấy hồ sơ nào phù hợp với từ khóa "{searchQuery}"
                  </Text>
                  <Button variant="secondary" className="mt-4" onClick={() => setSearchQuery('')}>
                    Xóa tìm kiếm
                  </Button>
                </div>
              )}
            
              {selectedCategory === 'ALL' ? (
                // Show all application types sorted by category
                Object.entries(APPLICATION_CATEGORIES).map(([categoryKey, categoryName]) => {
                  const types = categorizedApplicationTypes[categoryKey] || [];
                  
                  if (types.length === 0) return null;
                  
                  const { items, totalPages, currentPage } = getPaginatedItems(types, categoryKey);
                  
                  return (
                    <CategoryAccordion 
                      key={categoryKey} 
                      title={categoryName}
                      isOpen={openCategory === categoryKey}
                      onToggle={() => {
                        if (openCategory === categoryKey) {
                          // If clicking on already open category, keep it open
                          setOpenCategory(categoryKey);
                        } else {
                          // If clicking on closed category, open it and close others
                          setOpenCategory(categoryKey);
                        }
                      }}
                      count={types.length}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {items.map((type: ApplicationType) => (
                          <ApplicationTypeCard
                            key={type.applicationtypeid}
                            type={type}
                            onSelect={() => handleSelectType(type)}
                            isSelected={selectedType?.applicationtypeid === type.applicationtypeid}
                          />
                        ))}
                      </div>
                      
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => handlePageChange(categoryKey, page)}
                      />
                    </CategoryAccordion>
                  );
                })
              ) : (
                // Show only the selected category
                <div>
                  <div className="mb-4">
                    <Heading level="h2" className="text-xl">
                      {APPLICATION_CATEGORIES[selectedCategory]} 
                      <Badge className="ml-2 bg-blue-50 text-blue-600">
                        {(categorizedApplicationTypes[selectedCategory] || []).length}
                      </Badge>
                    </Heading>
                  </div>
                  
                  {categorizedApplicationTypes[selectedCategory]?.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {getPaginatedItems(
                          categorizedApplicationTypes[selectedCategory] || [], 
                          selectedCategory
                        ).items.map((type: ApplicationType) => (
                          <ApplicationTypeCard
                            key={type.applicationtypeid}
                            type={type}
                            onSelect={() => handleSelectType(type)}
                            isSelected={selectedType?.applicationtypeid === type.applicationtypeid}
                          />
                        ))}
                      </div>
                      
                      <Pagination
                        currentPage={paginationState[selectedCategory] || 1}
                        totalPages={Math.ceil((categorizedApplicationTypes[selectedCategory] || []).length / ITEMS_PER_PAGE)}
                        onPageChange={(page) => handlePageChange(selectedCategory, page)}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      {searchQuery ? (
                        <>
                          <Text className="text-gray-700 font-medium mb-2">Không có kết quả tìm kiếm</Text>
                          <Text className="text-gray-500">
                            Không tìm thấy loại hồ sơ nào phù hợp với từ khóa "{searchQuery}" trong danh mục {APPLICATION_CATEGORIES[selectedCategory]}
                          </Text>
                          <Button variant="secondary" className="mt-4" onClick={() => setSearchQuery('')}>
                            Xóa tìm kiếm
                          </Button>
                        </>
                      ) : (
                        <Text className="text-gray-500">Không có loại hồ sơ nào trong danh mục này</Text>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "submit" && (
        <ApplicationForm
          selectedType={selectedType}
          selectedSpecialType={selectedSpecialType}
          onSubmit={handleSubmitApplication}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Success Dialog using modal UI instead */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="text-green-500 w-5 h-5" />
                  <Heading level="h3">Nộp hồ sơ thành công</Heading>
                </div>
                <Text className="text-ui-fg-subtle">
                  Hồ sơ của bạn đã được nộp thành công và đang chờ xử lý. Bạn có thể theo dõi trạng thái hồ sơ trong mục Lịch sử.
                </Text>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowSuccess(false)}>
                  Quay lại
                </Button>
                <Button onClick={() => router.push('/dashboard/history')}>
                  Xem lịch sử
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Types Modal */}
      {showSpecialTypesModal && (
        <SpecialTypesModal
          isOpen={showSpecialTypesModal}
          onClose={handleCloseSpecialTypesModal}
          selectedType={selectedType}
          specialTypes={specialTypes}
          onSelectSpecialType={handleSelectSpecialType}
          loading={loadingSpecialTypes}
        />
      )}
    </div>
  );
} 