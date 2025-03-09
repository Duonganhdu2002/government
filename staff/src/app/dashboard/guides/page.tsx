"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heading, 
  Text, 
  Button, 
  Input,
  Badge,
  Tabs
} from '@medusajs/ui';
import { 
  User, 
  DocumentText, 
  MagnifyingGlass, 
  ChevronRight, 
  MapPin, 
  Check, 
  XMark,
  Clock,
  Calendar,
  ChevronDown,
  BellAlert
} from '@medusajs/icons';

// Guide category interface
interface GuideCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Guide interface
interface Guide {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  featured?: boolean;
  path: string;
}

// Guide categories data
const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'identity',
    title: 'Giấy tờ cá nhân',
    description: 'Hướng dẫn chuẩn bị và quản lý giấy tờ cá nhân',
    icon: User,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'process',
    title: 'Quy trình hành chính',
    description: 'Các quy trình và thủ tục hành chính công',
    icon: DocumentText,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'faq',
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp thắc mắc phổ biến về dịch vụ công',
    icon: Check,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'locations',
    title: 'Địa điểm dịch vụ',
    description: 'Thông tin về các địa điểm cung cấp dịch vụ công',
    icon: MapPin,
    color: 'bg-red-100 text-red-600'
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
    color: 'bg-blue-100 text-blue-600',
    featured: true,
    path: '/guides/identity-documents'
  },
  {
    id: 'identity-2',
    categoryId: 'identity',
    title: 'Giấy tờ tùy thân',
    description: 'Hướng dẫn làm CCCD, CMND và hộ chiếu',
    icon: User,
    color: 'bg-blue-100 text-blue-600',
    path: '/guides/identity-cards'
  },
  {
    id: 'identity-3',
    categoryId: 'identity',
    title: 'Giấy tờ hộ khẩu',
    description: 'Thông tin về sổ hộ khẩu và đăng ký thường trú',
    icon: DocumentText,
    color: 'bg-blue-100 text-blue-600',
    path: '/guides/household-registration'
  },
  
  // Process guides
  {
    id: 'process-1',
    categoryId: 'process',
    title: 'Quy trình xử lý hồ sơ',
    description: 'Các bước xử lý hồ sơ hành chính công và thời gian cần thiết',
    icon: Clock,
    color: 'bg-green-100 text-green-600',
    featured: true,
    path: '/guides/application-process'
  },
  {
    id: 'process-2',
    categoryId: 'process',
    title: 'Nộp và nhận kết quả',
    description: 'Hướng dẫn nộp hồ sơ và nhận kết quả dịch vụ công',
    icon: DocumentText,
    color: 'bg-green-100 text-green-600',
    path: '/guides/submit-receive'
  },
  {
    id: 'process-3',
    categoryId: 'process',
    title: 'Thủ tục trực tuyến',
    description: 'Hướng dẫn sử dụng dịch vụ công trực tuyến',
    icon: DocumentText,
    color: 'bg-green-100 text-green-600',
    path: '/guides/online-services'
  },
  
  // FAQ guides
  {
    id: 'faq-1',
    categoryId: 'faq',
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp các thắc mắc phổ biến về dịch vụ công',
    icon: Check,
    color: 'bg-yellow-100 text-yellow-600',
    featured: true,
    path: '/guides/faq'
  },
  {
    id: 'faq-2',
    categoryId: 'faq',
    title: 'Phí và lệ phí',
    description: 'Thông tin về phí và lệ phí cho các dịch vụ công',
    icon: Check,
    color: 'bg-yellow-100 text-yellow-600',
    path: '/guides/fees'
  },
  {
    id: 'faq-3',
    categoryId: 'faq',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Giải đáp các vấn đề kỹ thuật khi sử dụng dịch vụ công trực tuyến',
    icon: Check,
    color: 'bg-yellow-100 text-yellow-600',
    path: '/guides/technical-support'
  },
  
  // Location guides
  {
    id: 'locations-1',
    categoryId: 'locations',
    title: 'Địa điểm dịch vụ công',
    description: 'Danh sách các địa điểm cung cấp dịch vụ công trên toàn quốc',
    icon: MapPin,
    color: 'bg-red-100 text-red-600',
    featured: true,
    path: '/guides/service-locations'
  },
  {
    id: 'locations-2',
    categoryId: 'locations',
    title: 'Bản đồ dịch vụ công',
    description: 'Bản đồ các điểm giao dịch dịch vụ công',
    icon: MapPin,
    color: 'bg-red-100 text-red-600',
    path: '/guides/service-map'
  }
];

// GuideCard component
const GuideCard = ({ guide }: { guide: Guide }) => {
  return (
    <Link href={guide.path} className="block no-underline">
      <div className={`p-5 border rounded-lg hover:border-ui-border-base-hover hover:shadow-sm transition-all duration-200 h-full bg-ui-bg-base`}>
        <div className="flex items-start mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${guide.color}`}>
            <guide.icon className="w-5 h-5" />
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
          <Text size="small" className="text-ui-fg-interactive">Xem chi tiết</Text>
          <ChevronRight className="w-4 h-4 text-ui-fg-interactive ml-1" />
        </div>
      </div>
    </Link>
  );
};

// FeaturedGuideCard component for highlighted guides
const FeaturedGuideCard = ({ guide }: { guide: Guide }) => {
  return (
    <Link href={guide.path} className="block no-underline">
      <div className={`p-6 border rounded-lg hover:border-ui-border-base-hover hover:shadow-md transition-all duration-200 h-full bg-ui-bg-base`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${guide.color}`}>
          <guide.icon className="w-6 h-6" />
        </div>
        <Heading level="h3" className="text-lg mb-2">{guide.title}</Heading>
        <Text className="text-ui-fg-subtle mb-4">{guide.description}</Text>
        <Button variant="secondary" size="small">
          Xem hướng dẫn
          <ChevronRight className="ml-1" />
        </Button>
      </div>
    </Link>
  );
};

// CategorySection component
const CategorySection = ({ category, guides }: { category: GuideCategory, guides: Guide[] }) => {
  const categoryGuides = guides.filter(guide => guide.categoryId === category.id);
  
  return (
    <div className="mb-10">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${category.color}`}>
          <category.icon className="w-5 h-5" />
        </div>
        <div>
          <Heading level="h2" className="text-xl">{category.title}</Heading>
          <Text size="small" className="text-ui-fg-subtle">{category.description}</Text>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryGuides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
};

// Main Guides page component
export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter guides based on search query
  const filteredGuides = GUIDES.filter(guide => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query)
    );
  });
  
  // Get featured guides
  const featuredGuides = GUIDES.filter(guide => guide.featured);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Heading level="h1" className="text-3xl mb-2">Tài liệu hướng dẫn</Heading>
        <Text className="text-ui-fg-subtle">
          Tìm hiểu các thủ tục hành chính và cách chuẩn bị hồ sơ một cách hiệu quả
        </Text>
      </div>
      
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm tài liệu hướng dẫn..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <MagnifyingGlass className="text-ui-fg-subtle" />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
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
        <div className="mb-12">
          <Heading level="h2" className="text-2xl mb-6">Hướng dẫn nổi bật</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGuides.map(guide => (
              <FeaturedGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}
      
      {/* Search results */}
      {searchQuery.length > 0 && (
        <div className="mb-8">
          <Heading level="h2" className="text-xl mb-4">
            Kết quả tìm kiếm: {filteredGuides.length} hướng dẫn
          </Heading>
          
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-ui-bg-base border border-ui-border-base rounded-lg">
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
  );
} 