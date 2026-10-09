import { useCallback, useState } from 'react';
import {
  acceptUserApi,
  getUserListApi,
} from '@/services/api/userApproval.service';
import type { AuthUser } from '@/types';

type Status = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Daftar pendaftaran pengguna (admin). State lokal per layar (hanya dipakai Pengaturan untuk
 * badge "n baru" dan halaman Permintaan Pengguna), jadi tidak perlu slice Redux.
 */
export function useUserApproval() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  const loadUsers = useCallback(async () => {
    setStatus('loading');
    try {
      setUsers(await getUserListApi());
      setStatus('loaded');
    } catch (error) {
      setStatus('error');
      throw error;
    }
  }, []);

  const acceptUser = useCallback(async (idUser: string) => {
    const updated = await acceptUserApi(idUser);
    setUsers(list =>
      list.map(item => (item.idUser === updated.idUser ? updated : item)),
    );
  }, []);

  const pendingCount = users.filter(item => item.status !== 'active').length;

  return { users, status, pendingCount, loadUsers, acceptUser };
}
