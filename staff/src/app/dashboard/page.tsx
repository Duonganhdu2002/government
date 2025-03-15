"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/lib/hooks/useAuth";
import { StaffUser } from "@/lib/types/auth.types";

// Import Medusa UI components
import {
  Badge,
  Button,
  Text,
  Heading,
  Drawer,
  Input,
} from "@medusajs/ui";

// Icons (all icons will be displayed in gray tones)
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
  CheckCircle,
  ArrrowRight,
} from "@medusajs/icons";
import {
  fetchDashboardData,
  fetchPendingApplications,
  updateApplicationStatus,
} from "@/services/applicationService";

/**
 * ProgressBar (grayscale)
 */
const ProgressBar = ({
  value,
  className,
  children,
}: {
  value: number;
  className?: string;
  children: React.ReactNode;
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
 * ProgressCircle (grayscale)
 */
const ProgressCircle = ({
  value,
  className,
  children,
  size = "medium",
  trackColor = "text-gray-200",
  indicatorColor = "text-gray-600",
}: {
  value: number;
  className?: string;
  children?: React.ReactNode;
  size?: "small" | "medium" | "large";
  trackColor?: string;
  indicatorColor?: string;
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className || ""}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Track */}
        <circle
          className={trackColor}
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Indicator */}
        <circle
          className={indicatorColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{
            transition: "stroke-dashoffset 0.5s ease 0s",
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

/**
 * ApplicationStatus (grayscale badges & icons)
 */
const ApplicationStatus = ({ status }: { status: string }) => {
  const statusLower = status.toLowerCase();

  const getStatusClass = () => {
    // All statuses use grayscale classes
    // (You can differentiate them by using different gray levels if you want)
    switch (statusLower) {
      case "approved":
        return "bg-gray-200 text-gray-700";
      case "rejected":
        return "bg-gray-300 text-gray-800";
      case "pending":
      case "processing":
      case "submitted":
      case "in_review":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = () => {
    // All icons in gray
    switch (statusLower) {
      case "approved":
        return <Check className="w-4 h-4 text-gray-600" />;
      case "rejected":
        return <XMark className="w-4 h-4 text-gray-600" />;
      case "pending":
      case "processing":
      case "submitted":
      case "in_review":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <ChevronRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDisplayStatus = () => {
    switch (statusLower) {
      case "submitted":
        return "Đã nộp";
      case "in_review":
        return "Đang xem xét";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusClass()}`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1">{getDisplayStatus()}</span>
      </div>
    </Badge>
  );
};

/**
 * StatCard (grayscale)
 */
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
  trend = null,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<any>;
  isLoading?: boolean;
  trend?: "up" | "down" | null;
}) => (
  <div className="overflow-hidden rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-all duration-200">
    <div className="p-5">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          <Text size="small" className="text-gray-500">
            {title}
          </Text>
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <div className="flex items-center">
              <Text size="xlarge" weight="plus" className="text-gray-800">
                {value}
              </Text>
              {trend && (
                <Badge
                  className={`ml-2 ${
                    trend === "up"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  {trend === "up" ? "+" : "-"}5%
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-5 py-3 border-t border-gray-300">
      <Text size="small" className="text-gray-500">
        {description}
      </Text>
    </div>
  </div>
);

/**
 * ApplicationToProcessItem (grayscale)
 */
const ApplicationToProcessItem = ({
  application,
  onViewDetail,
  onProcess,
}: {
  application: any;
  onViewDetail: (application: ApplicationData) => void;
  onProcess: (id: number) => void;
}) => {
  // Calculate days since submission
  const daysSinceSubmission = () => {
    if (!application.submissiondate) return "N/A";
    const submissionDate = new Date(application.submissiondate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if application is late
  const isLate = application.isoverdue === true;

  return (
    <div className={`p-4 border-b border-gray-300 ${isLate ? "bg-gray-50" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <Text size="large" weight="plus" className="text-gray-800">
              {application.title ||
                application.applicationtypename ||
                "Hồ sơ chưa xác định"}
            </Text>
            {isLate && (
              <Badge className="ml-2 bg-gray-200 text-gray-700 flex items-center">
                <ExclamationCircle className="w-3 h-3 mr-1 text-gray-700" />
                Quá hạn
              </Badge>
            )}
          </div>
          <Text size="small" className="text-gray-500 mt-1">
            Ngày nộp:{" "}
            {new Date(
              application.submissiondate || Date.now()
            ).toLocaleDateString("vi-VN")}
            {application.duedate && (
              <span className="ml-2">
                Hạn xử lý:{" "}
                {new Date(application.duedate).toLocaleDateString("vi-VN")}
              </span>
            )}
          </Text>
        </div>
        <ApplicationStatus status={application.status || "pending"} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <Text size="small" className="text-gray-500">
            <User className="w-4 h-4 inline mr-1 text-gray-600" />
            Người nộp:{" "}
            {application.citizenname ||
              application.applicantname ||
              "Chưa xác định"}
          </Text>
        </div>
        <div>
          <Text size="small" className="text-gray-500">
            <Clock className="w-4 h-4 inline mr-1 text-gray-600" />
            Thời gian chờ: {daysSinceSubmission()} ngày
          </Text>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          variant="secondary"
          size="small"
          className="mr-2"
          onClick={() => onViewDetail(application)}
        >
          <MagnifyingGlass className="w-4 h-4 mr-1" />
          Xem chi tiết
        </Button>
        <Button size="small" onClick={() => onProcess(application.applicationid)}>
          <Check className="w-4 h-4 mr-1" />
          Xử lý
        </Button>
      </div>
    </div>
  );
};

/**
 * QuickLink (unused in final, but here if needed; in grayscale)
 */
const QuickLink = ({
  title,
  icon: Icon,
  href,
  description,
  count,
}: {
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  description: string;
  count?: number;
}) => (
  <Link href={href} className="no-underline">
    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition-colors duration-150">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mr-4">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Text size="base" weight="plus" className="text-gray-800 mb-1">
            {title}
          </Text>
          {count !== undefined && (
            <Badge className="bg-gray-200 text-gray-700">{count}</Badge>
          )}
        </div>
        <Text size="small" className="text-gray-500">
          {description}
        </Text>
      </div>
    </div>
  </Link>
);

/**
 * NotificationItem (grayscale)
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
 * Types
 */
interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  overdue: number;
}

interface ApplicationData {
  applicationid: number;
  title?: string;
  applicationtypename?: string;
  specialapplicationtypename?: string;
  submissiondate?: string;
  duedate?: string;
  status?: string;
  citizenname?: string;
  applicantname?: string;
  isoverdue?: boolean;
  [key: string]: any;
}

interface ActivityData {
  historyid: number;
  applicationid: number;
  staffid: number;
  actiontaken: string;
  actiondate: string;
  notes?: string;
  application_title?: string;
}

interface StaffPerformanceData {
  avgProcessingTime: number; // in days
  processedApplications: number;
  efficiency: number; // percentage
}

interface DailyTaskData {
  taskId: number;
  title: string;
  status: "completed" | "in-progress" | "priority";
  progress: number; // percentage
  target: number;
  current: number;
}

/**
 * RecentActivityItem (grayscale)
 */
const RecentActivityItem = ({ activity }: { activity: ActivityData }) => {
  const actionLower = activity.actiontaken.toLowerCase();

  const getActivityIcon = () => {
    // all icons in gray
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
 * ApplicationDetailModal - Modal hiển thị chi tiết đơn
 */
const ApplicationDetailModal = ({
  isOpen,
  onClose,
  application,
}: {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationData | null;
}) => {
  if (!application) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    
    let badgeClass = "bg-gray-200 text-gray-700";
    let Icon = Clock;
    
    if (statusLower === "approved") {
      Icon = Check;
    } else if (statusLower === "rejected") {
      Icon = XMark;
      badgeClass = "bg-gray-300 text-gray-800";
    }
    
    return (
      <Badge className={`flex items-center ${badgeClass}`}>
        <Icon className="w-4 h-4 mr-1 text-gray-600" />
        <span>
          {statusLower === "submitted"
            ? "Đã nộp"
            : statusLower === "in_review"
            ? "Đang xem xét"
            : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
      </Badge>
    );
  };

  return (
    <Drawer open={isOpen}>
      <Drawer.Content>
        <Drawer.Header>
          <div className="flex items-center justify-between w-full">
            <Drawer.Title>Chi tiết hồ sơ</Drawer.Title>
            <Button
              variant="secondary"
              size="small"
              onClick={onClose}
            >
              <XMark />
            </Button>
          </div>
        </Drawer.Header>
        <Drawer.Body className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Heading level="h2" className="text-xl font-bold mb-1">
                {application.title || application.applicationtypename || "Hồ sơ chưa xác định"}
              </Heading>
              <Text size="small" className="text-gray-500">
                ID: {application.applicationid}
              </Text>
            </div>
            {getStatusBadge(application.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Text size="small" className="text-gray-500 mb-1">Loại đơn</Text>
              <Text>{application.applicationtypename || "Không xác định"}</Text>
            </div>
            {application.specialapplicationtypename && (
              <div>
                <Text size="small" className="text-gray-500 mb-1">Loại đơn đặc biệt</Text>
                <Text>{application.specialapplicationtypename}</Text>
              </div>
            )}
            <div>
              <Text size="small" className="text-gray-500 mb-1">Người nộp</Text>
              <Text>{application.citizenname || application.applicantname || "Không xác định"}</Text>
            </div>
            <div>
              <Text size="small" className="text-gray-500 mb-1">Ngày nộp</Text>
              <Text>{formatDate(application.submissiondate)}</Text>
            </div>
            {application.duedate && (
              <div>
                <Text size="small" className="text-gray-500 mb-1">Hạn xử lý</Text>
                <Text className={application.isoverdue ? "text-red-500 font-medium" : ""}>
                  {formatDate(application.duedate)}
                  {application.isoverdue && " (Quá hạn)"}
                </Text>
              </div>
            )}
          </div>

          {application.description && (
            <div className="mb-6">
              <Text size="small" className="text-gray-500 mb-1">Mô tả</Text>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Text>{application.description}</Text>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Đóng
            </Button>
            <Button
              onClick={() => window.location.href = `/dashboard/process/${application.applicationid}`}
            >
              <Check className="w-4 h-4 mr-1" />
              Xử lý hồ sơ
            </Button>
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
};

/**
 * DashboardPage (grayscale)
 * 
 * Chức năng:
 * - Hiển thị tổng quan về hồ sơ: tổng số, đang chờ, phê duyệt, từ chối, mới, quá hạn
 * - Hiển thị danh sách hồ sơ cần xử lý
 * - Hiển thị nhiệm vụ hôm nay dựa trên hồ sơ đến hạn trong ngày
 * - Khi click vào hồ sơ sẽ hiển thị modal chi tiết
 * - Hiển thị hiệu suất làm việc từ dữ liệu thực
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicationsToProcess, setApplicationsToProcess] = useState<ApplicationData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);

  // State cho modal chi tiết đơn
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // State cho đơn cần xử lý hôm nay
  const [todaysTasks, setTodaysTasks] = useState<ApplicationData[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    overdue: 0,
  });

  // State for daily tasks
  const [dailyTasks, setDailyTasks] = useState<DailyTaskData[]>([]);
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState(0);
  const [totalDailyTasks, setTotalDailyTasks] = useState(0); // Thay vì hardcode 5

  // Staff performance data
  const [performanceData, setPerformanceData] = useState<StaffPerformanceData>({
    avgProcessingTime: 0,
    processedApplications: 0,
    efficiency: 0,
  });

  // Current time state for welcome message
  const [currentTime, setCurrentTime] = useState(new Date());

  // Chart data (grayscale, but logic is unaffected)
  const [chartData, setChartData] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  // Notifications
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

  // Application detail
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDashboardData();

    // Refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Load data
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const dashboardData = await fetchDashboardData();
      if (!dashboardData) {
        throw new Error("Failed to fetch dashboard data");
      }

      if (dashboardData.applications) {
        setApplicationsToProcess(dashboardData.applications.slice(0, 5));
      }
      if (dashboardData.recentActivity) {
        setRecentActivity(dashboardData.recentActivity);
      }
      
      // Lấy danh sách đơn cần xử lý hôm nay
      if (dashboardData.todaysTasks) {
        setTodaysTasks(dashboardData.todaysTasks);
      }

      if (dashboardData.dailyTasks) {
        setDailyTasks(dashboardData.dailyTasks);
        const completedTasks = dashboardData.dailyTasks.filter(
          (task: DailyTaskData) => task.status === "completed"
        ).length;
        const totalTasks = dashboardData.dailyTasks.length;
        setDailyTasksCompleted(completedTasks);
        setTotalDailyTasks(totalTasks);
      }

      if (dashboardData.performance) {
        setPerformanceData(dashboardData.performance);
      }

      if (dashboardData.stats) {
        setStats({
          total: dashboardData.stats.total || 0,
          pending: dashboardData.stats.pending || 0,
          approved: dashboardData.stats.approved || 0,
          rejected: dashboardData.stats.rejected || 0,
          today: dashboardData.stats.today || 0,
          overdue: dashboardData.stats.overdue || 0,
        });

        setChartData({
          approved: dashboardData.stats.approved || 0,
          rejected: dashboardData.stats.rejected || 0,
          pending: dashboardData.stats.pending || 0,
        });
      }

      // Generate notifications (grayscale - logic unaffected)
      const generatedNotifications: any[] = [];

      // Overdue
      if (dashboardData.stats && dashboardData.stats.overdue > 0) {
        generatedNotifications.push({
          id: 1,
          title: "Hồ sơ quá hạn cần xử lý gấp",
          message: `Có ${dashboardData.stats.overdue} hồ sơ đã quá hạn xử lý cần được ưu tiên giải quyết`,
          date: new Date().toISOString(),
          read: false,
        });
      }

      // New applications
      if (dashboardData.stats && dashboardData.stats.today > 0) {
        generatedNotifications.push({
          id: 2,
          title: "Hồ sơ mới cần xử lý",
          message: `Có ${dashboardData.stats.today} hồ sơ mới được nộp trong ngày hôm nay`,
          date: new Date().toISOString(),
          read: false,
        });
      }

      // Overdue individual notifications
      if (dashboardData.applications) {
        dashboardData.applications
          .filter((app: ApplicationData) => app.isoverdue)
          .slice(0, 3)
          .forEach((app: ApplicationData, idx: number) => {
            generatedNotifications.push({
              id: 3 + idx,
              title: "Hồ sơ cần xử lý khẩn",
              message: `Hồ sơ "${
                app.title || app.applicationtypename
              }" của ${
                app.citizenname || app.applicantname || "Người dân"
              } đã quá hạn xử lý`,
              date: new Date().toISOString(),
              read: false,
              applicationId: app.applicationid,
            });
          });
      }

      setNotifications(generatedNotifications);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process
  const handleProcessApplication = (id: number) => {
    router.push(`/dashboard/process/${id}`);
  };

  // View detail
  const handleViewApplicationDetail = (application: ApplicationData) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  // Đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  // Mark notification as read
  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Count unread
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Filter search
  const filteredApplications = applicationsToProcess.filter(
    (app: ApplicationData) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (app.title && app.title.toLowerCase().includes(searchLower)) ||
        (app.applicationtypename &&
          app.applicationtypename.toLowerCase().includes(searchLower)) ||
        (app.citizenname &&
          app.citizenname.toLowerCase().includes(searchLower)) ||
        (app.applicantname &&
          app.applicantname.toLowerCase().includes(searchLower)) ||
        (app.applicationid && app.applicationid.toString().includes(searchLower))
      );
    }
  );

  return (
    <div className="py-6 max-w-full">
      {/* Modal chi tiết đơn */}
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        application={selectedApplication}
      />
      
      {/* Welcome Banner - grayscale */}
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
              <Heading level="h1" className="text-2xl md:text-3xl text-white font-bold mb-1">
                {getGreeting()}, {user?.name || "Cán bộ"}!
              </Heading>
              <Text className="text-gray-100">
                Bạn có {stats.pending} hồ sơ đang chờ xử lý{" "}
                {stats.overdue > 0 && `và ${stats.overdue} hồ sơ quá hạn`}
              </Text>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-3">
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

          {/* Daily Tasks Progress */}
          <div className="mt-4 bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text size="small" className="text-gray-200">
                Nhiệm vụ hôm nay
              </Text>
              <Text size="small" className="text-white font-medium">
                {dailyTasksCompleted}/{totalDailyTasks} (
                {Math.round((dailyTasksCompleted / totalDailyTasks) * 100)}%)
              </Text>
            </div>
            <ProgressBar
              value={(dailyTasksCompleted / totalDailyTasks) * 100}
              className="h-2 bg-gray-600"
            >
              <span className="sr-only">{`${Math.round((dailyTasksCompleted / totalDailyTasks) * 100)}% hoàn thành`}</span>
            </ProgressBar>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 mb-6">
        {/* Each main stat: 2 columns on xl */}
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
                  <Text size="xlarge" weight="plus" className="text-gray-800">
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
                  <Text size="xlarge" weight="plus" className="text-gray-800">
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
                  <Text size="xlarge" weight="plus" className="text-gray-800">
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
                  <Text size="xlarge" weight="plus" className="text-gray-800">
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

      <div className="px-4 grid gap-6 md:grid-cols-12">
        {/* Left column */}
        <div className="md:col-span-8 space-y-6">
          {/* Processing Efficiency */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-300">
              <Text size="large" weight="plus" className="text-gray-800">
                Tỷ lệ xử lý hồ sơ
              </Text>
              <Text size="small" className="text-gray-500 mt-1">
                Biểu đồ hiệu suất xử lý hồ sơ của đơn vị
              </Text>
            </div>
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <ProgressCircle
                    value={
                      stats.total
                        ? Math.round((stats.approved / stats.total) * 100)
                        : 0
                    }
                    className="w-32 h-32"
                    size="large"
                    trackColor="text-gray-200"
                    indicatorColor="text-gray-600"
                  >
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <Text size="xlarge" weight="plus" className="text-gray-800">
                        {stats.total
                          ? Math.round((stats.approved / stats.total) * 100)
                          : 0}
                        %
                      </Text>
                      <Text size="xsmall" className="text-gray-500">
                        Đã phê duyệt
                      </Text>
                    </div>
                  </ProgressCircle>
                </div>
                <Text size="base" weight="plus" className="mt-3 text-gray-700">
                  {stats.approved} hồ sơ đã duyệt
                </Text>
              </div>

              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Text size="small" className="text-gray-500">
                        Phê duyệt
                      </Text>
                      <Text size="small" className="text-gray-500">
                        {stats.total
                          ? Math.round((stats.approved / stats.total) * 100)
                          : 0}
                        %
                      </Text>
                    </div>
                    <ProgressBar
                      value={
                        stats.total
                          ? Math.round((stats.approved / stats.total) * 100)
                          : 0
                      }
                      className="h-2 bg-gray-200"
                    >
                      <span className="sr-only">{`${stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}% phê duyệt`}</span>
                    </ProgressBar>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <Text size="small" className="text-gray-500">
                        Từ chối
                      </Text>
                      <Text size="small" className="text-gray-500">
                        {stats.total
                          ? Math.round((stats.rejected / stats.total) * 100)
                          : 0}
                        %
                      </Text>
                    </div>
                    <ProgressBar
                      value={
                        stats.total
                          ? Math.round((stats.rejected / stats.total) * 100)
                          : 0
                      }
                      className="h-2 bg-gray-200"
                    >
                      <span className="sr-only">{`${stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0}% từ chối`}</span>
                    </ProgressBar>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <Text size="small" className="text-gray-500">
                        Đang xử lý
                      </Text>
                      <Text size="small" className="text-gray-500">
                        {stats.total
                          ? Math.round((stats.pending / stats.total) * 100)
                          : 0}
                        %
                      </Text>
                    </div>
                    <ProgressBar
                      value={
                        stats.total
                          ? Math.round((stats.pending / stats.total) * 100)
                          : 0
                      }
                      className="h-2 bg-gray-200"
                    >
                      <span className="sr-only">{`${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}% đang chờ xử lý`}</span>
                    </ProgressBar>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications to process */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Text size="large" weight="plus" className="text-gray-800">
                  Hồ sơ cần xử lý
                </Text>
                <Text size="small" className="text-gray-500 mt-1">
                  Danh sách hồ sơ đang chờ được xử lý tại cơ quan của bạn
                </Text>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Tìm kiếm hồ sơ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-60"
                />
                <Link href="/dashboard/all-applications">
                  <Button variant="secondary" size="small">
                    Xem tất cả
                    <ChevronRight className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              ) : filteredApplications.length > 0 ? (
                <div>
                  {filteredApplications.map((application) => (
                    <ApplicationToProcessItem
                      key={application.applicationid}
                      application={application}
                      onViewDetail={handleViewApplicationDetail}
                      onProcess={handleProcessApplication}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Text className="text-gray-500 mb-4">
                    {searchTerm
                      ? "Không tìm thấy hồ sơ nào phù hợp với tìm kiếm của bạn."
                      : "Không có hồ sơ nào đang chờ xử lý."}
                  </Text>
                  {searchTerm && (
                    <Button variant="secondary" onClick={() => setSearchTerm("")}>
                      Xóa tìm kiếm
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-300 flex justify-between items-center">
                <div>
                  <Text size="large" weight="plus" className="text-gray-800">
                    Hoạt động gần đây
                  </Text>
                  <Text size="small" className="text-gray-500 mt-1">
                    Các hồ sơ bạn đã xử lý gần đây
                  </Text>
                </div>
              </div>
              <div className="divide-y divide-gray-300">
                {recentActivity.map((activity) => (
                  <RecentActivityItem key={activity.historyid} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-4 space-y-6">
          {/* Today's tasks */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-300">
              <div className="flex justify-between items-center">
                <Text size="base" weight="plus" className="text-gray-800">
                  Nhiệm vụ hôm nay
                </Text>
                <Badge className="bg-gray-200 text-gray-700">
                  {dailyTasksCompleted}/{totalDailyTasks}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              ) : todaysTasks && todaysTasks.length > 0 ? (
                <>
                  <div className="mb-3">
                    <Text size="small" className="text-gray-600">
                      Các hồ sơ cần được xử lý hôm nay ({todaysTasks.length})
                    </Text>
                  </div>
                  {todaysTasks.slice(0, 5).map((application) => (
                    <div 
                      key={application.applicationid} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleViewApplicationDetail(application)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                          {application.isoverdue ? (
                            <ExclamationCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <Text size="small" weight="plus" className="text-gray-800 line-clamp-1">
                            {application.title || application.applicationtypename || "Hồ sơ không xác định"}
                          </Text>
                          <Text size="xsmall" className="text-gray-500">
                            {application.citizenname || application.applicantname || "Chưa có tên người nộp"}
                          </Text>
                        </div>
                      </div>
                      <Badge className={`${application.isoverdue ? "bg-gray-300 text-gray-800" : "bg-gray-200 text-gray-700"}`}>
                        {application.isoverdue ? "Quá hạn" : "Đến hạn"}
                      </Badge>
                    </div>
                  ))}
                  {todaysTasks.length > 5 && (
                    <Button 
                      variant="secondary" 
                      className="w-full mt-2"
                      onClick={() => router.push("/dashboard/pending-applications")}
                    >
                      Xem tất cả {todaysTasks.length} hồ sơ
                    </Button>
                  )}
                </>
              ) : (
                dailyTasks && dailyTasks.length > 0 ? (
                  dailyTasks.map((task) => (
                    <div key={task.taskId} className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : task.status === 'priority' ? (
                          <ExclamationCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Text size="small" weight="plus" className="text-gray-800">
                          {task.title}
                        </Text>
                        <Text size="xsmall" className="text-gray-500">
                          {task.current} / {task.target} hồ sơ
                        </Text>
                      </div>
                      <div>
                        {task.status === 'completed' ? (
                          <Badge className="bg-gray-200 text-gray-700">
                            Hoàn thành
                          </Badge>
                        ) : task.status === 'priority' ? (
                          <Badge className="bg-gray-300 text-gray-800">
                            Ưu tiên
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-300 text-gray-800">
                            Đang xử lý
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Text className="text-gray-500">
                      Không có hồ sơ nào cần xử lý hôm nay
                    </Text>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-300">
              <Text size="base" weight="plus" className="text-gray-800">
                Truy cập nhanh
              </Text>
            </div>
            <div className="p-4 grid grid-cols-1 gap-3">
              <Link
                href="/dashboard/pending-applications"
                className="no-underline flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <Text size="small" weight="plus" className="text-gray-800">
                    Hồ sơ chờ xử lý
                  </Text>
                  <Text size="xsmall" className="text-gray-500">
                    Xem danh sách hồ sơ cần xử lý
                  </Text>
                </div>
                <Badge className="bg-gray-200 text-gray-700 ml-2">
                  {stats.pending}
                </Badge>
              </Link>

              <Link
                href="/dashboard/overdue-applications"
                className="no-underline flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                  <ExclamationCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <Text size="small" weight="plus" className="text-gray-800">
                    Hồ sơ trễ hạn
                  </Text>
                  <Text size="xsmall" className="text-gray-500">
                    Xem các hồ sơ đã quá hạn xử lý
                  </Text>
                </div>
                {stats.overdue > 0 ? (
                  <Badge className="bg-gray-300 text-gray-800 ml-2">
                    {stats.overdue}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-200 text-gray-700 ml-2">0</Badge>
                )}
              </Link>

              <Link
                href="/dashboard/reports"
                className="no-underline flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                  <ChartBar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <Text size="small" weight="plus" className="text-gray-800">
                    Thống kê báo cáo
                  </Text>
                  <Text size="xsmall" className="text-gray-500">
                    Xem thống kê và báo cáo tình hình xử lý
                  </Text>
                </div>
                <ArrrowRight className="w-4 h-4 text-gray-500" />
              </Link>

              <Link
                href="/dashboard/search"
                className="no-underline flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                  <MagnifyingGlass className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <Text size="small" weight="plus" className="text-gray-800">
                    Tra cứu hồ sơ
                  </Text>
                  <Text size="xsmall" className="text-gray-500">
                    Tra cứu hồ sơ theo nhiều tiêu chí
                  </Text>
                </div>
                <ArrrowRight className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>

          {/* Staff Performance (Optional) */}
          {user && (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-300">
                <Text size="base" weight="plus" className="text-gray-800">
                  Hiệu suất làm việc
                </Text>
              </div>
              <div className="p-5 flex flex-col items-center">
                <div className="w-24 h-24 mb-3">
                  <ProgressCircle
                    value={performanceData?.efficiency || 0}
                    className="w-24 h-24"
                    size="large"
                    trackColor="text-gray-200"
                    indicatorColor="text-gray-600"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Text size="xlarge" weight="plus" className="text-gray-800">
                        {Math.round(performanceData?.efficiency || 0)}%
                      </Text>
                    </div>
                  </ProgressCircle>
                </div>
                <Text size="small" weight="plus" className="text-gray-800">
                  Thời gian xử lý trung bình
                </Text>
                <Text size="xsmall" className="text-gray-500 mb-4">
                  {performanceData?.avgProcessingTime.toFixed(1) || "0"} ngày / hồ sơ
                </Text>
                <div className="w-full bg-gray-50 p-3 rounded-lg text-center">
                  <Text size="small" className="text-gray-700 font-medium">
                    Bạn đã xử lý {performanceData?.processedApplications || 0} hồ sơ trong tháng này
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Drawer */}
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
                    <Text className="text-gray-500">Bạn không có thông báo nào</Text>
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
