import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { CalendarX, Search, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SearchField from '@/components/molecules/SearchField';
import SectionHead from '@/components/molecules/SectionHead';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import TransactionList from '@/components/organisms/TransactionList';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useScheduleOccurrences } from '@/hooks/useScheduleOccurrences';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import { openTransaction } from '@/navigation/openTransaction';
import { ROUTES } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type {
  ScheduleOccurrence,
  Transaction,
  TransactionListParams,
  TransactionSortOption,
  TransactionSummary,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import {
  formatMonthParam,
  generateMonthRange,
  startOfMonth,
} from '@/utils/month';
import { transitions } from '@/utils/motion';
import { filterOccurrencesForView } from '@/utils/scheduleOccurrenceFilter';
import ActiveFilterBanner from '@/screens/Transactions/ActiveFilterBanner';
import FilterSheet, {
  DEFAULT_FILTERS,
  EMPTY_RANGE,
  countActiveFilters,
  type TransactionFilters,
} from '@/screens/Transactions/FilterSheet';
import MonthTabs from '@/screens/Transactions/MonthTabs';
import SummaryBar from '@/screens/Transactions/SummaryBar';
import TransactionCalendar from '@/screens/Transactions/TransactionCalendar';
import { dateTimeFormat } from '@/utils/intl';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 1000;

const SORT_DISPLAY: Record<
  TransactionSortOption,
  {
    order: 'desc' | 'asc';
    within: 'chronological' | 'amountDesc' | 'amountAsc';
  }
> = {
  dateDesc: { order: 'desc', within: 'chronological' },
  dateAsc: { order: 'asc', within: 'chronological' },
  amountDesc: { order: 'desc', within: 'amountDesc' },
  amountAsc: { order: 'desc', within: 'amountAsc' },
};

const useStyles = makeStyles(({ colors }) => ({
  activeAction: { backgroundColor: colors.primarySoft },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  filterBadgeText: { color: colors.primaryFg, lineHeight: 13 },
  filterButton: { position: 'relative' },
  count: { marginLeft: spacing.sm },
  more: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
}));

/** Halaman Transaksi HP (pen `PIoO4`, filter aktif `z5AbmD`) — port TransactionsPage web. */
export default function TransactionsScreen({
  navigation,
  route,
}: MainTabScreenProps<typeof ROUTES.TRANSACTIONS>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const locale = toIntlLocale(i18n.language);
  const { categories, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { occurrences, loadPendingOccurrences, cancelOccurrence } =
    useScheduleOccurrences();
  const { version, queryTransactions } = useTransactions();

  const months = useMemo(() => generateMonthRange(new Date(), 24, 12), []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const { type, walletId, categoryId, subCategoryId, range, sort } = filters;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter awal dari Dashboard (tap bar / kategori / tombol cari).
  const requestId = route.params?.requestId;
  useEffect(() => {
    const params = route.params;
    if (!params) {
      return;
    }
    setFilters(current => ({
      ...current,
      type: params.type ?? 'all',
      categoryId: params.idCategory ?? 'all',
      subCategoryId: params.idSubCategory ?? 'all',
      walletId: 'all',
      range: EMPTY_RANGE,
    }));
    if (params.focusSearch) {
      setSearchOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const filterParams: Omit<TransactionListParams, 'page' | 'limit'> = {
    month: formatMonthParam(month),
    type: type !== 'all' ? type : undefined,
    idWallet: walletId !== 'all' ? walletId : undefined,
    idCategory: categoryId !== 'all' ? categoryId : undefined,
    idSubCategory: subCategoryId !== 'all' ? subCategoryId : undefined,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
    search: debouncedSearch || undefined,
    sort,
  };
  const filterKey = JSON.stringify(filterParams);
  const resetKey = `${filterKey}|${version}|${refreshKey}`;

  // Daftar berhalaman: kembali ke halaman 1 setiap filter/mutasi berubah.
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastResetKey = useRef(resetKey);

  useEffect(() => {
    if (lastResetKey.current !== resetKey) {
      lastResetKey.current = resetKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    let cancelled = false;
    setLoading(true);
    queryTransactions({ ...JSON.parse(filterKey), page, limit: PAGE_SIZE })
      .then(result => {
        if (cancelled) {
          return;
        }
        setItems(prev =>
          page === 1 ? result.transactions : [...prev, ...result.transactions],
        );
        setTotalPages(result.totalPages ?? 0);
        setTotal(result.total);
        setSummary(result.summary);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, page, queryTransactions]);

  // Titik kalender: semua transaksi bulan ini dengan filter yang sama (tanpa tanggal/urutan).
  const calendarKey = JSON.stringify({
    month: filterParams.month,
    type: filterParams.type,
    idWallet: filterParams.idWallet,
    idCategory: filterParams.idCategory,
    idSubCategory: filterParams.idSubCategory,
    search: filterParams.search,
  });
  const [calendarItems, setCalendarItems] = useState<Transaction[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);
    queryTransactions(JSON.parse(calendarKey))
      .then(result => !cancelled && setCalendarItems(result.transactions))
      .catch(() => {})
      .finally(() => !cancelled && setCalendarLoading(false));
    return () => {
      cancelled = true;
    };
  }, [calendarKey, version, refreshKey, queryTransactions]);

  const hasMore = page < totalPages;
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const selectMonth = useCallback((next: Date) => {
    setMonth(next);
    setFilters(current => ({ ...current, range: EMPTY_RANGE }));
  }, []);
  const goToCurrentMonth = useCallback(
    () => selectMonth(startOfMonth(new Date())),
    [selectMonth],
  );
  const selectDay = useCallback(
    (day: string | null) =>
      setFilters(current => ({
        ...current,
        range: day ? { from: day, to: day } : EMPTY_RANGE,
      })),
    [],
  );
  const openReports = useCallback(
    () => navigation.navigate(ROUTES.REPORTS),
    [navigation],
  );
  const payOccurrence = useCallback(
    (occurrence: ScheduleOccurrence) =>
      navigation.navigate(ROUTES.PAY_OCCURRENCE, { occurrence }),
    [navigation],
  );
  // Stabil antar-render supaya daftar (memo) tidak ikut dirender saat sheet/dialog dibuka.
  const visibleOccurrences = useMemo(
    () => filterOccurrencesForView(occurrences, JSON.parse(filterKey)),
    [occurrences, filterKey],
  );
  const selectedDay = range.from && range.from === range.to ? range.from : null;
  const hasActiveFilter =
    type !== 'all' ||
    walletId !== 'all' ||
    categoryId !== 'all' ||
    subCategoryId !== 'all' ||
    !!search ||
    !!(range.from || range.to);
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
  };
  const activeFilterCount = countActiveFilters(filters);

  // Batalkan tagihan (sama dengan Dashboard).
  const [cancelling, setCancelling] = useState<ScheduleOccurrence | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const confirmCancel = async () => {
    if (!cancelling) {
      return;
    }
    setCancelBusy(true);
    try {
      await cancelOccurrence(cancelling.idOccurrence);
      showToast(t('schedule.cancelSuccess'), 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('schedule.genericError'),
        'error',
      );
    } finally {
      setCancelBusy(false);
      setCancelling(null);
    }
  };

  const sortDisplay = SORT_DISPLAY[sort];

  return (
    <MainLayout
      title={t('nav.transactions')}
      withTabBar
      onEndReached={loadMore}
      onRefresh={async () => {
        setRefreshKey(key => key + 1);
        await Promise.all([
          loadWallets(),
          loadCategories(),
          loadPendingOccurrences(),
        ]);
      }}
      headerRight={
        <>
          <IconButton
            variant="surface"
            label={t('transaction.searchPlaceholder')}
            onPress={() => setSearchOpen(open => !open)}
            style={(searchOpen || !!search) && styles.activeAction}
            renderIcon={(color, size) => (
              <Search
                size={size}
                color={searchOpen || search ? colors.primaryText : color}
              />
            )}
          />
          <View style={styles.filterButton}>
            <IconButton
              variant="surface"
              label={t('transaction.filterTitle')}
              onPress={() => setFilterOpen(true)}
              style={activeFilterCount > 0 && styles.activeAction}
              renderIcon={(color, size) => (
                <SlidersHorizontal
                  size={size}
                  color={activeFilterCount > 0 ? colors.primaryText : color}
                />
              )}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge} pointerEvents="none">
                <Typography variant="badge" style={styles.filterBadgeText}>
                  {activeFilterCount}
                </Typography>
              </View>
            )}
          </View>
        </>
      }
    >
      <AnimatePresence>
        {(searchOpen || !!search) && (
          <MotiView
            key="search"
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0 }}
            transition={transitions.enter}
          >
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder={t('transaction.searchPlaceholder')}
              clearLabel={t('common.close')}
              autoFocus={searchOpen && !search}
            />
          </MotiView>
        )}
      </AnimatePresence>

      <MonthTabs
        months={months}
        selected={month}
        locale={locale}
        goToCurrentLabel={t('transaction.goToCurrentMonth')}
        onSelect={selectMonth}
        onGoToCurrent={goToCurrentMonth}
      />

      <SummaryBar
        expense={summary?.expense ?? 0}
        income={summary?.income ?? 0}
        onPress={openReports}
      />

      <ActiveFilterBanner
        filters={filters}
        search={search}
        wallets={wallets}
        categories={categories}
        locale={locale}
        matchCount={total}
        onPress={() => setFilterOpen(true)}
        onReset={resetFilters}
      />

      <TransactionCalendar
        month={month}
        locale={locale}
        transactions={calendarItems}
        categories={categories}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
        isLoading={calendarLoading}
      />

      <Card>
        <SectionHead
          title={t(
            hasActiveFilter
              ? 'transaction.filterResults'
              : 'transaction.allTransactions',
          )}
          right={
            total !== null ? (
              <Typography
                variant="secondary"
                tone="subtle"
                tabular
                style={styles.count}
              >
                {total}
              </Typography>
            ) : undefined
          }
        />
        <TransactionList
          transactions={items}
          occurrences={visibleOccurrences}
          categories={categories}
          wallets={wallets}
          order={sortDisplay.order}
          sortWithinDay={sortDisplay.within}
          dayHeaderStyle="full"
          emptyMessage={t(
            hasActiveFilter
              ? 'transaction.noDataForFilter'
              : 'dashboard.noTransactions',
          )}
          isLoading={(loading && page === 1) || walletsStatus !== 'loaded'}
          onCancelOccurrence={setCancelling}
          onPayOccurrence={payOccurrence}
          onPressTransaction={openTransaction}
        />
        {hasMore && loading && page > 1 && (
          <View style={styles.more}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Typography variant="secondary" tone="subtle">
              {t('transaction.loadingMore')}
            </Typography>
          </View>
        )}
      </Card>

      <FilterSheet
        visible={filterOpen}
        value={filters}
        wallets={wallets}
        categories={categories}
        month={month}
        locale={locale}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />
      <ConfirmDialog
        visible={!!cancelling}
        tone="danger"
        renderIcon={color => <CalendarX size={24} color={color} />}
        title={t('schedule.cancelOccurrenceTitle')}
        message={
          cancelling
            ? t('schedule.cancelOccurrenceDescription', {
                title: cancelling.title,
                date: dateTimeFormat(locale, {
                  day: 'numeric',
                  month: 'short',
                }).format(new Date(cancelling.dueDate)),
              })
            : undefined
        }
        confirmLabel={t('schedule.cancelOccurrenceAction')}
        cancelLabel={t('common.back')}
        loading={cancelBusy}
        onConfirm={confirmCancel}
        onCancel={() => setCancelling(null)}
      />
    </MainLayout>
  );
}
