/**
 * logoutHandler.ts
 * 
 * Hook for handling user logout
 * Provides a consistent way to log users out across the application
 */

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store";
import Cookies from "js-cookie";

/**
 * Hook for handling user logout
 * 
 * @returns Function to handle logout with optional redirect
 */
export const useLogoutHandler = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  /**
   * Handle user logout
   * 
   * @param redirectPath Optional path to redirect after logout (defaults to /login)
   */
  const handleLogout = async (redirectPath = '/login') => {
    try {
      // Clear all auth cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      
      // Dispatch logout action to clear Redux state
      dispatch(logoutAction());
      
      // Clear any local storage values
      try {
        localStorage.removeItem('profile_fetched');
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Redirect to login page
      router.push(redirectPath);
    } catch (error) {
      console.error("Logout error:", error);
      
      // Fallback navigation in case of error
      router.push(redirectPath);
    }
  };

  return handleLogout;
};
