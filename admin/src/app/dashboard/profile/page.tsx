"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Heading,
  Text,
  Button,
  Input,
  Tabs,
  Skeleton,
  Alert,
  Badge,
  Container,
  IconButton,
  Table
} from '@medusajs/ui';
import { Check, Key, XMark, Users, DocumentText, Buildings, Calendar } from '@medusajs/icons';
import { apiClient } from '@/lib/api';

/**
 * Profile page for admin users - Read-only personal info with password change functionality
 * and admin dashboard stats
 */
export default function ProfilePage() {
  // Get user from auth state
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // State for profile management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("personal");
  const [agencyName, setAgencyName] = useState('Đang tải...');
  
  // Admin stats
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalApplications: 0,
    totalAgencies: 0,
    lastLogin: ''
  });
  
  // Login history
  const [loginHistory, setLoginHistory] = useState([]);

  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load agency info, admin stats, and login history on component mount
  useEffect(() => {
    if (user?.id) {
      fetchAgencyInfo(user.agencyId);
      fetchAdminStats();
      fetchLoginHistory(user.id);
    }
  }, [user?.id, user?.agencyId]);

  // Fetch admin dashboard statistics
  const fetchAdminStats = async () => {
    try {
      // Call the backend API for admin stats
      let statsUrl = '/api/staff/admin/dashboard-stats';
      
      // Add user ID if available to get personalized last login time
      if (user?.id) {
        statsUrl = `/api/staff/admin/dashboard-stats/${user.id}`;
      }
      
      // Fetch data from backend
      const response = await apiClient.get(statsUrl);
      console.log('Admin stats response:', response);
      
      // Handle API response
      if (response?.status === 'success' && response?.data) {
        setStats({
          totalStaff: response.data.totalStaff || 0,
          totalApplications: response.data.totalApplications || 0,
          totalAgencies: response.data.totalAgencies || 0,
          lastLogin: response.data.lastLogin 
            ? new Date(response.data.lastLogin).toLocaleString('vi-VN')
            : new Date().toLocaleString('vi-VN')
        });
      } else {
        // Fallback to default values if API fails
        console.error('Invalid stats response format:', response);
        setStats({
          totalStaff: 0,
          totalApplications: 0,
          totalAgencies: 0,
          lastLogin: new Date().toLocaleString('vi-VN')
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Set default values on error
      setStats({
        totalStaff: 0,
        totalApplications: 0,
        totalAgencies: 0,
        lastLogin: new Date().toLocaleString('vi-VN')
      });
    }
  };
  
  // Fetch login history for current user
  const fetchLoginHistory = async (userId: number) => {
    try {
      const response = await apiClient.get(`/api/staff/admin/login-history/${userId}`);
      console.log('Login history response:', response);
      
      if (response?.status === 'success' && response?.data?.history) {
        setLoginHistory(response.data.history);
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
      setLoginHistory([]);
    }
  };

  // Fetch agency information
  const fetchAgencyInfo = async (agencyId: number) => {
    try {
      setLoading(true);
      console.log('Fetching agency info for ID:', agencyId);
      
      // Use the base endpoint instead of trying to fetch a specific agency by ID
      const response = await apiClient.get('/api/agencies');
      console.log('Agency API response:', response);
      
      // Handle different API response formats
      if (Array.isArray(response)) {
        // Response is an array of agencies (most likely case based on screenshot)
        const agency = response.find(a => Number(a.agencyid) === Number(agencyId));
        if (agency) {
          console.log('Found agency in array:', agency);
          setAgencyName(agency.agencyname || agency.name || 'Không xác định');
        } else {
          console.log('Agency not found in array response');
          setAgencyName('Không tìm thấy cơ quan với mã ' + agencyId);
        }
      } else if (response && (response.agencyname || response.name)) {
        // Direct object response
        console.log('Direct agency object response:', response);
        setAgencyName(response.agencyname || response.name);
      } else if (response && response.data) {
        // Nested data response
        console.log('Nested data response:', response.data);
        if (Array.isArray(response.data)) {
          const agency = response.data.find((a: any) => Number(a.agencyid) === Number(agencyId));
          if (agency) {
            console.log('Found agency in nested array:', agency);
            setAgencyName(agency.agencyname || agency.name || 'Không xác định');
          } else {
            console.log('Agency not found in nested array');
            setAgencyName('Không tìm thấy cơ quan với mã ' + agencyId);
          }
        } else if (response.data.agencyname || response.data.name) {
          setAgencyName(response.data.agencyname || response.data.name);
        } else {
          console.log('Unexpected response format:', response);
          setAgencyName('Không tìm thấy thông tin cơ quan');
        }
      } else {
        // Fallback to full response for unhandled formats
        console.log('Unhandled response format:', response);
        
        // Try to extract agency data from any possible format
        if (response?.[0]?.agencyname) {
          setAgencyName(response[0].agencyname);
        } else {
          setAgencyName('Không tìm thấy thông tin cơ quan');
        }
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
      setAgencyName('Lỗi tải thông tin cơ quan');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validate password fields
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setSaving(true);
      console.log('Sending staff password change request with staffId:', user?.id);
      
      // Call the dedicated staff password change endpoint
      const response = await apiClient.post('/api/auth/staff-change-password', {
        staffId: user?.id,
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      console.log('Staff password change response:', response);
      
      if (response) {
        setPasswordSuccess('Đổi mật khẩu thành công');
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Staff password change failed:', error);
      
      // Try to extract useful error information
      let errorMessage = 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      
      if (error?.message) {
        console.log('Password change error details:', error.message);
        errorMessage = error.message;
      }
      
      if (error?.data?.error) {
        console.log('Password change API error:', error.data.error);
        errorMessage = error.data.error;
      }
      
      if (error?.data?.message) {
        console.log('Password change API message:', error.data.message);
        errorMessage = error.data.message;
      }
      
      setPasswordErrors({
        general: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Loading state
  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="w-1/3 h-8 mb-4" />
        <Skeleton className="w-full h-[200px] mb-4" />
        <Skeleton className="w-full h-[400px]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level="h1" className="text-ui-fg-base mb-2">Trang quản trị viên</Heading>
        <Text className="text-ui-fg-subtle">
          Xem thông tin cá nhân, thống kê hệ thống và quản lý tài khoản của bạn
        </Text>
      </div>

      {/* Admin Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-ui-border-base p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <Users className="text-gray-700 mr-2" />
            <Text className="text-ui-fg-subtle">Nhân viên</Text>
          </div>
          <Heading level="h3" className="text-2xl font-bold">{stats.totalStaff}</Heading>
        </div>
        
        <div className="bg-white rounded-lg border border-ui-border-base p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <DocumentText className="text-gray-700 mr-2" />
            <Text className="text-ui-fg-subtle">Hồ sơ</Text>
          </div>
          <Heading level="h3" className="text-2xl font-bold">{stats.totalApplications}</Heading>
        </div>
        
        <div className="bg-white rounded-lg border border-ui-border-base p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <Buildings className="text-gray-700 mr-2" />
            <Text className="text-ui-fg-subtle">Cơ quan</Text>
          </div>
          <Heading level="h3" className="text-2xl font-bold">{stats.totalAgencies}</Heading>
        </div>
        
        <div className="bg-white rounded-lg border border-ui-border-base p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <Calendar className="text-gray-700 mr-2" />
            <Text className="text-ui-fg-subtle">Đăng nhập</Text>
          </div>
          <Text className="text-sm mt-1">{stats.lastLogin}</Text>
        </div>
      </div>
      
      {/* Login History Section */}
      <div className="bg-white rounded-lg border border-ui-border-base p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level="h2" className="text-lg text-ui-fg-base">
              Lịch sử đăng nhập
            </Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Các lần đăng nhập gần đây vào hệ thống
            </Text>
          </div>
        </div>
        
        {loginHistory.length > 0 ? (
          <Table className="border border-ui-border-base">
            <Table.Header className="bg-gray-50">
              <Table.Row>
                <Table.HeaderCell className="w-1/4">Thời gian</Table.HeaderCell>
                <Table.HeaderCell className="w-1/4">Địa chỉ IP</Table.HeaderCell>
                <Table.HeaderCell className="w-2/4">Trình duyệt</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loginHistory.map((entry: any) => (
                <Table.Row key={entry.id}>
                  <Table.Cell>
                    {new Date(entry.login_time).toLocaleString('vi-VN')}
                  </Table.Cell>
                  <Table.Cell>{entry.ip_address}</Table.Cell>
                  <Table.Cell className="truncate max-w-xs">{entry.user_agent}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded">
            <Text className="text-ui-fg-subtle">Không có lịch sử đăng nhập</Text>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="personal">Thông tin cá nhân</Tabs.Trigger>
          <Tabs.Trigger value="security">Bảo mật</Tabs.Trigger>
        </Tabs.List>
        
        {/* Personal Information Tab */}
        <Tabs.Content value="personal" className="pt-4">
          <div className="bg-white rounded-lg border border-ui-border-base overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-ui-border-base">
              <div className="flex items-center">
                <div>
                  <Heading level="h2" className="text-lg text-ui-fg-base">
                    Thông tin quản trị viên
                  </Heading>
                  <Text size="small" className="text-ui-fg-subtle mt-1">
                    Thông tin cá nhân và quyền hạn của bạn trong hệ thống
                  </Text>
                </div>
                <Badge className="ml-auto bg-gray-200 text-gray-800">Quản trị viên</Badge>
              </div>
            </div>
            
            {/* Profile Information - Read Only */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Staff ID */}
                <div>
                  <label htmlFor="staffId" className="block text-ui-fg-subtle mb-1">
                    Mã quản trị viên
                  </label>
                  <Input
                    id="staffId"
                    value={user.id || ''}
                    readOnly
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                </div>
                
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-ui-fg-subtle mb-1">
                    Vai trò
                  </label>
                  <Input
                    id="role"
                    value={user.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}
                    readOnly
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                </div>
                
                {/* Agency ID */}
                <div>
                  <label htmlFor="agencyId" className="block text-ui-fg-subtle mb-1">
                    Mã cơ quan
                  </label>
                  <Input
                    id="agencyId"
                    value={user.agencyId || ''}
                    readOnly
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                </div>
                
                {/* Agency Name */}
                <div>
                  <label htmlFor="agencyName" className="block text-ui-fg-subtle mb-1">
                    Tên cơ quan
                  </label>
                  <Input
                    id="agencyName"
                    value={agencyName}
                    readOnly
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                </div>
                
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-ui-fg-subtle mb-1">
                    Họ và tên
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={user.name || ''}
                    readOnly
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                </div>
              </div>
              
              {/* Admin privileges info */}
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <Heading level="h3" className="text-sm text-gray-700 mb-2">Quyền hạn quản trị viên</Heading>
                <ul className="list-disc list-inside text-gray-700">
                  <li className="text-sm">Quản lý người dùng và nhân viên</li>
                  <li className="text-sm">Phân quyền và phê duyệt</li>
                  <li className="text-sm">Truy cập báo cáo và thống kê hệ thống</li>
                  <li className="text-sm">Cấu hình và quản lý cơ quan</li>
                </ul>
              </div>
            </div>
          </div>
        </Tabs.Content>
        
        {/* Security Tab */}
        <Tabs.Content value="security" className="pt-4">
          <div className="bg-white rounded-lg border border-ui-border-base overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-ui-border-base">
              <Heading level="h2" className="text-lg text-ui-fg-base">
                Thay đổi mật khẩu
              </Heading>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                Cập nhật mật khẩu đăng nhập của bạn
              </Text>
            </div>
            
            {/* Error and Success Messages */}
            {passwordErrors.general && (
              <Alert className="mx-6 mt-4" variant="error">
                <div className="flex items-start gap-3">
                  <XMark className="text-gray-700" />
                  <Text size="small">{passwordErrors.general}</Text>
                </div>
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert className="mx-6 mt-4" variant="success">
                <div className="flex items-start gap-3">
                  <Check className="text-gray-700" />
                  <Text size="small">{passwordSuccess}</Text>
                </div>
              </Alert>
            )}
            
            {/* Password Form */}
            <form onSubmit={handlePasswordChange} className="p-6">
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-ui-fg-subtle mb-1">
                  Mật khẩu hiện tại <span className="text-ui-tag-red-icon">*</span>
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {passwordErrors.currentPassword && (
                  <Text size="small" className="text-ui-tag-red-text mt-1">
                    {passwordErrors.currentPassword}
                  </Text>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-ui-fg-subtle mb-1">
                  Mật khẩu mới <span className="text-ui-tag-red-icon">*</span>
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Nhập mật khẩu mới"
                />
                {passwordErrors.newPassword && (
                  <Text size="small" className="text-ui-tag-red-text mt-1">
                    {passwordErrors.newPassword}
                  </Text>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-ui-fg-subtle mb-1">
                  Xác nhận mật khẩu mới <span className="text-ui-tag-red-icon">*</span>
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
                {passwordErrors.confirmPassword && (
                  <Text size="small" className="text-ui-tag-red-text mt-1">
                    {passwordErrors.confirmPassword}
                  </Text>
                )}
              </div>
              
              <Button
                type="submit"
                variant="primary"
                className="mt-2"
                isLoading={saving}
              >
                <Key className="mr-2" />
                Cập nhật mật khẩu
              </Button>
            </form>
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
