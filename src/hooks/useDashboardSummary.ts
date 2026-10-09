import { useEffect, useRef, useState } from 'react';
import { getDashboardSummaryApi } from '@/services/api/report.service';
import { useAppSelector } from '@/store/hooks';
import type { DashboardSummary } from '@/types';

/**
 * Ringkasan Dashboard (kekayaan, bulan ini, kesehatan finansial). Refetch saat dompet,
 * instrumen, atau sinyal mutasi transaksi berubah; di-debounce 200 ms supaya ledakan
 * perubahan saat mount hanya memicu satu request. Hanya fetch pertama yang menampilkan skeleton.
 */
export function useDashboardSummary(refreshKey = 0) {
  const wallets = useAppSelector(state => state.wallet.wallets);
  const instruments = useAppSelector(state => state.instrument.instruments);
  const version = useAppSelector(state => state.transaction.version);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }
      getDashboardSummaryApi()
        .then(result => {
          if (!cancelled) {
            setSummary(result);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
            hasLoadedRef.current = true;
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [wallets, instruments, version, refreshKey]);

  return { summary, isLoading };
}
