"use client";
import React, { useState, useEffect } from 'react';
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
} from '@medusajs/ui';
import { ChevronRight, Check, Calendar, MagnifyingGlass, Plus } from '@medusajs/icons';

// Interface for ApplicationType
interface ApplicationType {
  applicationtypeid: number;
  typename: string;
  description: string;
  processingtimelimit: number;
}

// Application submission form
const ApplicationForm = ({ 
  selectedType, 
  onSubmit, 
  isSubmitting 
}: { 
  selectedType: ApplicationType | null;
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
  }, [selectedType]);

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
      className={`p-4 cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected 
          ? 'border-blue-500 shadow-md' 
          : 'border-ui-border-base hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <Heading level="h3" className="text-base font-medium">
          {type.typename}
        </Heading>
        <Badge className="bg-gray-100 text-gray-700 text-xs">
          {type.processingtimelimit} ngày
        </Badge>
      </div>
      <Text className="text-ui-fg-subtle text-sm line-clamp-2">
        {type.description}
      </Text>
      <div className="mt-4 flex justify-end">
        <Button 
          variant={isSelected ? "primary" : "secondary"} 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? (
            <>
              <Check className="mr-1" />
              Đã chọn
            </>
          ) : 'Chọn'}
        </Button>
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
  const [activeTab, setActiveTab] = useState("browse");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchApplicationTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/application-types`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch application types');
        }
        
        const data = await response.json();
        setApplicationTypes(data);
      } catch (err) {
        console.error('Error fetching application types:', err);
        setError('Không thể tải danh sách loại hồ sơ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationTypes();
  }, []);

  const handleSubmitApplication = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications`, {
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
  };

  const handleSelectType = (type: ApplicationType) => {
    setSelectedType(type);
    setActiveTab("submit");
  };

  const filteredTypes = applicationTypes.filter((type) => 
    type.typename.toLowerCase().includes(searchQuery.toLowerCase()) || 
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateString = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Sample application types data for testing (if API is not available)
  const sampleTypes = [
    {
      applicationtypeid: 1,
      typename: "Đăng ký khai sinh",
      description: "Đăng ký khai sinh cho trẻ em mới sinh tại Việt Nam hoặc trẻ em có quốc tịch Việt Nam sinh ra ở nước ngoài.",
      processingtimelimit: 5
    },
    {
      applicationtypeid: 2,
      typename: "Cấp mới căn cước công dân",
      description: "Cấp mới thẻ căn cước công dân cho công dân từ đủ 14 tuổi trở lên.",
      processingtimelimit: 7
    },
    {
      applicationtypeid: 3,
      typename: "Đăng ký kết hôn",
      description: "Đăng ký kết hôn giữa công dân Việt Nam với nhau hoặc với người nước ngoài.",
      processingtimelimit: 10
    },
    {
      applicationtypeid: 4,
      typename: "Xin giấy phép xây dựng",
      description: "Cấp giấy phép xây dựng mới, sửa chữa, cải tạo công trình dân dụng và công nghiệp.",
      processingtimelimit: 15
    },
    {
      applicationtypeid: 5,
      typename: "Đăng ký thường trú",
      description: "Đăng ký thường trú, chuyển đổi nơi đăng ký thường trú cho công dân.",
      processingtimelimit: 7
    }
  ];
  
  // Use sample data if API data is not available
  useEffect(() => {
    if (!loading && applicationTypes.length === 0 && !error) {
      setApplicationTypes(sampleTypes);
    }
  }, [loading, applicationTypes]);

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
          <div className="flex flex-col mb-6">
            <Input
              placeholder="Tìm kiếm loại hồ sơ..."
              value={searchQuery}
              onChange={handleSearch}
              className="max-w-md"
            />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <ApplicationTypeCard
                    key={type.applicationtypeid}
                    type={type}
                    onSelect={() => handleSelectType(type)}
                    isSelected={selectedType?.applicationtypeid === type.applicationtypeid}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-ui-fg-subtle">
                  Không tìm thấy loại hồ sơ phù hợp với từ khóa "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "submit" && (
        <ApplicationForm
          selectedType={selectedType}
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
    </div>
  );
} 