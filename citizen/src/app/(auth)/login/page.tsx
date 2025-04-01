"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { UserType } from '@/types';
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
 * Login page component
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const router = useRouter();
  const { login, isAuthenticated, error, loading: authLoading } = useAuth();

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
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form inputs
    if (!username || !password) {
      setFormError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      const success = await login({
        username,
        password,
        userType: UserType.CITIZEN, // Use the enum for citizen portal
      });

      if (success) {
        router.push('/dashboard');
      }
      // Note: error handling is now in the useAuth hook and displayed via useEffect
    } catch (loginError: any) {
      // This is a fallback for any uncaught errors
      setFormError(loginError?.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
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

  // Determine if the form is in a loading state
  const isFormLoading = loading || authLoading;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Title Section (White Background) */}
        <div className="bg-white px-8 py-6">
          <h2 className="text-xl font-medium text-center">Đăng nhập</h2>
          <p className="text-center text-gray-500 text-sm mt-3">
            Nhập tên đăng nhập và mật khẩu để truy cập hệ thống
          </p>
        </div>

        {/* Form Section (Gray Background) */}
        <div className="bg-gray-50 px-8 py-6 border-t">
        
          {/* Error alert */}
          {formError && (
            <Alert variant="error" className="mb-4">
              <div className="flex items-start">
                <XMark className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <Text>{formError}</Text>
              </div>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field */}
            <div>
              <Label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="tên đăng nhập của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                style={{ borderColor: '#e5e7eb' }}
                disabled={isFormLoading}
              />
            </div>

            {/* Password field */}
            <div>
              <Label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2 uppercase">
                Mật khẩu <span className="text-red-500">*</span>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" name="remember-me" disabled={isFormLoading} />
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
              isLoading={isFormLoading}
              disabled={isFormLoading}
            >
              {isFormLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-ui-fg-interactive font-medium hover:underline">
              Đăng ký miễn phí.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 