/**
 * logoutHandler.ts
 * 
 * Hook for handling user logout
 * Provides a consistent way to log users out across the application
 */

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * Hook for handling user logout
 * 
 * @returns Function to handle logout with optional redirect
 */
export const useLogoutHandler = () => {
  const { logout } = useAuth();
  const router = useRouter();

  /**
   * Handle user logout
   * 
   * @param redirectPath Optional path to redirect after logout (defaults to /login)
   */
  const handleLogout = async (redirectPath = '/login') => {
    try {
      // Use the logout function from useAuth
      logout();
      
      // The redirection is handled by useAuth.logout
    } catch (error) {
      console.error("Logout error:", error);
      
      // Fallback navigation in case of error
      router.push(redirectPath);
    }
  };

  return handleLogout;
};
