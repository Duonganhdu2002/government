"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/lib/hooks/useAuth";
import { StaffUser } from "@/lib/types/auth.types";

// Import các service
import {
  fetchDashboardData,
  fetchPendingApplications,
  fetchAnalyticsData,
  updateApplicationStatus,
} from "@/services/applicationService";

// Import Medusa UI components (tất cả ở tông xám)
import {
  Badge,
  Button,
  Text,
  Heading,
  Drawer,
  Input,
  Checkbox,
} from "@medusajs/ui";

// Icons (chỉ dùng icon với màu xám, loại bỏ icon không cần thiết)
import {
  DocumentText,
  Check,
  XMark,
  Clock,
  BellAlert as BellIcon,
  ChevronRight,
  User,
  MagnifyingGlass,
  ChartBar,
  Calendar,
  ExclamationCircle,
  CreditCard,
  ChartBar as Cog, // Không dùng => có thể bỏ
  User as UserGroup,
  ArrowPath,
} from "@medusajs/icons";

// Import các components analytics bên ngoài (đã code sẵn)
import StatusPieChartExternal from "@/components/analytics/StatusPieChart";
import ApplicationBarChartExternal from "@/components/analytics/ApplicationBarChart";
import TrendLineChartExternal from "@/components/analytics/TrendLineChart";
import StaffPerformance from "@/components/analytics/StaffPerformance";
import ProcessingAnalysisExternal from "@/components/analytics/ProcessingAnalysis";

// Import modal chi tiết hồ sơ
import ApplicationDetailModal from "@/components/ApplicationDetailModal";

/* ------------------------------------------------------------------
  Helper Components & Utilities
------------------------------------------------------------------ */

/**
 * Thanh tiến trình (ProgressBar) - tông xám
 */
const ProgressBar = ({
  value,
  className,
  children,
}: {
  value: number;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`w-full overflow-hidden rounded ${className || ""}`}>
      <div className="relative h-full w-full overflow-hidden bg-gray-100">
        <div
          className="h-full transition-all duration-300 bg-gray-600"
          style={{ width: `${value}%` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Thẻ thông báo (NotificationItem) - tông xám
 */
const NotificationItem = ({
  notification,
  onRead,
}: {
  notification: {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
    applicationId?: number;
  };
  onRead: (id: number) => void;
}) => (
  <div
    className={`p-4 border-b border-gray-300 ${
      notification.read ? "" : "bg-gray-50"
    }`}
  >
    <div className="flex">
      <div className="flex-shrink-0 pt-1">
        <BellIcon
          className={`w-5 h-5 ${
            notification.read ? "text-gray-400" : "text-gray-600"
          }`}
        />
      </div>
      <div className="ml-3 flex-1">
        <Text weight="plus" className="text-gray-800">
          {notification.title}
        </Text>
        <Text size="small" className="text-gray-500 mt-1">
          {notification.message}
        </Text>
        <div className="flex justify-between items-center mt-2">
          <Text size="small" className="text-gray-500">
            {new Date(notification.date).toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <div className="flex gap-2">
            {!notification.read && (
              <Button variant="secondary" size="small" onClick={() => onRead(notification.id)}>
                Đánh dấu đã đọc
              </Button>
            )}
            {notification.applicationId && (
              <Link href={`/dashboard/applications/${notification.applicationId}`}>
                <Button size="small">Xem hồ sơ</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Item hoạt động gần đây (RecentActivityItem) - tông xám
 */
interface ActivityData {
  historyid: number;
  applicationid: number;
  staffid: number;
  actiontaken: string;
  actiondate: string;
  notes?: string;
  application_title?: string;
}

const RecentActivityItem = ({ activity }: { activity: ActivityData }) => {
  const actionLower = activity.actiontaken.toLowerCase();

  const getActivityIcon = () => {
    if (actionLower === "approved") {
      return <Check className="w-4 h-4 text-gray-600" />;
    } else if (actionLower === "rejected") {
      return <XMark className="w-4 h-4 text-gray-600" />;
    } else if (actionLower === "reviewed") {
      return <MagnifyingGlass className="w-4 h-4 text-gray-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="flex items-start p-4 border-b border-gray-300">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
        {getActivityIcon()}
      </div>
      <div className="flex-1">
        <Text size="small" weight="plus" className="text-gray-800">
          {activity.application_title || `Hồ sơ #${activity.applicationid}`}
        </Text>
        <Text size="small" className="text-gray-500">
          {activity.actiontaken} •{" "}
          {new Date(activity.actiondate).toLocaleDateString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {activity.notes && (
          <Text size="small" className="text-gray-500 mt-1 italic">
            "{activity.notes}"
          </Text>
        )}
      </div>
      <Link href={`/dashboard/applications/${activity.applicationid}`}>
        <Button variant="secondary" size="small">
          Xem
        </Button>
      </Link>
    </div>
  );
};

/**
 * Hàm hiển thị lời chào
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

/**
 * Card hiển thị metric ở tab hiệu suất (DataMetricsCard)
 */
const DataMetricsCard = ({
  title,
  value,
  previousValue,
  trend,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  previousValue?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<any>;
}) => {
  const numericValue = typeof value === "number" ? value : 0;
  const percentChange =
    previousValue && previousValue !== 0
      ? Math.round(((numericValue - previousValue) / previousValue) * 100)
      : null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300">
      <div className="flex items-center mb-2">
        {Icon && (
          <div className="rounded-full bg-gray-100 p-2 mr-3">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <Text size="small" className="text-gray-500">
          {title}
        </Text>
      </div>
      <div className="flex items-baseline">
        <Text size="xlarge" weight="plus" className="text-gray-800 mr-2">
          {value}
        </Text>
        {percentChange !== null && (
          <div
            className={`flex items-center ${
              trend === "up" ? "text-gray-600" : "text-gray-500"
            }`}
          >
            <span className="text-sm font-medium">
              {trend === "up" ? "↑" : "↓"} {Math.abs(percentChange)}%
            </span>
          </div>
        )}
      </div>
      {previousValue && (
        <Text size="small" className="text-gray-500 mt-1">
          Kỳ trước: {previousValue}
        </Text>
      )}
    </div>
  );
};

/**
 * Bảng phân tích thống kê chi tiết (StatisticalBreakdown)
 */
const StatisticalBreakdown = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Tính phần trăm tích lũy (Pareto)
  let cumulativePercent = 0;
  const paretoData = sortedData.map((item) => {
    const percent = (item.count / total) * 100;
    cumulativePercent += percent;
    return {
      ...item,
      percent: Math.round(percent),
      cumulativePercent: Math.round(cumulativePercent),
    };
  });

  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Phân tích thống kê chi tiết
      </Text>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phần trăm
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tích lũy
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phân phối
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paretoData.map((item, index) => (
              <tr key={index}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {item.type || item.status}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.count}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.percent}%
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.cumulativePercent}%
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-600 h-2 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Tóm tắt hồ sơ (ApplicationsSummary)
 */
interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  overdue: number;
}

const ApplicationsSummary = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-6">
      <div className="p-5 border-b border-gray-300 flex justify-between items-center">
        <div>
          <Text size="large" weight="plus" className="text-gray-800">
            Tổng quan hồ sơ
          </Text>
          <Text size="small" className="text-gray-500 mt-1">
            Thống kê tổng hợp về tất cả hồ sơ trong hệ thống
          </Text>
        </div>
        <Link href="/dashboard/all-applications">
          <Button variant="secondary" size="small">
            Xem tất cả
            <ChevronRight className="ml-1" />
          </Button>
        </Link>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <Text size="small" className="text-gray-500">
                Tất cả hồ sơ
              </Text>
              <Text size="xlarge" weight="plus" className="text-gray-800">
                {stats.total}
              </Text>
            </div>
            <ProgressBar value={100} className="h-2 bg-gray-200">
              <span className="sr-only">100%</span>
            </ProgressBar>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <Text size="small" className="text-gray-500">
                Tỷ lệ phê duyệt
              </Text>
              <Text size="xlarge" weight="plus" className="text-gray-800">
                {stats.total
                  ? Math.round((stats.approved / stats.total) * 100)
                  : 0}
                %
              </Text>
            </div>
            <ProgressBar
              value={
                stats.total ? (stats.approved / stats.total) * 100 : 0
              }
              className="h-2 bg-gray-200"
            >
              <span className="sr-only">
                {stats.total
                  ? Math.round((stats.approved / stats.total) * 100)
                  : 0}
                %
              </span>
            </ProgressBar>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <Text size="small" className="text-gray-500">
                Tỷ lệ từ chối
              </Text>
              <Text size="xlarge" weight="plus" className="text-gray-800">
                {stats.total
                  ? Math.round((stats.rejected / stats.total) * 100)
                  : 0}
                %
              </Text>
            </div>
            <ProgressBar
              value={
                stats.total ? (stats.rejected / stats.total) * 100 : 0
              }
              className="h-2 bg-gray-200"
            >
              <span className="sr-only">
                {stats.total
                  ? Math.round((stats.rejected / stats.total) * 100)
                  : 0}
                %
              </span>
            </ProgressBar>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   AnalyticsSection hiển thị các tab phân tích (Tổng quan, Xu hướng, v.v.)
------------------------------------------------------------------ */

interface StaffPerformanceData {
  avgProcessingTime: number;
  processedApplications: number;
  efficiency: number;
}

const AnalyticsSection = ({
  analyticsData,
  loading,
  performanceData,
}: {
  analyticsData: any;
  loading: boolean;
  performanceData: StaffPerformanceData;
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "performance" | "reports" | "analytics"
  >("overview");

  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-6">
      <div className="p-5 border-b border-gray-300">
        <Text size="large" weight="plus" className="text-gray-800">
          Phân tích dữ liệu
        </Text>
        <Text size="small" className="text-gray-500 mt-1">
          Thống kê và phân tích chi tiết về hồ sơ
        </Text>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300">
        <div className="flex flex-wrap px-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "overview"
                ? "border-gray-800 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "analytics"
                ? "border-gray-800 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Phân tích nâng cao
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "trends"
                ? "border-gray-800 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Xu hướng
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "performance"
                ? "border-gray-800 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Hiệu suất
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === "reports"
                ? "border-gray-800 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Báo cáo
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <>
            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-r border-b border-gray-200">
                  <StatusPieChartExternal
                    data={{
                      pending: analyticsData.applicationsByStatus.pending || 0,
                      approved: analyticsData.applicationsByStatus.approved || 0,
                      rejected: analyticsData.applicationsByStatus.rejected || 0,
                    }}
                  />
                </div>
                <div className="border-b border-gray-200">
                  <ApplicationBarChartExternal
                    data={analyticsData.applicationsByType.map(
                      (item: any) => ({
                        type: item.type,
                        count: item.count,
                        percentage: item.percentage,
                      })
                    )}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 border-t border-gray-200">
                  <StatisticalBreakdown data={analyticsData.applicationsByType} />
                </div>
              </div>
            )}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              <div className="p-4">
                <Text className="text-center text-gray-500 py-8">
                  Phân tích nâng cao đang được phát triển
                </Text>
              </div>
            )}

            {/* Trends tab */}
            {activeTab === "trends" && (
              <div>
                <TrendLineChartExternal
                  data={analyticsData.applicationTrend.map((item: any) => ({
                    date: new Date(item.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    }),
                    submitted: item.submitted,
                    approved: item.approved,
                    rejected: item.rejected,
                  }))}
                />
                <div className="border-t border-gray-200">
                  <ProcessingAnalysisExternal
                    data={analyticsData.processingTimeByType.map(
                      (item: any) => ({
                        type: item.type,
                        avgTime: item.avgTime,
                      })
                    )}
                  />
                </div>
              </div>
            )}

            {/* Performance tab */}
            {activeTab === "performance" && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <DataMetricsCard
                    title="Thời gian xử lý TB"
                    value={`${performanceData?.avgProcessingTime.toFixed(1) || "0"} ngày`}
                    previousValue={7.2}
                    trend={
                      performanceData?.avgProcessingTime < 7.2 ? "up" : "down"
                    }
                    icon={Clock}
                  />
                  <DataMetricsCard
                    title="Đơn xử lý (tháng)"
                    value={performanceData?.processedApplications || 0}
                    previousValue={
                      performanceData
                        ? Math.round(performanceData.processedApplications * 0.9)
                        : 0
                    }
                    trend="up"
                    icon={DocumentText}
                  />
                  <DataMetricsCard
                    title="Hiệu suất xử lý"
                    value={`${performanceData?.efficiency || 0}%`}
                    previousValue={
                      performanceData
                        ? Math.round(performanceData.efficiency * 0.95)
                        : 0
                    }
                    trend="up"
                    icon={ChartBar}
                  />
                </div>
                <StaffPerformance
                  data={analyticsData.staffPerformance.map(
                    (staff: {
                      staffName: string;
                      processed: number;
                      avgTime: number;
                    }) => ({
                      name: staff.staffName,
                      processedCount: staff.processed,
                      approvalRate: Math.round(Math.random() * 40) + 50,
                      avgProcessingTime: staff.avgTime,
                    })
                  )}
                />
              </div>
            )}

            {/* Reports tab */}
            {activeTab === "reports" && (
              <div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Link
                      href="/dashboard/reports/monthly"
                      className="no-underline"
                    >
                      <div className="border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mb-4">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <Text
                          size="large"
                          weight="plus"
                          className="text-gray-800 mb-1"
                        >
                          Báo cáo tháng
                        </Text>
                        <Text size="small" className="text-gray-500">
                          Thống kê tổng hợp theo tháng về tình hình xử lý hồ sơ
                        </Text>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/reports/departments"
                      className="no-underline"
                    >
                      <div className="border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mb-4">
                          <UserGroup className="w-6 h-6" />
                        </div>
                        <Text
                          size="large"
                          weight="plus"
                          className="text-gray-800 mb-1"
                        >
                          Báo cáo theo phòng ban
                        </Text>
                        <Text size="small" className="text-gray-500">
                          Phân tích hiệu suất xử lý hồ sơ theo từng phòng ban
                        </Text>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   MAIN DASHBOARD PAGE
------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Loading
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    overdue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      title: string;
      message: string;
      date: string;
      read: boolean;
      applicationId?: number;
    }>
  >([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    applicationsByType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    processingTimeByType: Array<{ type: string; avgTime: number }>;
    applicationsByStatus: { [key: string]: number };
    applicationTrend: Array<{
      date: string;
      submitted: number;
      approved: number;
      rejected: number;
    }>;
    staffPerformance: Array<{
      staffName: string;
      processed: number;
      avgTime: number;
      efficiency?: number;
    }>;
  }>({
    applicationsByType: [],
    processingTimeByType: [],
    applicationsByStatus: {},
    applicationTrend: [],
    staffPerformance: [],
  });
  const [performanceData, setPerformanceData] = useState<StaffPerformanceData>({
    avgProcessingTime: 0,
    processedApplications: 0,
    efficiency: 0,
  });

  // Quản lý chế độ Admin
  const [adminMode, setAdminMode] = useState<
    "dashboard" | "users" | "settings"
  >("dashboard");

  // Thời gian hiện tại hiển thị ở banner
  const [currentTime, setCurrentTime] = useState(new Date());

  // Id hồ sơ hiển thị chi tiết
  const [selectedApplicationDetailId, setSelectedApplicationDetailId] = useState<
    number | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // -----------------------------------------------------------------------------
  // Notifications: đánh dấu đã đọc
  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // -----------------------------------------------------------------------------
  // Xử lý admin mode
  const handleAdminModeChange = (
    mode: "dashboard" | "users" | "settings"
  ) => {
    setAdminMode(mode);
  };

  // -----------------------------------------------------------------------------
  // Lấy dữ liệu tổng quan
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy data chung
      const dashboardData = await fetchDashboardData();
      if (!dashboardData) {
        throw new Error("Failed to fetch dashboard data");
      }

      // Hoạt động gần đây
      if (dashboardData.recentActivity) {
        setRecentActivity(dashboardData.recentActivity);
      }

      // Thống kê
      if (dashboardData.stats) {
        setStats({
          total: dashboardData.stats.total || 0,
          pending: dashboardData.stats.pending || 0,
          approved: dashboardData.stats.approved || 0,
          rejected: dashboardData.stats.rejected || 0,
          today: dashboardData.stats.today || 0,
          overdue: dashboardData.stats.overdue || 0,
        });
      }

      // Tạo notifications tự động (VD: quá hạn, hồ sơ mới, ...)
      const generatedNotifications: any[] = [];

      // Quá hạn
      if (dashboardData.stats && dashboardData.stats.overdue > 0) {
        generatedNotifications.push({
          id: 1,
          title: "Hồ sơ quá hạn cần xử lý gấp",
          message: `Có ${dashboardData.stats.overdue} hồ sơ đã quá hạn xử lý cần được ưu tiên giải quyết`,
          date: new Date().toISOString(),
          read: false,
        });
      }

      // Hồ sơ mới
      if (dashboardData.stats && dashboardData.stats.today > 0) {
        generatedNotifications.push({
          id: 2,
          title: "Hồ sơ mới cần xử lý",
          message: `Có ${dashboardData.stats.today} hồ sơ mới được nộp trong ngày hôm nay`,
          date: new Date().toISOString(),
          read: false,
        });
      }

      // (Nếu có data về đơn quá hạn chi tiết, ta có thể push noti theo từng đơn)

      setNotifications(generatedNotifications);

      // Lấy analytics data
      const analyticsMockData = await fetchAnalyticsData();
      if (analyticsMockData) {
        // Transform applicationsByStatus from array to object
        const transformedApplicationsByStatus: { [key: string]: number } = {};
        
        if (Array.isArray(analyticsMockData.applicationsByStatus)) {
          analyticsMockData.applicationsByStatus.forEach(item => {
            transformedApplicationsByStatus[item.status] = item.count;
          });
        }
        
        setAnalyticsData({
          ...analyticsMockData,
          applicationsByStatus: transformedApplicationsByStatus
        });
      }

      // Hiệu suất chung
      if (dashboardData.performance) {
        setPerformanceData(dashboardData.performance);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------------
  // Mở/đóng modal chi tiết
  const handleViewApplicationDetail = (applicationId: number) => {
    setSelectedApplicationDetailId(applicationId);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplicationDetailId(null);
  };

  // -----------------------------------------------------------------------------
  // useEffect
  useEffect(() => {
    loadDashboardData();

    // Cập nhật giờ trong banner
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------------
  // Render
  return (
    <div className="py-6 max-w-full">
      {/* Banner chào */}
      <div className="px-4 mb-6 rounded-lg shadow-lg bg-gray-800">
        <div className="py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Text size="small" className="text-gray-200 mb-1">
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Heading
                level="h1"
                className="text-2xl md:text-3xl text-white font-bold mb-1"
              >
                {getGreeting()}, {user?.name || "Quản trị viên"}!
              </Heading>
              <Text className="text-gray-100">Tổng quan hệ thống</Text>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {/* Admin mode switcher */}
              <div className="px-2 py-1 bg-gray-700 rounded-lg flex items-center">
                <Button
                  variant={adminMode === "dashboard" ? "primary" : "secondary"}
                  size="small"
                  className={`mr-1 ${
                    adminMode === "dashboard"
                      ? "bg-gray-900"
                      : "bg-gray-700 text-white border-none hover:bg-gray-600"
                  }`}
                  onClick={() => handleAdminModeChange("dashboard")}
                >
                  <ChartBar className="w-4 h-4" />
                </Button>
                <Button
                  variant={adminMode === "users" ? "primary" : "secondary"}
                  size="small"
                  className={`mr-1 ${
                    adminMode === "users"
                      ? "bg-gray-900"
                      : "bg-gray-700 text-white border-none hover:bg-gray-600"
                  }`}
                  onClick={() => handleAdminModeChange("users")}
                >
                  <UserGroup className="w-4 h-4" />
                </Button>
                <Button
                  variant={adminMode === "settings" ? "primary" : "secondary"}
                  size="small"
                  className={`${
                    adminMode === "settings"
                      ? "bg-gray-900"
                      : "bg-gray-700 text-white border-none hover:bg-gray-600"
                  }`}
                  onClick={() => handleAdminModeChange("settings")}
                >
                  <ChartBar className="w-4 h-4" />
                </Button>
              </div>

              {/* Nút mở thông báo */}
              <Button
                variant="secondary"
                onClick={() => setShowNotifications(true)}
                className="relative bg-gray-700 hover:bg-gray-600 text-white border-none"
              >
                <BellIcon className="mr-2" />
                Thông báo
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>

              <Link href="/dashboard/reports">
                <Button
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white border-none"
                >
                  <ChartBar className="mr-2" />
                  Báo cáo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung tuỳ theo adminMode */}
      {adminMode === "dashboard" && (
        <div className="px-4">
          {/* Cards thống kê */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 mb-6">
            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <DocumentText className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Tổng số hồ sơ
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <Text size="xlarge" weight="plus" className="text-gray-800">
                      {stats.total}
                    </Text>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Chờ xử lý
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="flex items-center">
                      <Text
                        size="xlarge"
                        weight="plus"
                        className="text-gray-800"
                      >
                        {stats.pending}
                      </Text>
                      <Badge className="ml-2 bg-gray-100 text-gray-700">
                        {stats.total
                          ? Math.round((stats.pending / stats.total) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Đã phê duyệt
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="flex items-center">
                      <Text
                        size="xlarge"
                        weight="plus"
                        className="text-gray-800"
                      >
                        {stats.approved}
                      </Text>
                      <Badge className="ml-2 bg-gray-100 text-gray-700">
                        {stats.total
                          ? Math.round((stats.approved / stats.total) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <XMark className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Đã từ chối
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="flex items-center">
                      <Text
                        size="xlarge"
                        weight="plus"
                        className="text-gray-800"
                      >
                        {stats.rejected}
                      </Text>
                      <Badge className="ml-2 bg-gray-100 text-gray-700">
                        {stats.total
                          ? Math.round((stats.rejected / stats.total) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Hôm nay
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <Text size="xlarge" weight="plus" className="text-gray-800">
                      {stats.today}
                    </Text>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <ExclamationCircle className="w-6 h-6" />
                </div>
                <div>
                  <Text size="small" className="text-gray-500">
                    Quá hạn
                  </Text>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="flex items-center">
                      <Text
                        size="xlarge"
                        weight="plus"
                        className="text-gray-800"
                      >
                        {stats.overdue}
                      </Text>
                      {stats.overdue > 0 && (
                        <Badge className="ml-2 bg-gray-300 text-gray-800">
                          Ưu tiên
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tóm tắt hồ sơ */}
          <ApplicationsSummary stats={stats} />

          {/* Khu vực phân tích */}
          <AnalyticsSection
            analyticsData={analyticsData}
            loading={loading}
            performanceData={performanceData}
          />

          {/* Hoạt động gần đây */}
          {recentActivity.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-300 flex justify-between items-center">
                <div>
                  <Text size="large" weight="plus" className="text-gray-800">
                    Hoạt động gần đây
                  </Text>
                  <Text size="small" className="text-gray-500 mt-1">
                    Các hồ sơ được xử lý gần đây
                  </Text>
                </div>
              </div>
              <div className="divide-y divide-gray-300">
                {recentActivity.map((activity) => (
                  <RecentActivityItem
                    key={activity.historyid}
                    activity={activity}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {adminMode === "users" && (
        <div className="px-4">
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-300 flex justify-between items-center">
              <div>
                <Text size="large" weight="plus" className="text-gray-800">
                  Quản lý người dùng
                </Text>
                <Text size="small" className="text-gray-500 mt-1">
                  Quản lý tài khoản nhân viên và phân quyền
                </Text>
              </div>
              <Button>
                <User className="w-4 h-4 mr-1" />
                Thêm người dùng
              </Button>
            </div>
            <div className="p-4">
              <Text className="text-center text-gray-500">
                Mục quản lý người dùng đang trong quá trình phát triển
              </Text>
            </div>
          </div>
        </div>
      )}

      {adminMode === "settings" && (
        <div className="px-4">
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-300">
              <Text size="large" weight="plus" className="text-gray-800">
                Cài đặt hệ thống
              </Text>
              <Text size="small" className="text-gray-500 mt-1">
                Quản lý cấu hình và thiết lập hệ thống
              </Text>
            </div>
            <div className="p-4">
              <Text className="text-center text-gray-500">
                Mục cài đặt hệ thống đang trong quá trình phát triển
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Thông báo */}
      <Drawer open={showNotifications}>
        <Drawer.Content className="max-w-md">
          <Drawer.Header>
            <div className="flex items-center justify-between w-full">
              <Drawer.Title>Thông báo</Drawer.Title>
              <div className="flex gap-2">
                {notifications.some((n) => !n.read) && (
                  <Button variant="secondary" size="small" onClick={handleMarkAllAsRead}>
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowNotifications(false)}
                >
                  <XMark />
                </Button>
              </div>
            </div>
          </Drawer.Header>
          <Drawer.Body>
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleMarkNotificationAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <Text className="text-gray-500">
                  Bạn không có thông báo nào
                </Text>
              </div>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>

      {/* Modal chi tiết hồ sơ (dùng component external) */}
      {isDetailModalOpen && (
        <ApplicationDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          applicationId={selectedApplicationDetailId}
        />
      )}
    </div>
  );
}
