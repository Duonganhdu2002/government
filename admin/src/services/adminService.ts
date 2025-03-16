import { getAuthHeaders } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Interface for admin dashboard statistics
 */
export interface AdminDashboardStats {
  totalUsers: number;
  totalApplications: number;
  totalAgencies: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  applicationsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    processing: number;
  };
  userRegistrationTrend: {
    labels: string[];
    data: number[];
  };
  applicationTrend: {
    labels: string[];
    data: number[];
  };
  applicationsByAgency: {
    labels: string[];
    data: number[];
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    lastBackup: string;
    pendingTasks: number;
  };
}

/**
 * Fetch admin dashboard statistics
 */
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin dashboard stats: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response data
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response structure from admin dashboard stats API');
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    // Return default/empty stats when API fails
    return {
      totalUsers: 0,
      totalApplications: 0,
      totalAgencies: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
      applicationsToday: 0,
      applicationsThisWeek: 0,
      applicationsThisMonth: 0,
      applicationsByStatus: {
        pending: 0,
        approved: 0,
        rejected: 0,
        processing: 0
      },
      userRegistrationTrend: {
        labels: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }),
        data: Array(7).fill(0)
      },
      applicationTrend: {
        labels: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }),
        data: Array(7).fill(0)
      },
      applicationsByAgency: {
        labels: [],
        data: []
      },
      systemHealth: {
        status: 'healthy',
        uptime: '0d 0h 0m',
        lastBackup: new Date().toISOString(),
        pendingTasks: 0
      }
    };
  }
};

/**
 * Fetch user registration statistics
 */
export const fetchUserRegistrationStats = async (): Promise<{
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
  monthly: { month: string; count: number }[];
}> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/stats/user-registrations`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user registration stats: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response structure from user registration stats API');
  } catch (error) {
    console.error('Error fetching user registration stats:', error);
    
    // Return default/empty stats when API fails
    const today = new Date();
    const daily = Array(7).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: 0
      };
    });
    
    const weekly = Array(4).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      return {
        week: `Tuần ${4-i}`,
        count: 0
      };
    });
    
    const monthly = Array(6).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        count: 0
      };
    });
    
    return { daily, weekly, monthly };
  }
};

/**
 * Fetch application processing statistics
 */
export const fetchApplicationStats = async (): Promise<{
  byStatus: { status: string; count: number }[];
  byAgency: { agency: string; count: number }[];
  byTime: { period: string; count: number }[];
}> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/stats/applications`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application stats: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response structure from application stats API');
  } catch (error) {
    console.error('Error fetching application stats:', error);
    
    // Return default/empty stats when API fails
    return {
      byStatus: [
        { status: 'Đang chờ', count: 0 },
        { status: 'Đã duyệt', count: 0 },
        { status: 'Từ chối', count: 0 },
        { status: 'Đang xử lý', count: 0 }
      ],
      byAgency: [],
      byTime: [
        { period: 'Hôm nay', count: 0 },
        { period: 'Tuần này', count: 0 },
        { period: 'Tháng này', count: 0 }
      ]
    };
  }
};

/**
 * Fetch system health statistics
 */
export const fetchSystemHealthStats = async (): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastBackup: string;
  pendingTasks: number;
  databaseSize: string;
  memoryUsage: string;
  cpuUsage: string;
  errorLogs: number;
}> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/system/health`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch system health: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response structure from system health API');
  } catch (error) {
    console.error('Error fetching system health:', error);
    
    // Return default stats when API fails
    return {
      status: 'healthy',
      uptime: '0d 0h 0m',
      lastBackup: new Date().toISOString(),
      pendingTasks: 0,
      databaseSize: '0 MB',
      memoryUsage: '0%',
      cpuUsage: '0%',
      errorLogs: 0
    };
  }
}; 