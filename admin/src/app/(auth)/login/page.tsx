"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';

// Import Medusa UI components
import {
  Button,
  Text,
  Input,
  Label,
  Checkbox,
  Alert,
} from "@medusajs/ui";

// Icons
import { XMark, EyeSlash, Eye } from '@medusajs/icons';

/**
 * Login page component for admin users
 */
export default function LoginPage() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginStaff, error } = useAuth();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!staffId) {
      alert('Vui lòng nhập ID nhân viên');
      return;
    }
    
    if (!password) {
      alert('Vui lòng nhập mật khẩu');
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Ensure staffId is a number
      const staffIdNum = parseInt(staffId, 10);
      
      if (isNaN(staffIdNum)) {
        throw new Error('ID nhân viên phải là số');
      }
      
      const success = await loginStaff({
        staffId: staffIdNum,
        password: password.trim(),
      });

      if (success) {
        router.push('/dashboard');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
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

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Title Section */}
        <div className="bg-white px-8 py-6">
          <h2 className="text-xl font-medium text-center">Đăng nhập - Quản trị viên</h2>
          <p className="text-center text-gray-500 text-sm mt-3">
            Nhập ID nhân viên và mật khẩu để truy cập hệ thống quản trị
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          {error && (
            <Alert variant="error" className="mb-4">
              <Text>{error}</Text>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Staff ID field */}
            <div>
              <Label htmlFor="staffId" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                ID NHÂN VIÊN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="staffId"
                name="staffId"
                type="number"
                autoComplete="off"
                required
                placeholder="Nhập ID nhân viên của bạn"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>

            {/* Password field */}
            <div>
              <Label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                MẬT KHẨU <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  style={{ borderColor: '#e5e7eb' }}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" name="remember-me" />
                <Label htmlFor="remember-me" className="!mb-0 text-sm">
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              <div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              isLoading={loading}
            >
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 