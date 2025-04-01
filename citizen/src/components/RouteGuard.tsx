'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Route Guard component to protect routes that require authentication
 * 
 * Redirects to login page if user is not authenticated
 * This should wrap components/pages that require authentication
 */
const RouteGuard: FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, checkAuthState, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/register', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
    
    // Don't check auth for public paths
    if (isPublicPath) {
      setIsChecking(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        const isAuth = await checkAuthState();
        
        if (!isAuth) {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [pathname, router, checkAuthState, isAuthenticated]);

  // Show nothing while checking authentication
  // This prevents flash of protected content before redirect
  if (isChecking || loading) {
    return null;
  }

  // If on a private route and authenticated, show the children
  // If on a public route, show the children regardless of auth state
  return <>{children}</>;
};

export default RouteGuard; 