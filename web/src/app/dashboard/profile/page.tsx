"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Tabs,
  Skeleton
} from '@medusajs/ui';
import { Check, ChevronRight, User, Calendar, Phone, MapPin, Pencil, Key } from '@medusajs/icons';

// Định nghĩa kiểu dữ liệu cho thông tin người dùng
interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  identityNumber: string;
  bio: string;
  type: string;
}

export default function ProfilePage() {
  // Lấy thông tin người dùng từ context
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // State cho thông tin profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);

  // State cho form
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Lấy thông tin profile khi component được mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  // Hàm lấy thông tin người dùng từ API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Giả lập API call
      setTimeout(() => {
        // Mock data - trong thực tế sẽ gọi API
        const mockProfile: UserProfile = {
          id: user?.id || 1,
          username: user?.username || 'user123',
          name: user?.name || 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phoneNumber: '0123456789',
          address: 'Số 1 Đường Lê Duẩn, Quận Ba Đình, TP. Hà Nội',
          birthDate: '1990-01-01',
          identityNumber: '001090000001',
          bio: 'Công dân Việt Nam.',
          type: user?.type || 'citizen',
        };
        
        setProfile(mockProfile);
        setFormData(mockProfile);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Xử lý thay đổi trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
    
    // Xóa lỗi khi người dùng sửa trường đó
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Hàm validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData) return false;
    
    if (!formData.name.trim()) {
      errors.name = 'Họ tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  // Hàm validate form đổi mật khẩu
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }
    
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
    
    setPasswordErrors(errors);
    
    return Object.keys(errors).length === 0;
  };

  // Xử lý sự kiện lưu thông tin cá nhân
  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Giả lập API call
      setTimeout(() => {
        // Cập nhật profile state
        setProfile(formData);
        setEditMode(false);
        setSuccess('Cập nhật thông tin cá nhân thành công!');
        setSaving(false);
        
        // Clear thông báo thành công sau 3 giây
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }, 1000);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
      setSaving(false);
    }
  };
  
  // Xử lý sự kiện đổi mật khẩu
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setSaving(true);
      
      // Giả lập API call
      setTimeout(() => {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSaving(false);
        
        // Clear thông báo thành công sau 3 giây
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      }, 1000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Không thể đổi mật khẩu. Vui lòng thử lại sau.');
      setSaving(false);
    }
  };
  
  // Xử lý sự kiện thay đổi trong form đổi mật khẩu
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng sửa trường đó
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Format ngày tháng năm sinh
  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return dateString;
    }
  };

  // Hiển thị skeleton khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-40 mb-6" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-20" />
          </div>
          <div>
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8 mb-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Heading level="h1" className="text-ui-fg-base mb-2">Thông tin cá nhân</Heading>
        <Text className="text-ui-fg-subtle">
          Xem và cập nhật thông tin cá nhân của bạn
        </Text>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <Tabs.List>
          <Tabs.Trigger value="personal" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Thông tin cá nhân
          </Tabs.Trigger>
          <Tabs.Trigger value="security" className="flex items-center gap-1">
            <Key className="w-4 h-4" />
            Bảo mật
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      {activeTab === "personal" && (
        <div className="bg-white rounded-lg border border-ui-border-base p-6">
          <div className="flex justify-between items-center mb-6">
            <Heading level="h2" className="text-ui-fg-base">Thông tin chi tiết</Heading>
            {!editMode ? (
              <Button variant="secondary" onClick={() => setEditMode(true)} className="flex items-center gap-1">
                <Pencil className="w-4 h-4" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => {
                  setEditMode(false);
                  setFormData(profile);
                  setFormErrors({});
                }}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="flex items-center gap-1"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  {!saving && <Check className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {editMode ? (
            // Form chỉnh sửa thông tin
            <div className="grid grid-cols-1 gap-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-ui-fg-subtle mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData?.name || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                  {formErrors.name && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="username" className="block text-ui-fg-subtle mb-1">
                    Tên đăng nhập
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData?.username || ''}
                    disabled
                    className="bg-ui-bg-disabled"
                  />
                  <Text className="text-ui-fg-subtle text-xs mt-1">
                    Tên đăng nhập không thể thay đổi
                  </Text>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-ui-fg-subtle mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    placeholder="example@example.com"
                  />
                  {formErrors.email && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-ui-fg-subtle mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData?.phoneNumber || ''}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                  />
                  {formErrors.phoneNumber && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-ui-fg-subtle mb-1">
                  Ngày sinh
                </label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData?.birthDate || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-ui-fg-subtle mb-1">
                  Địa chỉ
                </label>
                <Input
                  id="address"
                  name="address"
                  value={formData?.address || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <div>
                <label htmlFor="identityNumber" className="block text-ui-fg-subtle mb-1">
                  Số CCCD/CMND
                </label>
                <Input
                  id="identityNumber"
                  name="identityNumber"
                  value={formData?.identityNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập số CCCD/CMND"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-ui-fg-subtle mb-1">
                  Giới thiệu bản thân
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData?.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu ngắn về bản thân (không bắt buộc)"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // Hiển thị thông tin
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-2 pb-4 border-b border-ui-border-base">
                <Badge className="mb-2">
                  {profile?.type === 'citizen' ? 'Công dân' : 'Cán bộ'}
                </Badge>
                <Heading level="h3" className="mb-2">{profile?.name}</Heading>
                <Text className="text-ui-fg-subtle mb-2">@{profile?.username}</Text>
                <Text>{profile?.bio || 'Chưa có thông tin giới thiệu.'}</Text>
              </div>

              <div className="space-y-4">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Email</Text>
                  <div className="flex items-center mt-1">
                    <span className="mr-2 text-ui-fg-subtle">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </span>
                    <Text>{profile?.email}</Text>
                  </div>
                </div>

                <div>
                  <Text size="small" className="text-ui-fg-subtle">Số điện thoại</Text>
                  <div className="flex items-center mt-1">
                    <Phone className="mr-2 text-ui-fg-subtle" />
                    <Text>{profile?.phoneNumber}</Text>
                  </div>
                </div>

                <div>
                  <Text size="small" className="text-ui-fg-subtle">Ngày sinh</Text>
                  <div className="flex items-center mt-1">
                    <Calendar className="mr-2 text-ui-fg-subtle" />
                    <Text>{profile?.birthDate ? formatBirthDate(profile.birthDate) : 'Chưa cập nhật'}</Text>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Text size="small" className="text-ui-fg-subtle">Địa chỉ</Text>
                  <div className="flex mt-1">
                    <MapPin className="mr-2 text-ui-fg-subtle flex-shrink-0 mt-0.5" />
                    <Text>{profile?.address || 'Chưa cập nhật'}</Text>
                  </div>
                </div>

                <div>
                  <Text size="small" className="text-ui-fg-subtle">Số CCCD/CMND</Text>
                  <div className="flex items-center mt-1">
                    <span className="mr-2 text-ui-fg-subtle">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <Text>{profile?.identityNumber || 'Chưa cập nhật'}</Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-lg border border-ui-border-base p-6">
          <Heading level="h2" className="text-ui-fg-base mb-6">Đổi mật khẩu</Heading>

          {passwordSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-ui-fg-subtle mb-1">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
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
                <div className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</div>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-ui-fg-subtle mb-1">
                Mật khẩu mới <span className="text-red-500">*</span>
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
                <div className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</div>
              )}
              <Text className="text-ui-fg-subtle text-xs mt-1">
                Mật khẩu phải có ít nhất 8 ký tự
              </Text>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-ui-fg-subtle mb-1">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
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
                <div className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</div>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-1"
              >
                {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                {!saving && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 