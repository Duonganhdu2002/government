"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
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
import { updateUserProfile } from '@/store/authSlice';
import { apiClient } from '@/lib/api';

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
  // Lấy thông tin người dùng từ Redux store
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const dispatch = useAppDispatch();

  // State cho thông tin profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);

  // Ref để theo dõi trạng thái fetch và tránh fetch dữ liệu liên tục
  const fetchingProfileRef = useRef(false);
  const lastFetchedUserIdRef = useRef<number | null>(null);

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

  // Hàm chuyển đổi từ User trong Redux sang UserProfile
  const mapUserToProfile = useCallback((userData: any): UserProfile => {
    // Lấy thông tin mở rộng từ localStorage nếu có
    let extendedData = { birthDate: '1990-01-01', bio: '' };
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('userProfileExtended');
        if (savedData) {
          extendedData = { ...extendedData, ...JSON.parse(savedData) };
        }
      }
    } catch (error) {
      console.error('Error loading extended profile from localStorage:', error);
    }

    return {
      id: userData.id || 1,
      username: userData.username || '',
      name: userData.name || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      address: userData.address || '',
      birthDate: extendedData.birthDate,
      identityNumber: userData.identificationNumber || '',
      bio: extendedData.bio,
      type: userData.type || 'citizen',
    };
  }, []);

  // Hàm chuyển đổi từ response API sang UserProfile
  const mapApiResponseToProfile = useCallback((apiData: any): UserProfile => {
    console.log('Mapping API data to profile:', apiData);
    
    if (!apiData) {
      console.warn('API data is null or undefined, using fallback data');
      const fallbackData: UserProfile = {
        id: user?.id || 1,
        username: user?.username || '',
        name: (user?.type === 'citizen' ? (user as any).name : '') || '',
        email: (user?.type === 'citizen' ? (user as any).email : '') || '',
        phoneNumber: (user?.type === 'citizen' ? (user as any).phoneNumber : '') || '',
        address: (user?.type === 'citizen' ? (user as any).address : '') || '',
        birthDate: '1990-01-01',
        identityNumber: (user?.type === 'citizen' ? (user as any).identificationNumber : '') || '',
        bio: '',
        type: user?.type || 'citizen',
      };
      return fallbackData;
    }
    
    let extendedData = { birthDate: '1990-01-01', bio: '' };
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('userProfileExtended');
        if (savedData) {
          extendedData = { ...extendedData, ...JSON.parse(savedData) };
        }
      }
    } catch (error) {
      console.error('Error loading extended profile from localStorage:', error);
    }
    
    const userData = apiData.data ? apiData.data : apiData;
    
    return {
      id: userData.id || userData.citizenid || user?.id || 1,
      username: userData.username || userData.Username || '',
      name: userData.name || userData.fullname || userData.FullName || '',
      email: userData.email || userData.Email || '',
      phoneNumber: userData.phoneNumber || userData.phonenumber || userData.PhoneNumber || '',
      address: userData.address || userData.Address || '',
      birthDate: userData.birthDate || userData.dateOfBirth || extendedData.birthDate,
      identityNumber: userData.identityNumber || userData.identificationnumber || userData.IdentificationNumber || '',
      bio: userData.bio || userData.Bio || extendedData.bio,
      type: userData.type || user?.type || 'citizen',
    };
  }, [user]);
  
  // Hàm lấy thông tin chi tiết người dùng từ API
  const fetchUserProfile = useCallback(async () => {
    if (fetchingProfileRef.current) {
      return; // Prevent concurrent fetches
    }
    
    fetchingProfileRef.current = true;
    let mainEndpointFailed = false;
    
    try {
      if (!profile) {
        setLoading(true);
      }
      
      let response = null;
      let error = null;
      
      // Try the primary endpoint (/api/auth/me) first
      try {
        console.log('Attempting to fetch user profile from /api/auth/me');
        response = await apiClient.get('/api/auth/me');
        console.log('Successfully fetched profile from /api/auth/me');
      } catch (err) {
        console.warn('Error fetching user profile from /api/auth/me:', err);
        error = err;
        mainEndpointFailed = true;
      }
      
      // If the primary endpoint failed and we have a user ID, try the fallback endpoint
      if (mainEndpointFailed && user && user.id) {
        try {
          console.log('Primary endpoint failed. Trying fallback endpoint with user ID:', user.id);
          
          // Use a different endpoint that doesn't have the imagelink issue
          response = await apiClient.get(`/api/citizens/${user.id}`);
          console.log('Successfully fetched profile from fallback endpoint');
          error = null; // Clear the error if fallback succeeds
        } catch (fallbackErr) {
          console.error('Fallback endpoint also failed:', fallbackErr);
          // Keep the original error if both endpoints fail
          if (!error) {
            error = fallbackErr;
          }
        }
      }
      
      // If we have a successful response with data
      if (response && response.data) {
        console.log('Processing profile data:', response.data);
        // Ensure we're working with the actual user data object
        const userData = response.data.data ? response.data.data : response.data;
        console.log('Mapping API data to profile:', userData);
        
        try {
          const profileData = mapApiResponseToProfile(userData);
          setProfile(profileData);
          setFormData(profileData);
          
          try {
            localStorage.setItem('userProfileExtended', JSON.stringify({
              birthDate: userData.birthDate || userData.dateOfBirth || '1990-01-01',
              bio: userData.bio || ''
            }));
          } catch (storageError) {
            console.error('Error caching profile data:', storageError);
          }
          
          // Update user information in Redux if needed
          if (user && user.type === 'citizen') {
            const hasSignificantChanges = (
              (user as any).name !== userData.fullname ||
              (user as any).email !== userData.email ||
              (user as any).phoneNumber !== userData.phonenumber ||
              (user as any).address !== userData.address
            );
              
            if (hasSignificantChanges) {
              dispatch(updateUserProfile({
                name: userData.fullname || userData.name,
                email: userData.email,
                phoneNumber: userData.phonenumber || userData.phoneNumber,
                address: userData.address,
                identificationNumber: userData.identificationnumber || userData.identityNumber
              }));
            }
          }
          
          if (user) {
            lastFetchedUserIdRef.current = user.id;
          }
        } catch (mappingError) {
          console.error('Error mapping API response to profile:', mappingError);
          throw mappingError;
        }
      } else if (error) {
        // If both endpoints failed, use basic profile from auth state
        console.error('Failed to fetch profile from any endpoint. Using basic profile from auth.');
        if (user) {
          const basicProfile = mapUserToProfile(user);
          setProfile(basicProfile);
          setFormData(basicProfile);
          
          // Store the basic information so we don't keep retrying failed requests
          if (user.id) {
            lastFetchedUserIdRef.current = user.id;
          }
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      // Don't throw here - we want to recover gracefully
    } finally {
      setLoading(false);
      fetchingProfileRef.current = false;
    }
  }, [user, profile, dispatch, mapApiResponseToProfile, mapUserToProfile]);

  // Lấy thông tin profile từ Redux store khi component được mount hoặc user thay đổi
  useEffect(() => {
    let isMounted = true;
    
    const initializeProfile = async () => {
      if (isAuthenticated && user && isMounted) {
        setProfile(mapUserToProfile(user));
        setFormData(mapUserToProfile(user));
        setLoading(false);
        
        if (lastFetchedUserIdRef.current !== user.id && !fetchingProfileRef.current) {
          await fetchUserProfile();
        }
      }
    };
    
    initializeProfile();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Xử lý thay đổi trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'identityNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => prev ? { ...prev, [name]: numericValue } : null);
      
      if (numericValue && (numericValue.length < 9 || numericValue.length > 12)) {
        setFormErrors(prev => ({ ...prev, [name]: 'Số CCCD/CMND phải có từ 9 đến 12 chữ số' }));
      } else {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData(prev => prev ? { ...prev, [name]: value } : null);
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
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
    
    if (formData.identityNumber) {
      const digitsOnly = formData.identityNumber.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 12) {
        errors.identityNumber = 'Số CCCD/CMND phải có từ 9 đến 12 chữ số';
      }
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
    
    let requestSuccess = false;
    
    try {
      setSaving(true);
      setError('');
      
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      let formattedIdentificationNumber = formData?.identityNumber || '';
      formattedIdentificationNumber = formattedIdentificationNumber.replace(/\D/g, '');
      
      if (formattedIdentificationNumber.length < 9 || formattedIdentificationNumber.length > 12) {
        setError('Số CCCD/CMND phải có từ 9 đến 12 chữ số');
        setSaving(false);
        return;
      }
      
      const profileData = {
        fullname: formData?.name,
        email: formData?.email,
        phonenumber: formData?.phoneNumber,
        address: formData?.address,
        identificationnumber: formattedIdentificationNumber
      };
      
      console.log('Sending profile data:', profileData);
      
      const maxRetries = 5;
      let retryCount = 0;
      let updateSuccess = false;
      let lastError: any;
      
      while (retryCount <= maxRetries && !updateSuccess) {
        try {
          const timeout = 60000; // 60 seconds timeout
          const response = await apiClient.patch(`/api/citizens/${user.id}`, profileData);
          
          updateSuccess = true;
          requestSuccess = true;
          
          const userData = response.data ? response.data : response;
          console.log('Profile update response structure:', {
            hasDataProperty: !!response.data,
            responseKeys: Object.keys(response),
            userData
          });
          
          setProfile(mapApiResponseToProfile(userData));
          
          if (user && user.id) {
            dispatch(updateUserProfile({
              name: userData.fullname || userData.name,
              email: userData.email,
              phoneNumber: userData.phonenumber || userData.phoneNumber,
              address: userData.address,
              identificationNumber: userData.identificationnumber || userData.identityNumber
            }));
            lastFetchedUserIdRef.current = user.id;
          }
          
          try {
            localStorage.setItem('userProfileExtended', JSON.stringify({
              birthDate: formData?.birthDate || '1990-01-01',
              bio: formData?.bio || ''
            }));
          } catch (error) {
            console.error('Error saving extended profile to localStorage:', error);
          }
          
          setEditMode(false);
          setSuccess('Cập nhật thông tin cá nhân thành công!');
        } catch (err: any) {
          lastError = err;
          console.error(`Attempt ${retryCount + 1} failed:`, err);
          
          const shouldRetry = 
            (err.message && (err.message.includes('timeout') || err.message.includes('terminated'))) ||
            (err.message && err.message.includes('connection')) ||
            (err.status === 503) ||
            (err.status === 408) ||
            (err.status === 504);
            
          if (shouldRetry && retryCount < maxRetries) {
            retryCount++;
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`Retrying... Attempt ${retryCount} of ${maxRetries} after ${backoffDelay}ms`);
            setError(`Đang thử lại... Lần ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          } else {
            break;
          }
        }
      }
      
      if (!updateSuccess) {
        console.error('All attempts failed:', lastError);
        if (lastError && lastError.data && lastError.data.missingFields) {
          setError(`Thiếu các trường bắt buộc: ${lastError.data.missingFields.join(', ')}`);
        } else if (lastError && lastError.message && (lastError.message.includes('timeout') || lastError.status === 408)) {
          setError('Quá thời gian phản hồi từ máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        } else if (lastError && lastError.message) {
          setError(lastError.message || 'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
        } else {
          setError('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
        }
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
      if (requestSuccess) {
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    }
  };

  // Xử lý sự kiện đổi mật khẩu
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setSaving(true);
      setError('');
      
      const passwordData = {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      
      const response = await apiClient.post('/api/auth/change-password', passwordData);
      
      if (response && (response.status === 'success' || response.success)) {
        setPasswordSuccess(response.message || 'Đổi mật khẩu thành công!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response?.message || 'Đổi mật khẩu không thành công');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
      if (passwordSuccess) {
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      }
    }
  };
  
  // Xử lý sự kiện thay đổi trong form đổi mật khẩu
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
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
