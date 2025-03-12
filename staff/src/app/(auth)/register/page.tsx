"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Button,
  Text,
  Input,
  Label,
  Alert,
  Select,
} from "@medusajs/ui";

// Icons
import { XMark, EyeSlash, Eye } from '@medusajs/icons';

// Services & Hooks
import { apiClient } from '@/lib/api';

// Import the AgencySelector component
import AgencySelector from '@/components/AgencySelector';

/**
 * RegisterPage component for staff registration
 */
export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agencyId, setAgencyId] = useState<number>(1);
  const [role, setRole] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Role options with Vietnamese labels
  const roleOptions = [
    { value: 'staff', label: 'Nhân viên' },
    { value: 'admin', label: 'Quản trị viên' }
  ];
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form inputs
    if (!fullname) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    
    if (!agencyId || agencyId <= 0) {
      setError('Vui lòng nhập mã cơ quan hợp lệ');
      return;
    }
    
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/auth/register-staff', {
        fullname: fullname.trim(),
        password,
        agencyid: agencyId,
        role
      });
      
      if (response?.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response?.message || 'Đã xảy ra lỗi khi đăng ký');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Extract the error message from the API response if available
      if (err.data && err.data.message) {
        setError(err.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <Alert
            title="Đăng ký thành công"
            variant="success"
            className="mb-4"
          >
            Tài khoản đã được tạo thành công! Đang chuyển hướng đến trang đăng nhập...
          </Alert>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Đi đến trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Title Section */}
        <div className="bg-white px-8 py-6">
          <h2 className="text-xl font-medium text-center">Đăng ký - Cán bộ</h2>
          <p className="text-center text-gray-500 text-sm mt-3">
            Điền thông tin để tạo tài khoản cán bộ mới
          </p>
        </div>
        
        {/* Form Section */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          {error && (
            <Alert
              title="Lỗi đăng ký"
              variant="error"
              className="mb-6"
            >
              <p className="font-medium">{error}</p>
              {error.includes("cơ quan") && (
                <p className="text-sm mt-1">Vui lòng kiểm tra lại mã cơ quan của bạn.</p>
              )}
              <button 
                onClick={() => setError(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <XMark />
              </button>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullname" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                HỌ VÀ TÊN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullname"
                placeholder="Nhập họ và tên"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="w-full"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
            
            {/* Agency ID */}
            <div>
              <Label htmlFor="agencyId" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                MÃ CƠ QUAN <span className="text-red-500">*</span>
              </Label>
              <AgencySelector
                value={agencyId}
                onChange={setAgencyId}
              />
            </div>
            
            {/* Role */}
            <div>
              <Label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                VAI TRÒ <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value)}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Chọn vai trò" />
                </Select.Trigger>
                <Select.Content>
                  {roleOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            
            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                MẬT KHẨU <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                  style={{ borderColor: '#e5e7eb' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeSlash className="text-gray-400" /> : <Eye className="text-gray-400" />}
                </button>
              </div>
            </div>
            
            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                NHẬP LẠI MẬT KHẨU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
          
            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              isLoading={loading}
            >
              Đăng ký
            </Button>
            
            {/* Login Link */}
            <div className="text-center">
              <Text className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Đăng nhập
                </Link>
              </Text>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
