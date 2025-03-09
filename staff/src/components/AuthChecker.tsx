'use client';

import { FC, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Component kiểm tra trạng thái xác thực khi ứng dụng khởi động
 * 
 * Component này nên được đặt trong layout.tsx hoặc providers.tsx
 * để đảm bảo kiểm tra xác thực ngay khi ứng dụng tải
 */
const AuthChecker: FC = () => {
  const { checkAuthState, isAuthenticated } = useAuth();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Đảm bảo chỉ chạy một lần
    if (!hasCheckedRef.current) {
      const checkAuth = async () => {
        console.log('AuthChecker: Checking authentication state...');
        try {
          await checkAuthState();
          console.log('AuthChecker: Authentication check completed.');
        } catch (error) {
          console.error('AuthChecker: Authentication check failed:', error);
        }
        hasCheckedRef.current = true;
      };

      checkAuth();
    }
  }, [checkAuthState]);

  // Component này không render UI nào
  return null;
};

export default AuthChecker; 