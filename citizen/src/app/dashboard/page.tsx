"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { UserType } from '@/lib/types/auth.types';
import { apiClient } from '@/lib/api';
import NewApplicationModal from '@/components/NewApplicationModal';

// Import Medusa UI components
import {
  Badge,
  Button,
  Text,
  Heading,
  ProgressStatus,
  Tabs,
  Container,
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
  Calendar,
  MapPin,
  ChevronDown
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
        return 'bg-ui-tag-orange-bg text-ui-tag-orange-text';
      case 'processing':
        return 'bg-ui-tag-blue-bg text-ui-tag-blue-text';
      default:
        return 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text';
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Check />;
      case 'rejected':
        return <XMark />;
      case 'pending':
      case 'processing':
        return <Clock />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusClass()}`}>
      {getStatusIcon()}
      <span className="ml-1">{status}</span>
    </Badge>
  );
};

/**
 * Stat card component
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
  <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden h-full">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 p-2 rounded-md bg-ui-bg-base-hover">
          <Icon className="text-ui-fg-interactive" />
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
  application 
}: { 
  application: any;
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
      <Link href={`/dashboard/applications/${application.applicationid}`} className="no-underline">
        <Button variant="secondary" size="small">
          Xem chi tiết
        </Button>
      </Link>
    </div>
  </div>
);

/**
 * Upcoming deadline item component
 */
const DeadlineItem = ({ application }: { application: any }) => {
  const getRemainingDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getRemainingDays(application.duedate);
  let urgencyClass = 'text-gray-700';
  
  if (remainingDays <= 1) {
    urgencyClass = 'text-red-600 font-bold';
  } else if (remainingDays <= 3) {
    urgencyClass = 'text-orange-500 font-semibold';
  }

  return (
    <div className="p-4 border-b border-ui-border-base">
      <div className="flex items-center justify-between">
        <div>
          <Text size="large" weight="plus" className="text-ui-fg-base">
            {application.title || application.applicationtypename || 'Application'}
          </Text>
          <div className="flex items-center mt-1">
            <Clock className="w-4 h-4 text-ui-fg-subtle mr-1" />
            <Text size="small" className={`${urgencyClass}`}>
              {remainingDays > 0 
                ? `Còn ${remainingDays} ngày` 
                : 'Hết hạn'}
            </Text>
          </div>
        </div>
        <ApplicationStatus status={application.status || 'pending'} />
      </div>
      <div className="mt-2">
        <Text size="small" className="text-ui-fg-subtle">
          Hạn xử lý: {new Date(application.duedate).toLocaleDateString('vi-VN')}
        </Text>
      </div>
      <div className="mt-2 flex justify-end">
        <Link href={`/dashboard/applications/${application.applicationid}`} className="no-underline">
          <Button variant="secondary" size="small">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </div>
  );
};

/**
 * Quick link component
 */
const QuickLink = ({ title, icon: Icon, href, description }: { 
  title: string; 
  icon: React.ComponentType<any>;
  href: string;
  description: string;
}) => (
  <Link href={href} className="no-underline">
    <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden h-full hover:border-ui-border-base-hover hover:shadow-sm transition-all">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex-shrink-0 p-2 rounded-md bg-ui-bg-base-hover mr-3">
            <Icon className="text-ui-fg-interactive" />
          </div>
          <Text weight="plus" className="text-ui-fg-base">{title}</Text>
        </div>
        <Text size="small" className="text-ui-fg-subtle">{description}</Text>
      </div>
    </div>
  </Link>
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
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Array<{applicationid: number; [key: string]: any}>>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  
  // State to control notification display
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // State để kiểm soát hiển thị popup nộp hồ sơ mới
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent applications
      try {
        // Use the correct API endpoint
        const applicationsResponse = await apiClient.get(`/api/applications/current-user`);
        const applications = applicationsResponse.data || [];
        
        // Set recent applications (newest first)
        setRecentApplications(applications.slice(0, 5));
        
        // Find upcoming deadlines (applications with due dates in the next 7 days)
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);
        
        const upcoming = applications
          .filter((app: any) => {
            if (!app.duedate) return false;
            const dueDate = new Date(app.duedate);
            return dueDate >= today && dueDate <= sevenDaysLater && 
                  (app.status.toLowerCase() === 'pending' || app.status.toLowerCase() === 'processing');
          })
          .sort((a: any, b: any) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime());
          
        setUpcomingDeadlines(upcoming);
      } catch (error) {
        console.log('No applications found or error fetching applications:', error);
        setRecentApplications([]);
        setUpcomingDeadlines([]);
      }
      
      // Fetch statistics
      try {
        // Use the correct API endpoint
        const statsResponse = await apiClient.get(`/api/applications/stats/summary`);
        
        // Check the correct data structure from the API
        const data = statsResponse.data || {};
        const byStatus = data.byStatus || [];
        
        const statusCounts = {
          total: data.total || 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        };
        
        // Parse the counts by status
        byStatus.forEach((item: any) => {
          const status = item.status.toLowerCase();
          if (status === 'pending' || status === 'processing') {
            statusCounts.pending += parseInt(item.count);
          } else if (status === 'approved') {
            statusCounts.approved += parseInt(item.count);
          } else if (status === 'rejected') {
            statusCounts.rejected += parseInt(item.count);
          }
        });
        
        setStats(statusCounts);
        
        // Fetch or generate dummy notifications
        // Normally this would be a separate API call
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
          },
          {
            id: 3,
            title: 'Thông báo hệ thống',
            message: 'Hệ thống sẽ bảo trì vào ngày 15/07/2023',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            read: true
          }
        ];
        
        setNotifications(dummyNotifications);
        
      } catch (error) {
        console.log('Error fetching statistics:', error);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi nộp hồ sơ thành công
  const handleApplicationSuccess = (applicationId: number) => {
    // Cập nhật lại dữ liệu dashboard
    fetchDashboardData();
  };
  
  // Determine notification badge count
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1" className="text-2xl mb-2">Bảng điều khiển</Heading>
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
                  Các hồ sơ gần đây bạn đã nộp
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
        
        {/* Upcoming deadlines */}
        <div>
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden h-full">
            <div className="p-5 border-b border-ui-border-base">
              <div className="flex items-center">
                <Calendar className="text-ui-fg-interactive mr-2" />
                <Text size="large" weight="plus" className="text-ui-fg-base">Sắp đến hạn</Text>
              </div>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                Hồ sơ cần được xử lý trong 7 ngày tới
              </Text>
            </div>
            <div>
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-interactive"></div>
                </div>
              ) : upcomingDeadlines.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto">
                  {upcomingDeadlines.map((application) => (
                    <DeadlineItem 
                      key={application.applicationid} 
                      application={application} 
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Text className="text-ui-fg-subtle">
                    Không có hồ sơ nào sắp đến hạn
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mb-8">
        <Heading level="h2" className="text-xl mb-4">Truy cập nhanh</Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink 
            title="Nộp hồ sơ mới" 
            icon={Plus} 
            href="/dashboard/applications"
            description="Lựa chọn và nộp hồ sơ mới" 
          />
          <QuickLink 
            title="Lịch sử hồ sơ" 
            icon={DocumentText} 
            href="/dashboard/history"
            description="Xem lịch sử các hồ sơ đã nộp" 
          />
          <QuickLink 
            title="Thông tin cá nhân" 
            icon={UserIcon} 
            href="/dashboard/profile"
            description="Cập nhật thông tin cá nhân" 
          />
          <QuickLink 
            title="Bản đồ dịch vụ" 
            icon={MapPin} 
            href="/dashboard/locations"
            description="Tìm các điểm dịch vụ gần bạn" 
          />
        </div>
      </div>
      
      {/* Recommended Services */}
      <div className="mb-8">
        <Heading level="h2" className="text-xl mb-4">Dịch vụ đề xuất</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4">
            <Heading level="h3" className="text-lg mb-2">Đăng ký khai sinh</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Đăng ký khai sinh cho trẻ em mới sinh
            </Text>
            <Link href="/dashboard/applications?type=1">
              <Button variant="secondary" size="small">
                Nộp hồ sơ
                <ChevronRight className="ml-1" />
              </Button>
            </Link>
          </div>
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4">
            <Heading level="h3" className="text-lg mb-2">Cấp CCCD/CMND</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Đăng ký cấp mới hoặc cấp lại căn cước công dân
            </Text>
            <Link href="/dashboard/applications?type=2">
              <Button variant="secondary" size="small">
                Nộp hồ sơ
                <ChevronRight className="ml-1" />
              </Button>
            </Link>
          </div>
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4">
            <Heading level="h3" className="text-lg mb-2">Đăng ký kết hôn</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Đăng ký kết hôn giữa công dân Việt Nam
            </Text>
            <Link href="/dashboard/applications?type=3">
              <Button variant="secondary" size="small">
                Nộp hồ sơ
                <ChevronRight className="ml-1" />
              </Button>
            </Link>
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
      
      {/* Modal nộp hồ sơ mới */}
      <NewApplicationModal 
        isOpen={showNewApplicationModal}
        onClose={() => setShowNewApplicationModal(false)}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
} 