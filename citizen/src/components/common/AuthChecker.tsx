'use client';

import { FC, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { commonStrings } from '@/resources';

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
        console.log(commonStrings.logs.auth.checking);
        try {
          await checkAuthState();
          console.log(commonStrings.logs.auth.completed);
        } catch (error) {
          console.error(commonStrings.logs.auth.failed, error);
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