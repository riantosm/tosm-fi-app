import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppSelector } from '@/store/hooks';
import type { Transaction } from '@/types';
import {
  buildHistoryExamples,
  EXAMPLE_LOOKBACK_DAYS,
} from '@/utils/assistantExamples';
import { toIsoDate } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';

/**
 * "Contoh, tinggal tap" Catat cepat dari riwayat: transaksi yang berulang dalam 30 hari terakhir
 * ("Kopi 18rb pakai GoPay"). `null` = masih menganalisis; array kosong = belum ada pola (layar
 * memakai contoh bawaan). Dompet & kategori dimuat oleh `chat.ensureData()`.
 */
export function useHistoryExamples(): string[] | null {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { queryTransactions, version } = useTransactions();
  const wallets = useAppSelector(state => state.wallet.wallets);
  const walletStatus = useAppSelector(state => state.wallet.status);
  const categories = useAppSelector(state => state.category.categories);
  const categoryStatus = useAppSelector(state => state.category.status);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    let active = true;
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - (EXAMPLE_LOOKBACK_DAYS - 1));
    queryTransactions({ dateFrom: toIsoDate(from), dateTo: toIsoDate(today) })
      .then(result => active && setTransactions(result.transactions))
      .catch(() => active && setTransactions([]));
    return () => {
      active = false;
    };
  }, [queryTransactions, version]);

  return useMemo(() => {
    // Tunggu nama dompet/kategori supaya contoh tidak berubah di depan mata user.
    if (
      !transactions ||
      walletStatus !== 'loaded' ||
      categoryStatus !== 'loaded'
    ) {
      return null;
    }
    return buildHistoryExamples(
      transactions,
      wallets,
      categories,
      toIntlLocale(language),
    ).map(example => {
      if (example.kind === 'transfer') {
        return t('assistant.historyTransfer', example);
      }
      if (!example.wallet) {
        return t('assistant.historyNoWallet', example);
      }
      return t(
        example.kind === 'income'
          ? 'assistant.historyIncome'
          : 'assistant.historyExpense',
        example,
      );
    });
  }, [
    transactions,
    walletStatus,
    categoryStatus,
    wallets,
    categories,
    language,
    t,
  ]);
}
