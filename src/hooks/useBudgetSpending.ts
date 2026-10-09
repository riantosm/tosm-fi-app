import { useEffect, useRef, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionCategoryBreakdown } from '@/types';
import { getCurrentMonthRange } from '@/utils/budgetBreakdown';

/**
 * Rincian pengeluaran bulan ini (sekali fetch) untuk semua kartu budget. Refetch setelah
 * mutasi transaksi di mana pun.
 */
export function useBudgetSpending(refreshKey = 0) {
  const { version, queryTransactions } = useTransactions();
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    TransactionCategoryBreakdown[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const { dateFrom, dateTo } = getCurrentMonthRange();
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    queryTransactions({ dateFrom, dateTo, type: 'expense' })
      .then(result => {
        if (!cancelled) {
          setCategoryBreakdown(result.summary.categoryBreakdown);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      });
    return () => {
      cancelled = true;
    };
  }, [queryTransactions, version, refreshKey]);

  return { categoryBreakdown, isLoading };
}
