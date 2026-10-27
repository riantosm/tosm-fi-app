import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatePresence, MotiView } from 'moti';
import { CalendarX, Search, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SearchField from '@/components/molecules/SearchField';
import SectionHead from '@/components/molecules/SectionHead';
import SegmentedControl from '@/components/molecules/SegmentedControl';
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
import type {
  MainTabScreenProps,
  RootStackScreenProps,
  TransactionsParams,
} from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type {
  ScheduleOccurrence,
  Transaction,
  TransactionListParams,
  TransactionSortOption,
  TransactionSummary,
} from '@/types';
import { parseIsoDate } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';
import {
  formatMonthParam,
  generateMonthRange,
  startOfMonth,
  toIsoDateString,
} from '@/utils/month';
import { transitions } from '@/utils/motion';
import { filterOccurrencesForView } from '@/utils/scheduleOccurrenceFilter';
import ActiveFilterBanner from '@/screens/Transactions/ActiveFilterBanner';
import FilterSheet, {
  DEFAULT_FILTERS,
  EMPTY_RANGE,
  buildIdFilterParams,
  countActiveFilters,
  type TransactionFilters,
} from '@/screens/Transactions/FilterSheet';
import MonthTabs from '@/screens/Transactions/MonthTabs';
import SummaryBar from '@/screens/Transactions/SummaryBar';
import TransactionCalendar from '@/screens/Transactions/TransactionCalendar';
import TransactionYearCalendar, {
  type YearMonthSummary,
} from '@/screens/Transactions/TransactionYearCalendar';
import { dateTimeFormat } from '@/utils/intl';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 1000;

type CalendarViewMode = 'month' | 'year';

/** "YYYY-MM" kalau rentang tepat satu bulan penuh, selain itu null. */
function wholeMonthOf(range: { from: string; to: string }): string | null {
  if (!range.from || !range.to || !range.from.endsWith('-01')) {
    return null;
  }
  const start = parseIsoDate(range.from);
  const end = toIsoDateString(
    new Date(start.getFullYear(), start.getMonth() + 1, 0),
  );
  return range.to === end ? range.from.slice(0, 7) : null;
}

function monthRangeOf(monthKey: string): { from: string; to: string } {
  const start = parseIsoDate(`${monthKey}-01`);
  return {
    from: toIsoDateString(start),
    to: toIsoDateString(new Date(start.getFullYear(), start.getMonth() + 1, 0)),
  };
}

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
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  viewToggle: { width: 124 },
  periodTabs: { flex: 1 },
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

/** Filter dari params navigasi (Dashboard / Laporan); dompet & urutan kembali ke default. */
function filtersFromParams(
  current: TransactionFilters,
  params: TransactionsParams,
): TransactionFilters {
  const excluded = params.excludeSubCategoryIds ?? [];
  return {
    ...current,
    type: params.type ?? 'all',
    categoryIds: params.idCategory ? [params.idCategory] : [],
    categoryMode: 'include',
    subCategoryIds: params.idSubCategory ? [params.idSubCategory] : excluded,
    subCategoryMode:
      !params.idSubCategory && excluded.length > 0 ? 'exclude' : 'include',
    walletIds: [],
    walletMode: 'include',
    range: params.dateFrom
      ? { from: params.dateFrom, to: params.dateTo ?? params.dateFrom }
      : EMPTY_RANGE,
  };
}

/** Bulan awal untuk rentang dari params: bulan ini kalau hari ini di dalam rentang, selain itu bulan akhir rentang. */
function monthForRange(params: TransactionsParams | undefined): Date {
  const today = new Date();
  if (!params?.dateFrom) {
    return startOfMonth(today);
  }
  const todayIso = toIsoDateString(today);
  const dateTo = params.dateTo ?? params.dateFrom;
  const inRange = params.dateFrom <= todayIso && todayIso <= dateTo;
  return startOfMonth(inRange ? today : parseIsoDate(dateTo));
}

/**
 * Halaman Transaksi HP (pen `PIoO4`, filter aktif `z5AbmD`) — port TransactionsPage web. Dipakai
 * juga sebagai route stack `ReportTransactions` (dari Laporan) dengan tombol kembali, supaya back
 * kembali ke halaman sebelumnya, bukan ke tab Beranda.
 */
export default function TransactionsScreen({
  route,
}:
  | MainTabScreenProps<typeof ROUTES.TRANSACTIONS>
  | RootStackScreenProps<typeof ROUTES.REPORT_TRANSACTIONS>) {
  const styles = useStyles();
  // Dari hook (tipe root global): union `navigation` tab | stack tidak bisa dipanggil.
  const navigation = useNavigation();
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
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: 7 },
      (_, index) => new Date(currentYear - 5 + index, 0, 1),
    );
  }, []);
  const isStacked = route.name === ROUTES.REPORT_TRANSACTIONS;
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const isYearView = viewMode === 'year';
  const [month, setMonth] = useState(() => monthForRange(route.params));
  const year = month.getFullYear();
  const [filters, setFilters] = useState<TransactionFilters>(() =>
    route.params
      ? filtersFromParams(DEFAULT_FILTERS, route.params)
      : DEFAULT_FILTERS,
  );
  const { type, range, sort } = filters;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter awal dari Dashboard (tap bar / kategori / tombol cari) atau Laporan (subkategori).
  const requestId = route.params?.requestId;
  useEffect(() => {
    const params = route.params;
    if (!params) {
      return;
    }
    setFilters(current => filtersFromParams(current, params));
    if (params.dateFrom) {
      setMonth(monthForRange(params));
      setViewMode('month');
    }
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

  // Rentang lintas bulan (periode Laporan Minggu/Tahun/custom): backend mengiris `month` dengan
  // dateFrom/dateTo, jadi bulan tidak dikirim supaya seluruh rentang tampil.
  const rangeSpansMonths =
    !!range.from &&
    !!range.to &&
    range.from.slice(0, 7) !== range.to.slice(0, 7);
  // Tampilan Tahun: daftar mencakup setahun penuh sampai bulan (atau rentang) dipilih.
  const filterParams: Omit<TransactionListParams, 'page' | 'limit'> = {
    month: isYearView || rangeSpansMonths ? undefined : formatMonthParam(month),
    type: type !== 'all' ? type : undefined,
    ...buildIdFilterParams(filters),
    dateFrom: range.from || (isYearView ? `${year}-01-01` : undefined),
    dateTo: range.to || (isYearView ? `${year}-12-31` : undefined),
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
    month: formatMonthParam(month),
    type: filterParams.type,
    idWallet: filterParams.idWallet,
    walletMode: filterParams.walletMode,
    idCategory: filterParams.idCategory,
    categoryMode: filterParams.categoryMode,
    idSubCategory: filterParams.idSubCategory,
    subCategoryMode: filterParams.subCategoryMode,
    search: filterParams.search,
  });
  const [calendarItems, setCalendarItems] = useState<Transaction[]>([]);
  const [yearMonths, setYearMonths] = useState<YearMonthSummary[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);
    if (isYearView) {
      // Grid tahun hanya butuh total per bulan: satu kueri `limit: 1` per bulan memberi `summary`
      // (+ `total`) dari server tanpa mengunduh transaksi setahun.
      const base = JSON.parse(calendarKey);
      Promise.all(
        Array.from({ length: 12 }, (_, index) => {
          const item = new Date(year, index, 1);
          return queryTransactions({
            ...base,
            month: formatMonthParam(item),
            page: 1,
            limit: 1,
          }).then(result => ({
            month: item,
            summary: result.summary,
            count: result.total ?? 0,
          }));
        }),
      )
        .then(results => !cancelled && setYearMonths(results))
        .catch(() => {})
        .finally(() => !cancelled && setCalendarLoading(false));
      return () => {
        cancelled = true;
      };
    }
    queryTransactions(JSON.parse(calendarKey))
      .then(result => !cancelled && setCalendarItems(result.transactions))
      .catch(() => {})
      .finally(() => !cancelled && setCalendarLoading(false));
    return () => {
      cancelled = true;
    };
  }, [calendarKey, isYearView, year, version, refreshKey, queryTransactions]);

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
  // Pindah tahun mempertahankan bulannya, supaya kembali ke tampilan Bulan di bulan yang sama.
  const selectYear = useCallback(
    (next: Date) =>
      selectMonth(new Date(next.getFullYear(), month.getMonth(), 1)),
    [selectMonth, month],
  );
  const goToCurrentYear = useCallback(
    () => selectYear(new Date()),
    [selectYear],
  );
  const selectYearMonth = useCallback(
    (monthKey: string | null) =>
      setFilters(current => ({
        ...current,
        range: monthKey ? monthRangeOf(monthKey) : EMPTY_RANGE,
      })),
    [],
  );
  const openMonth = useCallback(
    (next: Date) => {
      setViewMode('month');
      selectMonth(next);
    },
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
  // Sama satu tingkat di atas: grid tahun menandai bulan saat rentang = bulan itu.
  const selectedYearMonth = wholeMonthOf(range);
  // Keluar dari tampilan Tahun dengan bulan terpilih = buka kalender bulan itu.
  const changeViewMode = (next: CalendarViewMode) => {
    setViewMode(next);
    if (next === 'month' && selectedYearMonth) {
      selectMonth(parseIsoDate(`${selectedYearMonth}-01`));
    } else {
      setFilters(current => ({ ...current, range: EMPTY_RANGE }));
    }
  };
  const hasActiveFilter =
    type !== 'all' ||
    filters.walletIds.length > 0 ||
    filters.categoryIds.length > 0 ||
    filters.subCategoryIds.length > 0 ||
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
      onBack={isStacked ? navigation.goBack : undefined}
      backLabel={t('common.back')}
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

      <View style={styles.periodRow}>
        <View style={styles.viewToggle}>
          <SegmentedControl<CalendarViewMode>
            variant="compact"
            options={[
              { value: 'month', label: t('transaction.viewMonth') },
              { value: 'year', label: t('transaction.viewYear') },
            ]}
            value={viewMode}
            onChange={changeViewMode}
          />
        </View>
        {isYearView ? (
          <MonthTabs
            key="year"
            unit="year"
            months={years}
            selected={month}
            locale={locale}
            goToCurrentLabel={t('transaction.goToCurrentYear')}
            onSelect={selectYear}
            onGoToCurrent={goToCurrentYear}
            style={styles.periodTabs}
          />
        ) : (
          <MonthTabs
            key="month"
            months={months}
            selected={month}
            locale={locale}
            goToCurrentLabel={t('transaction.goToCurrentMonth')}
            onSelect={selectMonth}
            onGoToCurrent={goToCurrentMonth}
            style={styles.periodTabs}
          />
        )}
      </View>

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

      {isYearView ? (
        <TransactionYearCalendar
          year={year}
          locale={locale}
          months={yearMonths}
          selectedMonth={selectedYearMonth}
          onSelectMonth={selectYearMonth}
          onOpenMonth={openMonth}
          isLoading={calendarLoading}
        />
      ) : (
        <TransactionCalendar
          month={month}
          locale={locale}
          transactions={calendarItems}
          categories={categories}
          selectedDay={selectedDay}
          onSelectDay={selectDay}
          isLoading={calendarLoading}
        />
      )}

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
