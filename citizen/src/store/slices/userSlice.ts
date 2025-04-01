/**
 * src/store/slices/userSlice.ts
 * 
 * Redux slice for user authentication state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, CitizenUser, StaffUser, User } from '@/types';
import Cookies from 'js-cookie';

/**
 * Initial user authentication state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

/**
 * User authentication slice with reducers for login, logout, etc.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    /**
     * Set error message
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    /**
     * Set user data
     */
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    /**
     * Set user and authentication state on login
     */
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    
    /**
     * Clear authentication state on logout
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      
      // Ensure cookies are removed with proper options
      Cookies.remove('accessToken', { 
        path: '/',
        sameSite: 'lax'
      });
      Cookies.remove('refreshToken', { 
        path: '/',
        sameSite: 'lax'
      });
    },
    
    /**
     * Update user profile data
     */
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Preserve the user type when updating properties
        const updatedUser = {
          ...state.user,
          ...action.payload,
          type: state.user.type // Ensure type remains the same
        };
        
        state.user = updatedUser as CitizenUser | StaffUser;
      }
    }
  }
});

// Export actions
export const { 
  setLoading, 
  setError, 
  setUser, 
  login, 
  logout, 
  updateUserProfile 
} = userSlice.actions;

// Export reducer
export const userReducer = userSlice.reducer; 