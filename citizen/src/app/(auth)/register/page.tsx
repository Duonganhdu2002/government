"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

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
import { EyeSlash, Eye } from '@medusajs/icons';

/**
 * Register page component
 * Note: Only citizens can register, staff accounts are created by admin
 */
export default function RegisterPage() {
  const router = useRouter();
  const { registerCitizen, error } = useAuth();
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
  const [formError, setFormError] = useState('');

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
    setFormError('');
    
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

      console.log('Submitting registration form with data:', { ...registrationData, password: '***' });
      
      const success = await registerCitizen(registrationData);

      if (success) {
        console.log('Registration successful, redirecting to login');
        
        // Clear any form error and redirect
        setFormError('');
        router.push('/login');
      } else {
        console.log('Registration failed with error:', error);
        setLoading(false);
        setFormError(error || 'Đăng ký không thành công. Vui lòng thử lại sau.');
      }
    } catch (registerError) {
      console.error('Registration error:', registerError);
      setLoading(false);
      setFormError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    }
  };

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
          {(error || formError) && (
            <Alert variant="error" className="mb-4">
              <Text>{formError || error}</Text>
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
              >
                <Select.Trigger>
                  <Select.Value placeholder="Chọn khu vực" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="1">Tp. Hồ Chí Minh</Select.Item>
                  <Select.Item value="2">Hà Nội</Select.Item>
                  <Select.Item value="3">Đà Nẵng</Select.Item>
                  <Select.Item value="4">Cần Thơ</Select.Item>
                  <Select.Item value="5">Khu vực khác</Select.Item>
                </Select.Content>
              </Select>
            </div>

            {/* Account Information Section */}
            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-md font-medium mb-4">Thông tin tài khoản</h3>
              
              {/* Username */}
              <div className="mb-4">
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
                />
              </div>

              {/* Password and Confirm Password */}
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
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
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
                  />
                </div>
              </div>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              isLoading={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-ui-fg-interactive font-medium hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
