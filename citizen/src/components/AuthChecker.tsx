'use client';

import { FC, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Component that checks authentication state when the application loads
 * 
 * This component should be placed in layout.tsx or providers.tsx
 * to ensure authentication is checked as soon as the app loads
 */
const AuthChecker: FC = () => {
  const { checkAuthState } = useAuth();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Ensure this only runs once
    if (!hasCheckedRef.current) {
      const checkAuth = async () => {
        try {
          await checkAuthState();
          hasCheckedRef.current = true;
        } catch (error) {
          console.error('Authentication check failed:', error);
        }
      };

      checkAuth();
    }
  }, [checkAuthState]);

  // This component doesn't render any UI
  return null;
};

export default AuthChecker; 