"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { UserType } from '@/lib/types/auth.types';
import { apiClient } from '@/lib/api';

// Import Medusa UI components
import {
  Badge,
  Button,
  Text,
  Heading,
  ProgressStatus
} from "@medusajs/ui";

// Icons
import {
  DocumentText,
  Check,
  XMark,
  Clock,
  Plus,
  User as UserIcon,
  BellAlert as BellIcon
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
          {application.name || application.type || 'Application'}
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Ngày nộp: {new Date(application.createdAt || Date.now()).toLocaleDateString('vi-VN')}
        </Text>
      </div>
      <ApplicationStatus status={application.status || 'pending'} />
    </div>
    <div className="mt-4 flex justify-between">
      <Text size="small" className="text-ui-fg-subtle">
        ID: {application.id}
      </Text>
      <Link href={`/dashboard/applications/${application.id}`} className="no-underline">
        <Button variant="secondary" size="small">
          Xem chi tiết
        </Button>
      </Link>
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
  const [recentApplications, setRecentApplications] = useState<Array<{id: number; [key: string]: any}>>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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
        const applicationsResponse = await apiClient.get(`/api/applications?limit=5&page=1&citizenId=${user?.id}`);
        setRecentApplications(applicationsResponse.data?.applications || []);
      } catch (error) {
        console.log('No applications found or error fetching applications:', error);
        setRecentApplications([]);
      }
      
      // Fetch statistics
      try {
        const statsResponse = await apiClient.get(`/api/applications/stats?citizenId=${user?.id}`);
        setStats(statsResponse.data?.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        });
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

  return (
    <div>
      <Text className="text-ui-fg-subtle mb-4">
        Chào mừng {user?.name || user?.username || 'bạn'} đến với Cổng dịch vụ công
      </Text>

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

      {/* Recent applications */}
      <div className="bg-ui-bg-base rounded-lg border border-ui-border-base overflow-hidden mb-8">
        <div className="p-5 border-b border-ui-border-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Text size="large" weight="plus" className="text-ui-fg-base">Hồ sơ gần đây</Text>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Các hồ sơ gần đây bạn đã nộp
            </Text>
          </div>
          <Link href="/dashboard/applications/new" className="no-underline">
            <Button variant="secondary">
              <Plus className="mr-2" />
              Nộp hồ sơ mới
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
                  key={application.id} 
                  application={application} 
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Text className="text-ui-fg-subtle mb-4">
                Bạn chưa có hồ sơ nào. Hãy nộp hồ sơ đầu tiên của bạn!
              </Text>
              <Link href="/dashboard/applications/new" className="no-underline">
                <Button variant="secondary">
                  <Plus className="mr-2" />
                  Nộp hồ sơ mới
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 