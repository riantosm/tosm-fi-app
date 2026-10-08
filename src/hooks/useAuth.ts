import { useCallback } from 'react';
import {
  getMeApi,
  loginApi,
  logoutApi,
  registerApi,
} from '@/services/api/auth.service';
import { cancelAllReminders } from '@/services/notification/scheduleReminder';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { onLogin, onLogout } from '@/store/slices/authSlice';
import type { LoginCredentials, RegisterInput } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const isLogin = useAppSelector(state => state.auth.isLogin);

  /**
   * Login lalu langsung /user/me; sesi baru disimpan kalau keduanya sukses.
   * User `pending` mendapat token tapi /user/me 403 ("Menunggu validasi"), jadi tidak masuk.
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { token } = await loginApi(credentials);
      const me = await getMeApi(token);
      dispatch(onLogin({ token, user: me }));
    },
    [dispatch],
  );

  const register = useCallback(
    (input: RegisterInput) => registerApi(input),
    [],
  );

  /** Logout ke server best-effort; state lokal selalu dibersihkan. */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Token mati / jaringan putus tidak boleh membuat user terjebak dalam sesi rusak.
    } finally {
      dispatch(onLogout());
      cancelAllReminders().catch(() => {});
    }
  }, [dispatch]);

  return { user, isLogin, login, register, logout };
}
