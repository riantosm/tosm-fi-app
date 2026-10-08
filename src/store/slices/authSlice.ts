import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, LoginResponse } from '@/types';

export interface AuthState {
  isLogin: boolean;
  token: string;
  user: AuthUser | null;
  /** Diset hanya oleh auto-logout interceptor 401; Login menampilkannya sekali lalu menghapusnya. */
  sessionExpired: boolean;
}

const initialState: AuthState = {
  isLogin: false,
  token: '',
  user: null,
  sessionExpired: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    onLogin: (state, action: PayloadAction<LoginResponse>) => {
      state.isLogin = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.sessionExpired = false;
    },
    onSetUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    onLogout: () => initialState,
    onSessionExpired: () => ({ ...initialState, sessionExpired: true }),
    onDismissSessionExpired: state => {
      state.sessionExpired = false;
    },
  },
});

export const {
  onLogin,
  onSetUser,
  onLogout,
  onSessionExpired,
  onDismissSessionExpired,
} = authSlice.actions;

export default authSlice.reducer;
