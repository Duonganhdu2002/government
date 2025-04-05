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
  Alert
} from '@medusajs/ui';
import { Check, Key, XMark } from '@medusajs/icons';
import { apiClient } from '@/lib/api';

/**
 * Profile page for staff users - Read-only personal info with password change functionality
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

  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load agency info on component mount
  useEffect(() => {
    if (user?.agencyId) {
      fetchAgencyInfo(user.agencyId);
    }
  }, [user?.agencyId]);

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
          const agency = response.data.find((a: { agencyid: any; }) => Number(a.agencyid) === Number(agencyId));
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
        <Heading level="h1" className="text-ui-fg-base mb-2">Thông tin cá nhân</Heading>
        <Text className="text-ui-fg-subtle">
          Xem thông tin cá nhân và đổi mật khẩu tài khoản của bạn
        </Text>
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
              <div>
                <Heading level="h2" className="text-lg text-ui-fg-base">
                  Thông tin cán bộ
                </Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Thông tin cơ bản của bạn được hiển thị cho các bộ phận liên quan
                </Text>
              </div>
            </div>
            
            {/* Profile Information - Read Only */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Staff ID */}
                <div>
                  <label htmlFor="staffId" className="block text-ui-fg-subtle mb-1">
                    Mã cán bộ
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
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <Text size="small" className="text-blue-700">
                  Các thông tin cá nhân chỉ có thể được cập nhật bởi quản trị viên hệ thống. 
                  Nếu cần thay đổi, vui lòng liên hệ với quản trị viên.
                </Text>
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
                  <XMark className="text-ui-tag-red-icon" />
                  <Text size="small">{passwordErrors.general}</Text>
                </div>
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert className="mx-6 mt-4" variant="success">
                <div className="flex items-start gap-3">
                  <Check className="text-ui-tag-green-icon" />
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
