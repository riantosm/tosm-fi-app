import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { getNetWorthTimelineApi } from '@/services/api/investmentTransaction.service';
import type {
  InvestmentTimelinesResult,
  NetWorthTimelineGranularity,
  NetWorthTimelinePoint,
} from '@/types';

const EMPTY_TIMELINES: InvestmentTimelinesResult = {
  accounts: {},
  instruments: {},
};

/** Seri {date, invested, current} per akun & instrumen (sparkline + grafik riwayat). */
export function useInvestmentTimelines(refreshKey = 0) {
  const { version, fetchTimelines } = useInvestmentTransactions();
  const [timelines, setTimelines] = useState(EMPTY_TIMELINES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTimelines()
      .then(result => {
        if (!cancelled) {
          setTimelines(result);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchTimelines, version, refreshKey]);

  return { timelines, loading };
}

/** "YYYY-MM-DD" transaksi investasi pertama user, atau null bila belum ada. */
export function useFirstInvestmentDate(): string | null {
  const { version, queryInvestmentTransactions } = useInvestmentTransactions();
  const [first, setFirst] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queryInvestmentTransactions({ sort: 'dateAsc', page: 1, limit: 1 })
      .then(result => {
        if (!cancelled) {
          setFirst(result.investmentTransactions[0]?.date.slice(0, 10) ?? null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [queryInvestmentTransactions, version]);

  return first;
}

/** Grafik nilai portofolio (hero Investasi) untuk rentang & granularitas tertentu. */
export function useNetWorthTimeline(
  granularity: NetWorthTimelineGranularity,
  dateFrom: string,
  dateTo: string,
  refreshKey = 0,
) {
  const { i18n } = useTranslation();
  const { version } = useInvestmentTransactions();
  const [data, setData] = useState<NetWorthTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateFrom || !dateTo) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    getNetWorthTimelineApi({
      granularity,
      dateFrom,
      dateTo,
      locale: i18n.language,
    })
      .then(result => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [granularity, dateFrom, dateTo, i18n.language, version, refreshKey]);

  return { data, loading };
}
