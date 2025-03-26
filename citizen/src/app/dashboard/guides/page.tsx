"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Heading, 
  Text, 
  Button, 
  Input,
  Tabs
} from '@medusajs/ui';
import { 
  User, 
  DocumentText, 
  MagnifyingGlass, 
  ChevronRight, 
  MapPin, 
  Check,
  Clock
} from '@medusajs/icons';

// Custom global styles for hiding scrollbars but allowing scrolling
const scrollbarHideStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Guide category interface
interface GuideCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Guide interface
interface Guide {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  featured?: boolean;
  path: string;
}

// Guide categories data
const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'identity',
    title: 'Giấy tờ cá nhân',
    description: 'Hướng dẫn chuẩn bị và quản lý giấy tờ cá nhân',
    icon: User
  },
  {
    id: 'process',
    title: 'Quy trình hành chính',
    description: 'Các quy trình và thủ tục hành chính công',
    icon: DocumentText
  },
  {
    id: 'faq',
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp thắc mắc phổ biến về dịch vụ công',
    icon: Check
  },
  {
    id: 'locations',
    title: 'Địa điểm dịch vụ',
    description: 'Thông tin về các địa điểm cung cấp dịch vụ công',
    icon: MapPin
  }
];

// Guides data
const GUIDES: Guide[] = [
  // Identity documents guides
  {
    id: 'identity-1',
    categoryId: 'identity',
    title: 'Chuẩn bị hồ sơ cá nhân',
    description: 'Hướng dẫn chuẩn bị đầy đủ giấy tờ cá nhân cho các dịch vụ hành chính công',
    icon: User,
    featured: true,
    path: '/guides/identity-documents'
  },
  {
    id: 'identity-2',
    categoryId: 'identity',
    title: 'Giấy tờ tùy thân',
    description: 'Hướng dẫn làm CCCD, CMND và hộ chiếu',
    icon: User,
    path: '/guides/identity-cards'
  },
  {
    id: 'identity-3',
    categoryId: 'identity',
    title: 'Giấy tờ hộ khẩu',
    description: 'Thông tin về sổ hộ khẩu và đăng ký thường trú',
    icon: DocumentText,
    path: '/guides/household-registration'
  },
  
  // Process guides
  {
    id: 'process-1',
    categoryId: 'process',
    title: 'Quy trình xử lý hồ sơ',
    description: 'Các bước xử lý hồ sơ hành chính công và thời gian cần thiết',
    icon: Clock,
    featured: true,
    path: '/guides/application-process'
  },
  {
    id: 'process-2',
    categoryId: 'process',
    title: 'Nộp và nhận kết quả',
    description: 'Hướng dẫn nộp hồ sơ và nhận kết quả dịch vụ công',
    icon: DocumentText,
    path: '/guides/submit-receive'
  },
  {
    id: 'process-3',
    categoryId: 'process',
    title: 'Thủ tục trực tuyến',
    description: 'Hướng dẫn sử dụng dịch vụ công trực tuyến',
    icon: DocumentText,
    path: '/guides/online-services'
  },
  
  // FAQ guides
  {
    id: 'faq-1',
    categoryId: 'faq',
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp các thắc mắc phổ biến về dịch vụ công',
    icon: Check,
    featured: true,
    path: '/guides/faq'
  },
  {
    id: 'faq-2',
    categoryId: 'faq',
    title: 'Phí và lệ phí',
    description: 'Thông tin về phí và lệ phí cho các dịch vụ công',
    icon: Check,
    path: '/guides/fees'
  },
  {
    id: 'faq-3',
    categoryId: 'faq',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Giải đáp các vấn đề kỹ thuật khi sử dụng dịch vụ công trực tuyến',
    icon: Check,
    path: '/guides/technical-support'
  },
  
  // Location guides
  {
    id: 'locations-1',
    categoryId: 'locations',
    title: 'Địa điểm dịch vụ công',
    description: 'Danh sách các địa điểm cung cấp dịch vụ công trên toàn quốc',
    icon: MapPin,
    featured: true,
    path: '/guides/service-locations'
  },
  {
    id: 'locations-2',
    categoryId: 'locations',
    title: 'Bản đồ dịch vụ công',
    description: 'Bản đồ các điểm giao dịch dịch vụ công',
    icon: MapPin,
    path: '/guides/service-map'
  }
];

// GuideCard component
const GuideCard = React.memo(({ guide }: { guide: Guide }) => {
  return (
    <Link href={guide.path} className="block no-underline">
      <div className="p-5 border rounded-lg hover:border-ui-border-base-hover hover:shadow-sm transition-all duration-200 h-full bg-ui-bg-base">
        <div className="flex items-start mb-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center mr-3 bg-ui-bg-subtle text-ui-fg-base">
            <guide.icon className="w-4 h-4" />
          </div>
          <div>
            <Text weight="plus" className="text-ui-fg-base mb-1">
              {guide.title}
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {guide.description}
            </Text>
          </div>
        </div>
        <div className="flex justify-end items-center mt-3">
          <Text size="small" className="text-ui-fg-subtle">Xem chi tiết</Text>
          <ChevronRight className="w-4 h-4 text-ui-fg-subtle ml-1" />
        </div>
      </div>
    </Link>
  );
});

GuideCard.displayName = 'GuideCard';

// FeaturedGuideCard component for highlighted guides
const FeaturedGuideCard = React.memo(({ guide }: { guide: Guide }) => {
  return (
    <Link href={guide.path} className="block no-underline">
      <div className="p-6 border rounded-lg hover:border-ui-border-base-hover hover:shadow-md transition-all duration-200 h-full bg-ui-bg-base">
        <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 bg-ui-bg-subtle text-ui-fg-base">
          <guide.icon className="w-5 h-5" />
        </div>
        <Heading level="h3" className="text-ui-fg-base mb-2">{guide.title}</Heading>
        <Text className="text-ui-fg-subtle mb-4">{guide.description}</Text>
        <Button variant="secondary" size="small">
          Xem hướng dẫn
          <ChevronRight className="ml-1" />
        </Button>
      </div>
    </Link>
  );
});

FeaturedGuideCard.displayName = 'FeaturedGuideCard';

// CategorySection component
const CategorySection = React.memo(({ category, guides }: { category: GuideCategory, guides: Guide[] }) => {
  const categoryGuides = useMemo(() => {
    return guides.filter(guide => guide.categoryId === category.id);
  }, [category.id, guides]);
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-md flex items-center justify-center mr-3 bg-ui-bg-subtle text-ui-fg-base">
          <category.icon className="w-4 h-4" />
        </div>
        <div>
          <Heading level="h2" className="text-ui-fg-base">{category.title}</Heading>
          <Text size="small" className="text-ui-fg-subtle">{category.description}</Text>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryGuides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

// Main Guides page component
export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter guides based on search query
  const filteredGuides = useMemo(() => {
    if (!searchQuery) return GUIDES;
    const query = searchQuery.toLowerCase();
    return GUIDES.filter(guide => (
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query)
    ));
  }, [searchQuery]);
  
  // Get featured guides
  const featuredGuides = useMemo(() => {
    return GUIDES.filter(guide => guide.featured);
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-ui-bg-base pt-20 overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <div className="mb-6">
          <Heading level="h1" className="text-ui-fg-base mb-2">Tài liệu hướng dẫn</Heading>
          <Text className="text-ui-fg-subtle">
            Tìm hiểu các thủ tục hành chính và cách chuẩn bị hồ sơ một cách hiệu quả
          </Text>
        </div>
        
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm tài liệu hướng dẫn..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <MagnifyingGlass className="w-4 h-4 text-ui-fg-subtle" />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="all">Tất cả hướng dẫn</Tabs.Trigger>
              {GUIDE_CATEGORIES.map(category => (
                <Tabs.Trigger key={category.id} value={category.id}>
                  {category.title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </div>
        
        {/* Featured guides */}
        {activeTab === 'all' && searchQuery.length === 0 && (
          <div className="mb-6">
            <Heading level="h2" className="text-ui-fg-base mb-4">Hướng dẫn nổi bật</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredGuides.map(guide => (
                <FeaturedGuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        )}
        
        {/* Search results */}
        {searchQuery.length > 0 && (
          <div className="mb-6">
            <Heading level="h2" className="text-ui-fg-base mb-4">
              Kết quả tìm kiếm: {filteredGuides.length} hướng dẫn
            </Heading>
            
            {filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map(guide => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-ui-bg-subtle border border-ui-border-base rounded-lg">
                <Text className="text-ui-fg-subtle">
                  Không tìm thấy hướng dẫn nào phù hợp với từ khóa "{searchQuery}"
                </Text>
                <Button 
                  variant="secondary" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Xóa tìm kiếm
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Guide categories */}
        {(activeTab === 'all' || searchQuery.length > 0) ? (
          // Show all categories when "all" tab is active or when searching
          searchQuery.length === 0 && GUIDE_CATEGORIES.map(category => (
            <CategorySection 
              key={category.id} 
              category={category} 
              guides={GUIDES} 
            />
          ))
        ) : (
          // Show only the selected category
          <CategorySection 
            category={GUIDE_CATEGORIES.find(c => c.id === activeTab)!} 
            guides={GUIDES} 
          />
        )}
      </div>
    </div>
  );
} 