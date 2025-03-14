"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';

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
  BellAlert as BellIcon,
  ChevronRight,
  User,
  MagnifyingGlass,
  ChartBar
} from '@medusajs/icons';
import { fetchDashboardData } from '@/services/applicationService';

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
 * Application item component for staff to process
 */
const ApplicationToProcessItem = ({
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
    <div className="mt-2">
      <Text size="small" className="text-ui-fg-subtle">
        Người nộp: {application.applicantname || 'Chưa xác định'}
      </Text>
      <Text size="small" className="text-ui-fg-subtle">
        ID: {application.applicationid}
      </Text>
    </div>
    <div className="mt-2 flex justify-end">
      <Button
        variant="secondary"
        size="small"
        className="mr-2"
        onClick={() => onViewDetail(application.applicationid)}
      >
        Xem chi tiết
      </Button>
      <Button
        size="small"
      >
        Xử lý
      </Button>
    </div>
  </div>
);

/**
 * Quick Link component
 */
const QuickLink = ({ title, icon: Icon, href, description }: {
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  description: string;
}) => (
  <Link href={href} className="no-underline">
    <div className="flex items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <Text size="base" weight="plus" className="text-ui-fg-base mb-1">
          {title}
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          {description}
        </Text>
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

// Define types for the stats to avoid TypeScript errors
interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today?: number;
}

/**
 * Dashboard page component for Staff
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicationsToProcess, setApplicationsToProcess] = useState<Array<{ applicationid: number;[key: string]: any }>>([]);
  // Update stats with proper typing
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0
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
      setApplicationsToProcess(dashboardData.applications);
      
      // Handle stats with today field (ensure type safety)
      const apiStats = dashboardData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
      setStats({
        total: apiStats.total || 0,
        pending: apiStats.pending || 0,
        approved: apiStats.approved || 0,
        rejected: apiStats.rejected || 0,
        today: 10 // Hardcoded for now since API doesn't provide it
      });

      // Sample notifications for staff
      const staffNotifications = [
        {
          id: 1,
          title: 'Hồ sơ mới cần xử lý',
          message: 'Có 5 hồ sơ mới được nộp cần được xử lý',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false
        },
        {
          id: 2,
          title: 'Nhắc nhở thời hạn',
          message: 'Có 3 hồ sơ sắp đến hạn xử lý',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true
        }
      ];

      setNotifications(staffNotifications);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="py-8 max-w-full">
      <div className="px-4 pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <Heading level="h1" className="text-2xl text-ui-fg-base mb-2">Bảng điều khiển cán bộ</Heading>
            <Text className="text-ui-fg-subtle">
              Chào mừng cán bộ {user?.name || ''} đến với Hệ thống quản lý hồ sơ
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
            <Link href="/dashboard/reports">
              <Button variant="secondary">
                <ChartBar className="mr-2" />
                Báo cáo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Tổng số hồ sơ"
          value={stats.total}
          description="Tổng số hồ sơ đã tiếp nhận"
          icon={DocumentText}
        />
        <StatCard
          title="Chờ xử lý"
          value={stats.pending}
          description="Số hồ sơ đang chờ xử lý"
          icon={Clock}
        />
        <StatCard
          title="Đã xử lý"
          value={stats.approved}
          description="Số hồ sơ đã xử lý"
          icon={Check}
        />
        <StatCard
          title="Từ chối"
          value={stats.rejected}
          description="Số hồ sơ bị từ chối"
          icon={XMark}
        />
        <StatCard
          title="Hôm nay"
          value={stats.today || 0}
          description="Số hồ sơ tiếp nhận hôm nay"
          icon={DocumentText}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-12">
        {/* Left column: Applications to process */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden">
            <div className="p-5 border-b border-ui-border-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Text size="large" weight="plus" className="text-ui-fg-base">Hồ sơ cần xử lý</Text>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Danh sách hồ sơ đang chờ được xử lý
                </Text>
              </div>
              <Link href="/dashboard/all-applications">
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
              ) : applicationsToProcess.length > 0 ? (
                <div>
                  {applicationsToProcess.map((application) => (
                    <ApplicationToProcessItem
                      key={application.applicationid}
                      application={application}
                      onViewDetail={setSelectedApplicationId}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Text className="text-ui-fg-subtle mb-4">
                    Không có hồ sơ nào đang chờ xử lý.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Quick links and statistics */}
        <div className="md:col-span-4 space-y-6">
          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Text size="base" weight="plus" className="text-ui-fg-base">
                Truy cập nhanh
              </Text>
            </div>
            <div className="p-4 space-y-3">
              <QuickLink
                title="Hồ sơ chờ xử lý"
                icon={Clock}
                href="/dashboard/pending-applications"
                description="Xem danh sách hồ sơ cần xử lý"
              />
              
              <QuickLink
                title="Hồ sơ trễ hạn"
                icon={Clock}
                href="/dashboard/overdue-applications"
                description="Xem các hồ sơ đã quá hạn xử lý"
              />
              
              <QuickLink
                title="Thống kê báo cáo"
                icon={ChartBar}
                href="/dashboard/reports"
                description="Xem thống kê và báo cáo tình hình xử lý"
              />
              
              <QuickLink
                title="Tra cứu hồ sơ"
                icon={MagnifyingGlass}
                href="/dashboard/search"
                description="Tra cứu hồ sơ theo nhiều tiêu chí"
              />
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
        </div>
      </div>
    </div>
  );
} 