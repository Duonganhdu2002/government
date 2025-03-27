"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import NewApplicationModal from '@/components/applications/NewApplicationModal';
import ApplicationDetailModal from '@/components/applications/ApplicationDetailModal';
import { fetchDashboardData } from '@/services/applicationService';

// Import Medusa UI components
import {
  Badge,
  Button,
  Text,
  Heading,
  Drawer
} from "@medusajs/ui";

// Icons
import {
  DocumentText,
  Check,
  XMark,
  Clock,
  Plus,
  User as UserIcon,
  ChevronRight,
} from '@medusajs/icons';

/**
 * Application status component
 */
const ApplicationStatus = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-ui-fg-base text-ui-bg-base';
      case 'rejected':
        return 'bg-ui-bg-base text-ui-fg-subtle border border-ui-border-base';
      case 'pending':
      case 'processing':
        return 'bg-ui-bg-subtle text-ui-fg-base border border-ui-border-base';
      default:
        return 'bg-ui-bg-subtle text-ui-fg-subtle';
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <XMark className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
  };

  return (
    <Badge className={`${getStatusClass()}`}>
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

/**
 * Statistics card component
 */
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: React.ComponentType<any>;
}) => (
  <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base hover:shadow-sm transition-shadow duration-200">
    <div className="p-5">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center text-ui-fg-base shadow-sm">
          <Icon className="w-4 h-4" />
        </div>
        <div className="ml-3">
          <Text size="small" className="text-ui-fg-subtle">{title}</Text>
          <Text size="xlarge" weight="plus" className="text-ui-fg-base">{value}</Text>
        </div>
      </div>
    </div>
    <div className="bg-ui-bg-subtle px-5 py-3 border-t border-ui-border-base">
      <Text size="small" className="text-ui-fg-subtle">
        {description}
      </Text>
    </div>
  </div>
);

/**
 * Recent application item component
 */
const RecentApplicationItem = ({ 
  application,
  onViewDetail
}: { 
  application: any;
  onViewDetail: (id: number) => void;
}) => (
  <div className="p-4 border-b border-ui-border-base hover:bg-ui-bg-subtle transition-colors duration-200">
    <div className="flex items-center justify-between">
      <div>
        <Text size="large" weight="plus" className="text-ui-fg-base">
          {application.title || application.applicationtypename || 'Application'}
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Ngày nộp: {new Date(application.submissiondate || Date.now()).toLocaleDateString('vi-VN')}
        </Text>
      </div>
      <ApplicationStatus status={application.status || 'pending'} />
    </div>
    <div className="mt-4 flex justify-between">
      <Text size="small" className="text-ui-fg-subtle">
        ID: {application.applicationid}
      </Text>
      <Button 
        variant="secondary" 
        size="small"
        onClick={() => onViewDetail(application.applicationid)}
        className="hover:shadow-sm transition-shadow duration-200"
      >
        Xem chi tiết
      </Button>
    </div>
  </div>
);

/**
 * Quick link component
 */
const QuickLink = ({ title, icon: Icon, href, description }: { 
  title: string; 
  icon: React.ComponentType<any>;
  href: string;
  description: string;
}) => (
  <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4 hover:shadow-sm transition-shadow duration-200">
    <Heading level="h3" className="text-lg mb-2">{title}</Heading>
    <Text size="small" className="text-ui-fg-subtle mb-4">
      {description}
    </Text>
    <Link href={href}>
      <Button variant="secondary" size="small" className="hover:shadow-sm transition-shadow duration-200">
        Nộp hồ sơ
        <ChevronRight className="ml-1" />
      </Button>
    </Link>
  </div>
);

/**
 * Dashboard page component
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<Array<{applicationid: number; [key: string]: any}>>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  
  // State for new application modal
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  
  // State for application detail modal
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  // Storage keys for caching
  const DASHBOARD_DATA_KEY = 'dashboard-data';
  const DASHBOARD_TIMESTAMP_KEY = 'dashboard-data-timestamp';
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Function to load dashboard data
  const loadDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check if we have cached data and it's not a forced refresh
      if (!forceRefresh) {
        const cachedDataStr = localStorage.getItem(DASHBOARD_DATA_KEY);
        const cachedTimestampStr = localStorage.getItem(DASHBOARD_TIMESTAMP_KEY);
        
        if (cachedDataStr && cachedTimestampStr) {
          const cachedTimestamp = parseInt(cachedTimestampStr);
          const now = Date.now();
          
          // Use cached data if it's less than 5 minutes old
          if (now - cachedTimestamp < CACHE_EXPIRY_TIME) {
            const cachedData = JSON.parse(cachedDataStr);
            setRecentApplications(cachedData.applications);
            setStats(cachedData.stats);
            setLoading(false);
            return;
          }
        }
      }
      
      // Get dashboard data from service
      const dashboardData = await fetchDashboardData();
      setRecentApplications(dashboardData.applications);
      setStats(dashboardData.stats);
      
      // Cache the data
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(dashboardData));
      localStorage.setItem(DASHBOARD_TIMESTAMP_KEY, Date.now().toString());
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle application submission success
  const handleApplicationSuccess = async () => {
    await loadDashboardData(true); // Reload dashboard data after submission with force refresh
  };

  return (
    <div className="px-4 py-6">
      <div className="px-4 pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <Heading level="h1" className="text-2xl text-ui-fg-base mb-2">Bảng điều khiển</Heading>
            <Text className="text-ui-fg-subtle">
              Chào mừng {user?.name || user?.username || 'bạn'} đến với Cổng dịch vụ công
            </Text>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="small" 
              onClick={() => loadDashboardData(true)}
              disabled={loading}
              className="hover:shadow-sm transition-shadow duration-200"
            >
              <span className="w-4 h-4 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6"></path>
                  <path d="M2.5 12a10 10 0 0 1 19-4h-3.5"></path>
                  <path d="M2.5 22v-6h6"></path>
                  <path d="M21.5 12a10 10 0 0 1-19 4h3.5"></path>
                </svg>
              </span>
              Làm mới
            </Button>
            <Button onClick={() => setShowNewApplicationModal(true)}>
              <Plus className="mr-2" />
              Nộp hồ sơ mới
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Tổng số hồ sơ" 
          value={stats.total} 
          description="Tổng số hồ sơ đã nộp"
          icon={DocumentText} 
        />
        <StatCard 
          title="Đang xử lý" 
          value={stats.pending} 
          description="Số hồ sơ đang được xử lý"
          icon={Clock} 
        />
        <StatCard 
          title="Đã duyệt" 
          value={stats.approved} 
          description="Số hồ sơ đã được duyệt"
          icon={Check} 
        />
        <StatCard 
          title="Từ chối" 
          value={stats.rejected} 
          description="Số hồ sơ bị từ chối"
          icon={XMark} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Recent applications */}
        <div className="md:col-span-2">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden">
            <div className="p-5 border-b border-ui-border-base bg-ui-bg-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Text size="large" weight="plus" className="text-ui-fg-base">Hồ sơ gần đây</Text>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  3 hồ sơ mới nhất bạn đã nộp
                </Text>
              </div>
              <Link href="/dashboard/history">
                <Button variant="secondary" size="small">
                  Xem tất cả
                  <ChevronRight className="ml-1" />
                </Button>
              </Link>
            </div>
            <div>
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-base"></div>
                </div>
              ) : recentApplications.length > 0 ? (
                <div>
                  {recentApplications.map((application) => (
                    <RecentApplicationItem 
                      key={application.applicationid} 
                      application={application} 
                      onViewDetail={setSelectedApplicationId}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Text className="text-ui-fg-subtle mb-4">
                    Bạn chưa có hồ sơ nào. Hãy nộp hồ sơ đầu tiên của bạn!
                  </Text>
                  <Button variant="secondary" onClick={() => setShowNewApplicationModal(true)}>
                    <Plus className="mr-2" />
                    Nộp hồ sơ mới
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Document guides section */}
        <div>
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden h-full">
            <div className="p-5 border-b border-ui-border-base bg-ui-bg-subtle">
              <div className="flex items-center">
                <DocumentText className="text-ui-fg-base mr-2" />
                <Text size="large" weight="plus" className="text-ui-fg-base">Tài liệu hướng dẫn</Text>
              </div>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                Thông tin hữu ích cho việc chuẩn bị hồ sơ
              </Text>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                <li className="hover:bg-ui-bg-subtle rounded-md transition-colors duration-200 p-2">
                  <Link href="/guides/identity-documents" className="flex items-center text-ui-fg-base hover:text-ui-fg-base">
                    <div className="w-8 h-8 rounded-md bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center mr-3 shadow-sm">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <Text weight="plus">Giấy tờ cá nhân</Text>
                      <Text size="small" className="text-ui-fg-subtle">Hướng dẫn chuẩn bị giấy tờ cá nhân</Text>
                    </div>
                  </Link>
                </li>
                <li className="hover:bg-ui-bg-subtle rounded-md transition-colors duration-200 p-2">
                  <Link href="/guides/application-process" className="flex items-center text-ui-fg-base hover:text-ui-fg-base">
                    <div className="w-8 h-8 rounded-md bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center mr-3 shadow-sm">
                      <DocumentText className="w-4 h-4" />
                    </div>
                    <div>
                      <Text weight="plus">Quy trình xử lý hồ sơ</Text>
                      <Text size="small" className="text-ui-fg-subtle">Các bước xử lý hồ sơ hành chính</Text>
                    </div>
                  </Link>
                </li>
                <li className="hover:bg-ui-bg-subtle rounded-md transition-colors duration-200 p-2">
                  <Link href="/guides/faq" className="flex items-center text-ui-fg-base hover:text-ui-fg-base">
                    <div className="w-8 h-8 rounded-md bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center mr-3 shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <Text weight="plus">Câu hỏi thường gặp</Text>
                      <Text size="small" className="text-ui-fg-subtle">Giải đáp các thắc mắc phổ biến</Text>
                    </div>
                  </Link>
                </li>
              </ul>
              <Link href="/dashboard/guides" className="flex justify-center mt-6">
                <Button variant="secondary" size="small" className="hover:shadow-sm transition-shadow duration-200">
                  Xem tất cả hướng dẫn
                  <ChevronRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* New application modal */}
      <NewApplicationModal 
        isOpen={showNewApplicationModal}
        onClose={() => setShowNewApplicationModal(false)}
        onSuccess={handleApplicationSuccess}
      />
      
      {/* Application detail modal */}
      <ApplicationDetailModal
        isOpen={selectedApplicationId !== null}
        onClose={() => setSelectedApplicationId(null)}
        applicationId={selectedApplicationId}
      />
    </div>
  );
} 