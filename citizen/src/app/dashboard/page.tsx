"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import NewApplicationModal from '@/components/NewApplicationModal';
import ApplicationDetailModal from '@/components/ApplicationDetailModal';
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
  BellAlert as BellIcon,
  ChevronRight,
} from '@medusajs/icons';

/**
 * Application status component
 */
const ApplicationStatus = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-ui-tag-green-bg text-ui-tag-green-text';
      case 'rejected':
        return 'bg-ui-tag-red-bg text-ui-tag-red-text';
      case 'pending':
      case 'processing':
        return 'bg-ui-tag-orange-bg text-ui-tag-orange-text';
      default:
        return 'bg-ui-tag-blue-bg text-ui-tag-blue-text';
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Check className="w-4 h-4 text-ui-tag-green-text" />;
      case 'rejected':
        return <XMark className="w-4 h-4 text-ui-tag-red-text" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-ui-tag-orange-text" />;
      default:
        return <ChevronRight className="w-4 h-4 text-ui-tag-blue-text" />;
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusClass()}`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1 capitalize">{status}</span>
      </div>
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
  <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base">
    <div className="p-5">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-ui-bg-base-hover flex items-center justify-center text-ui-fg-interactive">
          <Icon className="w-5 h-5" />
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
  <div className="p-4 border-b border-ui-border-base">
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
  <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4">
    <Heading level="h3" className="text-lg mb-2">{title}</Heading>
    <Text size="small" className="text-ui-fg-subtle mb-4">
      {description}
    </Text>
    <Link href={href}>
      <Button variant="secondary" size="small">
        Nộp hồ sơ
        <ChevronRight className="ml-1" />
      </Button>
    </Link>
  </div>
);

/**
 * Notification item component
 */
const NotificationItem = ({ 
  notification 
}: { 
  notification: {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }
}) => (
  <div className={`p-4 border-b border-ui-border-base ${notification.read ? '' : 'bg-blue-50'}`}>
    <div className="flex">
      <div className="flex-shrink-0 pt-1">
        <BellIcon className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-blue-500'}`} />
      </div>
      <div className="ml-3">
        <Text weight="plus" className="text-ui-fg-base">
          {notification.title}
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {notification.message}
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-2">
          {new Date(notification.date).toLocaleDateString('vi-VN')}
        </Text>
      </div>
    </div>
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
  
  // State for notifications
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // State for new application modal
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  
  // State for application detail modal
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Function to load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get dashboard data from service
      const dashboardData = await fetchDashboardData();
      setRecentApplications(dashboardData.applications);
      setStats(dashboardData.stats);
      
      // Sample notifications
      const dummyNotifications = [
        {
          id: 1,
          title: 'Hồ sơ của bạn đã được phê duyệt',
          message: 'Hồ sơ đăng ký khai sinh đã được phê duyệt thành công',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          read: false
        },
        {
          id: 2,
          title: 'Cập nhật trạng thái hồ sơ',
          message: 'Hồ sơ đăng ký kết hôn đang được xử lý',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          read: true
        }
      ];
      
      setNotifications(dummyNotifications);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle application submission success
  const handleApplicationSuccess = async () => {
    await loadDashboardData(); // Reload dashboard data after submission
  };

  // Count unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).length;

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
          <div className="flex items-center">
            <Button 
              variant="secondary" 
              className="mr-2"
              onClick={() => setShowNotifications(true)}
            >
              <BellIcon className="mr-2" />
              Thông báo
              {unreadNotifications > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-600">{unreadNotifications}</Badge>
              )}
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
            <div className="p-5 border-b border-ui-border-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-interactive"></div>
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
            <div className="p-5 border-b border-ui-border-base">
              <div className="flex items-center">
                <DocumentText className="text-ui-fg-interactive mr-2" />
                <Text size="large" weight="plus" className="text-ui-fg-base">Tài liệu hướng dẫn</Text>
              </div>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                Thông tin hữu ích cho việc chuẩn bị hồ sơ
              </Text>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                <li>
                  <Link href="/guides/identity-documents" className="flex items-center text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Text weight="plus">Giấy tờ cá nhân</Text>
                      <Text size="small" className="text-ui-fg-subtle">Hướng dẫn chuẩn bị giấy tờ cá nhân</Text>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/guides/application-process" className="flex items-center text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <DocumentText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <Text weight="plus">Quy trình xử lý hồ sơ</Text>
                      <Text size="small" className="text-ui-fg-subtle">Các bước xử lý hồ sơ hành chính</Text>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/guides/faq" className="flex items-center text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <Text weight="plus">Câu hỏi thường gặp</Text>
                      <Text size="small" className="text-ui-fg-subtle">Giải đáp các thắc mắc phổ biến</Text>
                    </div>
                  </Link>
                </li>
              </ul>
              <Link href="/dashboard/guides" className="flex justify-center mt-4">
                <Button variant="secondary" size="small">
                  Xem tất cả hướng dẫn
                  <ChevronRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications drawer */}
      <Drawer open={showNotifications}>
        <Drawer.Content className="max-w-md">
          <Drawer.Header>
            <Drawer.Title>Thông báo</Drawer.Title>
            <Button 
              variant="secondary" 
              size="small" 
              onClick={() => setShowNotifications(false)}
            >
              <XMark />
            </Button>
          </Drawer.Header>
          <Drawer.Body>
            {notifications.length > 0 ? (
              <div>
                {notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <Text className="text-ui-fg-subtle">
                  Bạn không có thông báo nào
                </Text>
              </div>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
      
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