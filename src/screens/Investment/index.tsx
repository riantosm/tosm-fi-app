import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  ArrowDownWideNarrow,
  ArrowLeftRight,
  Banknote,
  ChartPie,
  Coins,
  Percent,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import SearchField from '@/components/molecules/SearchField';
import InvestmentTransactionList from '@/components/organisms/InvestmentTransactionList';
import OptionSheet from '@/components/organisms/OptionSheet';
import MainLayout from '@/components/templates/MainLayout';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useFirstInvestmentDate,
  useInvestmentTimelines,
  useNetWorthTimeline,
} from '@/hooks/useInvestmentData';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { ROUTES } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import InstrumentRow from '@/screens/Investment/InstrumentRow';
import NetWorthHero from '@/screens/Investment/NetWorthHero';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  InvestmentTransaction,
  InvestmentTransactionListParams,
  InvestmentTransactionType,
} from '@/types';
import {
  PERIOD_GRANULARITY,
  activeAccounts,
  getInstrumentTotals,
  getPortfolioTotals,
  resolveNetWorthPeriod,
  type NetWorthPeriodPreset,
} from '@/utils/investment';
import { transitions, withDelay } from '@/utils/motion';
import Reveal from '@/components/atoms/Reveal';

type SortOption = 'amount' | 'percentChange';
type TypeFilter = 'all' | InvestmentTransactionType;

const TYPES: InvestmentTransactionType[] = ['in', 'out', 'transfer', 'pl'];
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 1000;

const useStyles = makeStyles(({ colors }) => ({
  section: { gap: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: { fontSize: 17, lineHeight: 22 },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  instruments: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addLabel: { fontSize: 13.5, lineHeight: 19 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  ledger: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  more: { paddingVertical: spacing.md },
  activeAction: { backgroundColor: colors.primarySoft },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: 20, lineHeight: 26 },
  tiles: { flexDirection: 'row', marginBottom: spacing.md },
  tileFront: { zIndex: 1 },
  tile: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
}));

/** Tiga tile instrumen miring (Investasi · Kosong, pen `dZKTE`). */
function EmptyIllustration() {
  const styles = useStyles();
  const { colors } = useTheme();
  const tiles = [
    {
      Icon: Coins,
      color: WALLET_COLOR_PRESETS[8],
      rotate: '-8deg',
      x: 10,
      y: 8,
    },
    {
      Icon: TrendingUp,
      color: WALLET_COLOR_PRESETS[1],
      rotate: '0deg',
      x: 0,
      y: -4,
    },
    { Icon: ChartPie, color: colors.chart1, rotate: '8deg', x: -10, y: 4 },
  ];
  return (
    <View style={styles.tiles}>
      {tiles.map(({ Icon, color, rotate, x, y }, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, translateY: y + 10 }}
          animate={{ opacity: 1, translateY: y }}
          transition={withDelay(transitions.enter, index * 80)}
          style={[
            styles.tile,
            index === 1 && styles.tileFront,
            {
              backgroundColor: color,
              transform: [{ translateX: x }, { rotate }],
            },
          ]}
        >
          <Icon size={26} color={colors.onData} />
        </MotiView>
      ))}
    </View>
  );
}

/** Tab Investasi (pen `Q1BjKl` · `dZKTE`) — port InvestmentPage web (tampilan HP). */
export default function InvestmentScreen({
  navigation,
}: MainTabScreenProps<typeof ROUTES.INVESTMENT>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { instruments, status, loadInstruments } = useInstruments();
  const { version, queryInvestmentTransactions } = useInvestmentTransactions();
  const [refreshKey, setRefreshKey] = useState(0);
  const { timelines } = useInvestmentTimelines(refreshKey);
  const firstDate = useFirstInvestmentDate();
  const [period, setPeriod] = useState<NetWorthPeriodPreset>('year');
  const range = useMemo(
    () => resolveNetWorthPeriod(period, new Date(), firstDate),
    [period, firstDate],
  );
  const { data: netWorth, loading: netWorthLoading } = useNetWorthTimeline(
    PERIOD_GRANULARITY[period],
    range.dateFrom,
    range.dateTo,
    refreshKey,
  );
  const [sort, setSort] = useState<SortOption>('amount');
  const [sortOpen, setSortOpen] = useState(false);

  // Nilai bisa berubah dari layar lain (catat transaksi ke investasi) → muat ulang saat fokus.
  useEffect(
    () => navigation.addListener('focus', () => loadInstruments()),
    [navigation, loadInstruments],
  );

  const totals = useMemo(() => getPortfolioTotals(instruments), [instruments]);
  const sorted = useMemo(
    () =>
      [...instruments].sort((a, b) => {
        const totalsA = getInstrumentTotals(a);
        const totalsB = getInstrumentTotals(b);
        return sort === 'amount'
          ? totalsB.currentValue - totalsA.currentValue
          : totalsB.profitLossPercent - totalsA.profitLossPercent;
      }),
    [instruments, sort],
  );
  const accountCount = instruments.reduce(
    (sum, instrument) => sum + activeAccounts(instrument).length,
    0,
  );
  const initialLoading = status !== 'loaded' && instruments.length === 0;
  const empty = status === 'loaded' && instruments.length === 0;

  // Ledger: cari (debounce) + filter tipe, berhalaman (infinite scroll).
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const filterParams: InvestmentTransactionListParams = {
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: debouncedSearch || undefined,
    sort: 'dateDesc',
  };
  const filterKey = JSON.stringify(filterParams);
  const resetKey = `${filterKey}|${version}|${refreshKey}`;
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvestmentTransaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [ledgerLoading, setLedgerLoading] = useState(true);
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
    setLedgerLoading(true);
    queryInvestmentTransactions({
      ...JSON.parse(filterKey),
      page,
      limit: PAGE_SIZE,
    })
      .then(result => {
        if (cancelled) {
          return;
        }
        setItems(prev =>
          page === 1
            ? result.investmentTransactions
            : [...prev, ...result.investmentTransactions],
        );
        setTotalPages(result.totalPages ?? 0);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLedgerLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, page, queryInvestmentTransactions]);

  const hasMore = page < totalPages;
  const loadMore = useCallback(() => {
    if (hasMore && !ledgerLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, ledgerLoading]);

  const openCreate = () => navigation.navigate(ROUTES.INSTRUMENT_FORM);
  const openDetail = (idInstrument: string) =>
    navigation.navigate(ROUTES.INSTRUMENT_DETAIL, { idInstrument });
  const hasFilter = typeFilter !== 'all' || !!search;

  return (
    <>
      <MainLayout
        title={t('nav.investment')}
        subtitle={
          empty
            ? t('investment.noInstruments')
            : initialLoading
            ? undefined
            : `${t('investment.instrumentCount', {
                count: instruments.length,
              })} · ${t('investment.accountsShort', { count: accountCount })}`
        }
        withTabBar
        onEndReached={loadMore}
        onRefresh={() => {
          setRefreshKey(key => key + 1);
          return loadInstruments();
        }}
        headerRight={
          <>
            {!empty && (
              <IconButton
                variant="surface"
                label={t('investment.transferTitle')}
                onPress={() => navigation.navigate(ROUTES.INVESTMENT_TRANSFER)}
                renderIcon={(color, size) => (
                  <ArrowLeftRight size={size} color={color} />
                )}
              />
            )}
            <IconButton
              variant="primary"
              label={t('investment.addInstrument')}
              onPress={openCreate}
              renderIcon={(color, size) => <Plus size={size} color={color} />}
            />
          </>
        }
      >
        {initialLoading ? (
          <>
            <Skeleton height={330} radius={24} />
            <Skeleton height={200} radius={radius.card} />
          </>
        ) : empty ? (
          <>
            <Reveal>
              <NetWorthHero totals={totals} />
            </Reveal>
            <Card>
              <View style={styles.empty}>
                <EmptyIllustration />
                <Typography
                  variant="cardTitle"
                  align="center"
                  style={styles.emptyTitle}
                >
                  {t('investment.emptyTitle')}
                </Typography>
                <Typography variant="secondary" tone="muted" align="center">
                  {t('investment.noInstrumentsHint')}
                </Typography>
                <Button
                  label={t('investment.addInstrument')}
                  renderIcon={color => <Plus size={18} color={color} />}
                  onPress={openCreate}
                />
              </View>
            </Card>
          </>
        ) : (
          <>
            <Reveal>
              <NetWorthHero
                totals={totals}
                data={netWorth}
                period={period}
                onPeriodChange={setPeriod}
                loading={netWorthLoading}
              />
            </Reveal>

            <Reveal delay={50} style={styles.section}>
              <View style={styles.sectionHead}>
                <Typography variant="cardTitle" style={styles.sectionTitle}>
                  {t('investment.instrumentLabel')}
                </Typography>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={t('investment.sortTitle')}
                  hitSlop={8}
                  onPress={() => setSortOpen(true)}
                  style={styles.sort}
                >
                  <ArrowDownWideNarrow size={16} color={colors.text2} />
                  <Typography variant="secondary" tone="muted">
                    {t(`investment.sortShort.${sort}`)}
                  </Typography>
                </PressableScale>
              </View>
              <Card variant="list" style={styles.instruments}>
                {sorted.map((instrument, index) => (
                  <InstrumentRow
                    key={instrument.idInstrument}
                    instrument={instrument}
                    sparkline={
                      timelines.instruments[instrument.idInstrument] ?? []
                    }
                    divider={index > 0}
                    onPress={() => openDetail(instrument.idInstrument)}
                  />
                ))}
                <PressableScale
                  accessibilityRole="button"
                  scaleTo={0.98}
                  onPress={openCreate}
                  style={styles.addRow}
                >
                  <Plus size={16} color={colors.primaryText} />
                  <Typography
                    variant="label"
                    tone="primary"
                    style={styles.addLabel}
                  >
                    {t('investment.addInstrument')}
                  </Typography>
                </PressableScale>
              </Card>
            </Reveal>

            <Reveal delay={100} style={styles.section}>
              <View style={styles.sectionHead}>
                <Typography variant="cardTitle" style={styles.sectionTitle}>
                  {t('investment.ledgerTitleShort')}
                </Typography>
                <IconButton
                  variant="surface"
                  size={34}
                  label={t('investment.searchPlaceholder')}
                  onPress={() => setSearchOpen(open => !open)}
                  style={(searchOpen || !!search) && styles.activeAction}
                  renderIcon={(color, size) => (
                    <Search
                      size={size - 2}
                      color={searchOpen || search ? colors.primaryText : color}
                    />
                  )}
                />
              </View>
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
                      placeholder={t('investment.searchPlaceholder')}
                      clearLabel={t('common.close')}
                      autoFocus={searchOpen && !search}
                    />
                  </MotiView>
                )}
              </AnimatePresence>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                <Chip
                  variant="surface"
                  label={t('common.all')}
                  active={typeFilter === 'all'}
                  onPress={() => setTypeFilter('all')}
                />
                {TYPES.map(type => (
                  <Chip
                    key={type}
                    variant="surface"
                    label={t(`investment.typeShort.${type}`)}
                    active={typeFilter === type}
                    onPress={() =>
                      setTypeFilter(prev => (prev === type ? 'all' : type))
                    }
                  />
                ))}
              </ScrollView>
              <Card variant="list" style={styles.ledger}>
                <InvestmentTransactionList
                  transactions={items}
                  instruments={instruments}
                  emptyMessage={t(
                    hasFilter
                      ? 'investment.noDataForFilter'
                      : 'investment.allTransactionsEmpty',
                  )}
                  loading={ledgerLoading && page === 1 && items.length === 0}
                  refreshing={ledgerLoading && page === 1 && items.length > 0}
                  onPressTransaction={transaction =>
                    navigation.navigate(ROUTES.INVESTMENT_TX_EDIT, {
                      transaction,
                    })
                  }
                />
                {hasMore && ledgerLoading && page > 1 && (
                  <View style={styles.more}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
              </Card>
            </Reveal>
          </>
        )}
      </MainLayout>

      <OptionSheet<SortOption>
        visible={sortOpen}
        title={t('investment.sortTitle')}
        closeLabel={t('common.close')}
        value={sort}
        options={[
          {
            value: 'amount',
            label: t('investment.sortOptions.amount'),
            renderIcon: color => <Banknote size={18} color={color} />,
          },
          {
            value: 'percentChange',
            label: t('investment.sortOptions.percentChange'),
            renderIcon: color => <Percent size={18} color={color} />,
          },
        ]}
        onSelect={value => {
          setSort(value);
          setSortOpen(false);
        }}
        onClose={() => setSortOpen(false)}
      />
    </>
  );
}
