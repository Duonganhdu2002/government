"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';

// Import Medusa UI components
import {
  Button,
  Text,
  Input,
  Label,
  Alert,
  Select,
  Textarea
} from "@medusajs/ui";

// Icons
import { EyeSlash, Eye, XMark } from '@medusajs/icons';

/**
 * Register page component
 * Note: Only citizens can register, staff accounts are created by admin
 */
export default function RegisterPage() {
  const router = useRouter();
  const { registerCitizen, error, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [fullname, setFullname] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [areaCode, setAreaCode] = useState(1); // Default to first area
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Show API errors in the form
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    if (!fullname || !identificationNumber || !username || !password) {
      setFormError('Vui lòng điền đầy đủ thông tin bắt buộc (tên, số CMND/CCCD, tên đăng nhập và mật khẩu)');
      return;
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Password complexity check
    if (password.length < 8) {
      setFormError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    // Phone number format check
    if (phoneNumber && !/^0\d{9,10}$/.test(phoneNumber)) {
      setFormError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại bắt đầu bằng 0 và có 10-11 chữ số');
      return;
    }

    // Email format check
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Địa chỉ email không hợp lệ');
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      const registrationData = {
        fullname,
        identificationnumber: identificationNumber,
        address,
        phonenumber: phoneNumber,
        email,
        username,
        password,
        areacode: Number(areaCode)
      };
      
      const success = await registerCitizen(registrationData);

      if (success) {
        // Show success message and redirect to login
        router.push('/login?registered=true');
      }
      // Error handling is now done via the useEffect hook that monitors the error state
    } catch (registerError: any) {
      // This is a fallback for any uncaught errors
      setFormError(registerError?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if the form is in a loading state
  const isFormLoading = loading || authLoading;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Title Section (White Background) */}
        <div className="bg-white px-8 py-6">
          <h2 className="text-xl font-medium text-center">Đăng ký tài khoản công dân</h2>
          <p className="text-center text-gray-500 text-sm mt-3">
            Điền thông tin cá nhân để tạo tài khoản sử dụng dịch vụ công
          </p>
        </div>

        {/* Form Section (Gray Background) */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          {/* Information message */}
          <Alert variant="info" className="mb-6">
            <Text>Chỉ công dân mới có thể đăng ký tài khoản. Tài khoản cán bộ được tạo bởi quản trị viên.</Text>
          </Alert>
          
          {/* Error messages */}
          {formError && (
            <Alert variant="error" className="mb-4">
              <div className="flex items-start">
                <XMark className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <Text>{formError}</Text>
              </div>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullname" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full"
                  disabled={isFormLoading}
                />
              </div>

              {/* Identification Number */}
              <div>
                <Label htmlFor="identificationNumber" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                  Số CMND/CCCD <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="identificationNumber"
                  name="identificationNumber"
                  type="text"
                  placeholder="012345678901"
                  required
                  value={identificationNumber}
                  onChange={(e) => setIdentificationNumber(e.target.value)}
                  className="w-full"
                  disabled={isFormLoading}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                Địa chỉ
              </Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
                disabled={isFormLoading}
              />
            </div>

            {/* Contact Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <Label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                  Số điện thoại
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                  disabled={isFormLoading}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={isFormLoading}
                />
              </div>
            </div>

            {/* Area Code */}
            <div>
              <Label htmlFor="areaCode" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                Khu vực <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={areaCode.toString()} 
                onValueChange={(value) => setAreaCode(parseInt(value))}
                disabled={isFormLoading}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Chọn khu vực" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="1">Thành phố Hà Nội</Select.Item>
                  <Select.Item value="2">Thành phố Hồ Chí Minh</Select.Item>
                  <Select.Item value="3">Thành phố Đà Nẵng</Select.Item>
                  <Select.Item value="4">Tỉnh Bình Dương</Select.Item>
                  <Select.Item value="5">Tỉnh Đồng Nai</Select.Item>
                </Select.Content>
              </Select>
            </div>

            {/* Account Information Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Thông tin tài khoản</h3>
              
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <Label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                    disabled={isFormLoading}
                  />
                </div>

                {/* Password & Confirm Password fields side-by-side on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10"
                        disabled={isFormLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                        disabled={isFormLoading}
                      >
                        {showPassword ? (
                          <EyeSlash className="text-gray-400" />
                        ) : (
                          <Eye className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isFormLoading}
                disabled={isFormLoading}
              >
                {isFormLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-ui-fg-interactive font-medium hover:underline">
              Đăng nhập ngay.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
