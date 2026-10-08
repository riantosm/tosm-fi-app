import { useEffect } from 'react';
import { getMeApi } from '@/services/api/auth.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { onSetUser } from '@/store/slices/authSlice';

/**
 * Sekali saat app dibuka (setelah rehydrate): segarkan profil user dari /user/me.
 * Token invalid → 401 → interceptor axios yang melakukan auto-logout.
 */
export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(state => state.auth.isLogin);

  useEffect(() => {
    if (!isLogin) {
      return;
    }
    getMeApi()
      .then(user => dispatch(onSetUser(user)))
      .catch(() => {});
    // Hanya saat mount; login baru sudah membawa data /user/me sendiri.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
