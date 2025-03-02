import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loginUserAPI, LoginCredentials, AuthResponse } from '@/services/authService';

export interface DecodedUser {
  id: number;
  fullname: string;
  identificationnumber: string;
  address: string;
  phonenumber: string;
  email: string;
  username: string;
  areacode: number;
  imagelink?: string;
  iat?: number;
  exp?: number;
}

interface AuthState {
  user: DecodedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<
  { user: DecodedUser; accessToken: string; refreshToken: string },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data: AuthResponse = await loginUserAPI(credentials);
      // Ở đây, dữ liệu user được trả về từ API đã chứa đầy đủ thông tin
      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (
          state,
          action: PayloadAction<{
            user: DecodedUser;
            accessToken: string;
            refreshToken: string;
          }>
        ) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
