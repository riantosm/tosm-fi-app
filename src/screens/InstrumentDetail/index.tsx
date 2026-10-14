import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Layers, Pencil, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import AreaChart from '@/components/molecules/AreaChart';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import ProfitLossPill from '@/components/molecules/ProfitLossPill';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import InvestmentTransactionList from '@/components/organisms/InvestmentTransactionList';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useInvestmentTimelines } from '@/hooks/useInvestmentData';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import AccountCard from '@/screens/InstrumentDetail/AccountCard';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  InvestmentTransaction,
  InvestmentTransactionType,
  NetWorthTimelineGranularity,
} from '@/types';
import {
  activeAccounts,
  bucketTimeline,
  formatTimelineDate,
  sumInvestmentAccounts,
  sumTimelines,
} from '@/utils/investment';
import Reveal from '@/components/atoms/Reveal';

type TypeFilter = 'all' | InvestmentTransactionType;

const GRANULARITIES: NetWorthTimelineGranularity[] = ['day', 'month', 'year'];
const TYPES: InvestmentTransactionType[] = ['in', 'out', 'transfer', 'pl'];
const CHART_HEIGHT = 170;

const useStyles = makeStyles(({ colors }) => ({
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryTexts: { flex: 1, gap: 2 },
  value: { fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  scopeText: { flex: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBar: { width: 10, height: 4, borderRadius: radius.pill },
  legendLine: {
    width: 10,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.text3,
  },
  noHistory: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  section: { gap: spacing.md },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: { flex: 1, fontSize: 17, lineHeight: 22 },
  add: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chips: { gap: spacing.sm },
  ledgerHead: { gap: spacing.md },
  ledgerTitle: { fontSize: 17, lineHeight: 22 },
  dim: { opacity: 0.5 },
}));

/** Detail instrumen (pen `Dn41X`) — port InstrumentDetailView web (tampilan HP). */
export default function InstrumentDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INSTRUMENT_DETAIL>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { format, formatNumber } = useMoneyFormat();
  const { instruments, status, loadInstruments } = useInstruments();
  const { version, queryInvestmentTransactions } = useInvestmentTransactions();
  const [refreshKey, setRefreshKey] = useState(0);
  const { timelines, loading: timelinesLoading } =
    useInvestmentTimelines(refreshKey);
  const instrument = instruments.find(
    item => item.idInstrument === route.params.idInstrument,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [granularity, setGranularity] =
    useState<NetWorthTimelineGranularity>('month');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // Instrumen dihapus (dari form) → kembali ke Investasi.
  useEffect(() => {
    if (status === 'loaded' && !instrument) {
      navigation.goBack();
    }
  }, [status, instrument, navigation]);

  const accounts = useMemo(
    () => (instrument ? activeAccounts(instrument) : []),
    [instrument],
  );
  const selected = accounts.filter(account =>
    selectedIds.includes(account.idInvestmentAccount),
  );
  const subset = selected.length > 0;
  const scope = subset ? selected : accounts;
  const totals = sumInvestmentAccounts(scope);

  const history = useMemo(() => {
    if (!instrument) {
      return [];
    }
    const raw = subset
      ? sumTimelines(
          selected.map(
            account => timelines.accounts[account.idInvestmentAccount] ?? [],
          ),
        )
      : timelines.instruments[instrument.idInstrument] ?? [];
    return bucketTimeline(raw, granularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument, subset, selectedIds, timelines, granularity]);

  // Ledger instrumen, refetch setelah mutasi investasi.
  const [ledger, setLedger] = useState<InvestmentTransaction[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerLoaded, setLedgerLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLedgerLoading(true);
    queryInvestmentTransactions({
      idInstrument: route.params.idInstrument,
      type: typeFilter === 'all' ? undefined : typeFilter,
      sort: 'dateDesc',
    })
      .then(result => {
        if (!cancelled) {
          setLedger(result.investmentTransactions);
          setLedgerLoaded(true);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLedgerLoading(false));
    return () => {
      cancelled = true;
    };
  }, [
    queryInvestmentTransactions,
    route.params.idInstrument,
    typeFilter,
    version,
    refreshKey,
  ]);

  if (!instrument) {
    return null;
  }

  const visibleLedger = subset
    ? ledger.filter(
        transaction =>
          selectedIds.includes(transaction.idInvestmentAccount) ||
          (transaction.idInvestmentAccountTo !== null &&
            selectedIds.includes(transaction.idInvestmentAccountTo)),
      )
    : ledger;

  const toggle = (id: string) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  const openAccountForm = (account?: (typeof accounts)[number]) =>
    navigation.navigate(ROUTES.INVESTMENT_ACCOUNT_FORM, {
      idInstrument: instrument.idInstrument,
      account,
    });

  return (
    <MainLayout
      title={instrument.nameInstrument}
      subtitle={t('investment.breadcrumb', {
        name: instrument.nameInstrument,
        count: accounts.length,
      })}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
      onRefresh={() => {
        setRefreshKey(key => key + 1);
        return loadInstruments();
      }}
      headerRight={
        <>
          <IconButton
            variant="surface"
            label={t('investment.editTitle')}
            onPress={() =>
              navigation.navigate(ROUTES.INSTRUMENT_FORM, { instrument })
            }
            renderIcon={(color, size) => <Pencil size={size} color={color} />}
          />
          <IconButton
            variant="primary"
            label={t('investment.addAccount')}
            onPress={() => openAccountForm()}
            renderIcon={(color, size) => <Plus size={size} color={color} />}
          />
        </>
      }
    >
      <Reveal>
        <Card>
          <View style={styles.summaryTop}>
            <View style={styles.summaryTexts}>
              <Typography variant="meta" tone="subtle" numberOfLines={1}>
                {t('investment.valueShort')} ·{' '}
                {subset
                  ? t('investment.accountsSelected', { count: selected.length })
                  : t('investment.allAccounts')}
              </Typography>
              <Typography
                variant="heroAmount"
                tabular
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.value}
              >
                {formatNumber(totals.currentValue)}
              </Typography>
            </View>
            <ProfitLossPill
              profitLoss={totals.profitLoss}
              percent={totals.profitLossPercent}
              showAmount
            />
          </View>
          <View style={styles.scope}>
            <Layers size={16} color={colors.primaryText} />
            <Typography
              variant="tileLabel"
              tone="primary"
              numberOfLines={1}
              style={styles.scopeText}
            >
              {subset
                ? selected
                    .map(account => account.nameInvestmentAccount)
                    .join(' + ')
                : t('investment.allAccounts')}
            </Typography>
            {subset && (
              <PressableScale
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setSelectedIds([])}
              >
                <Typography variant="tileLabel" tone="primary">
                  {t('common.all')}
                </Typography>
              </PressableScale>
            )}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendBar,
                  { backgroundColor: instrument.color },
                ]}
              />
              <Typography variant="caption" tone="subtle">
                {t('investment.valueShort')}
              </Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendLine} />
              <Typography variant="caption" tone="subtle">
                {t('investment.capitalShort', {
                  amount: formatNumber(totals.investedAmount),
                })}
              </Typography>
            </View>
          </View>
          {history.length > 0 ? (
            <View style={timelinesLoading && styles.dim}>
              <AreaChart
                height={CHART_HEIGHT}
                labels={history.map(point =>
                  formatTimelineDate(point.date, granularity, i18n.language),
                )}
                labelColor={colors.text3}
                labelFontSize={11.5}
                gridColor={colors.border}
                renderTooltip={index => ({
                  title: formatTimelineDate(
                    history[index].date,
                    granularity,
                    i18n.language,
                    'tooltip',
                  ),
                  rows: [
                    {
                      key: 'current',
                      label: t('investment.valueShort'),
                      value: format(history[index].current),
                      color: instrument.color,
                    },
                    {
                      key: 'invested',
                      label: t('investment.capital'),
                      value: format(history[index].invested),
                      color: colors.text3,
                      marker: 'line',
                      muted: true,
                    },
                  ],
                })}
                series={[
                  {
                    key: 'current',
                    values: history.map(point => point.current),
                    color: instrument.color,
                    strokeWidth: 2.5,
                    fillOpacity: 0.32,
                  },
                  {
                    key: 'invested',
                    values: history.map(point => point.invested),
                    color: colors.text3,
                    strokeWidth: 1.75,
                    strokeOpacity: 0.55,
                    fillOpacity: 0.12,
                  },
                ]}
              />
            </View>
          ) : (
            <View style={styles.noHistory}>
              <Typography variant="secondary" tone="subtle" align="center">
                {t('investment.noHistory')}
              </Typography>
            </View>
          )}
          <SegmentedControl<NetWorthTimelineGranularity>
            size="sm"
            value={granularity}
            onChange={setGranularity}
            options={GRANULARITIES.map(option => ({
              value: option,
              label: t(`investment.netWorth.granularity.${option}`),
            }))}
          />
        </Card>
      </Reveal>

      <Reveal delay={50} style={styles.section}>
        <View style={styles.sectionHead}>
          <Typography variant="cardTitle" style={styles.sectionTitle}>
            {t('investment.accountsLabel')}
          </Typography>
          {accounts.length > 0 && (
            <Typography variant="caption" tone="subtle">
              {t('investment.tapToSelect')}
            </Typography>
          )}
          <PressableScale
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => openAccountForm()}
            style={styles.add}
          >
            <Plus size={16} color={colors.primaryText} />
            <Typography variant="fieldLabel" tone="primary">
              {t('investment.addShort')}
            </Typography>
          </PressableScale>
        </View>
        {accounts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Layers size={30} color={colors.primaryText} />}
              title={t('investment.noAccounts')}
              description={t('investment.noAccountsHint')}
              action={
                <Button
                  label={t('investment.addAccount')}
                  renderIcon={color => <Plus size={18} color={color} />}
                  onPress={() => openAccountForm()}
                />
              }
            />
          </Card>
        ) : (
          accounts.map(account => (
            <AccountCard
              key={account.idInvestmentAccount}
              account={account}
              instrument={instrument}
              sparkline={timelines.accounts[account.idInvestmentAccount] ?? []}
              selected={selectedIds.includes(account.idInvestmentAccount)}
              onToggleSelect={() => toggle(account.idInvestmentAccount)}
              onEdit={() => openAccountForm(account)}
              onWithdraw={() =>
                navigation.navigate(ROUTES.INVESTMENT_WITHDRAW, {
                  idInstrument: instrument.idInstrument,
                  idInvestmentAccount: account.idInvestmentAccount,
                })
              }
              onProfitLoss={() =>
                navigation.navigate(ROUTES.INVESTMENT_PROFIT_LOSS, {
                  idInstrument: instrument.idInstrument,
                  idInvestmentAccount: account.idInvestmentAccount,
                })
              }
            />
          ))
        )}
      </Reveal>

      <Reveal delay={100}>
        <Card>
          <View style={styles.ledgerHead}>
            <Typography variant="cardTitle" style={styles.ledgerTitle}>
              {t('investment.instrumentTransactions', {
                name: instrument.nameInstrument,
              })}
            </Typography>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip
                label={t('common.all')}
                active={typeFilter === 'all'}
                onPress={() => setTypeFilter('all')}
              />
              {TYPES.map(type => (
                <Chip
                  key={type}
                  label={t(`investment.typeShort.${type}`)}
                  active={typeFilter === type}
                  onPress={() =>
                    setTypeFilter(prev => (prev === type ? 'all' : type))
                  }
                />
              ))}
            </ScrollView>
          </View>
          <InvestmentTransactionList
            layout="flat"
            transactions={visibleLedger}
            instruments={instruments}
            emptyMessage={t('investment.noAccountTransactions')}
            loading={!ledgerLoaded}
            refreshing={ledgerLoaded && ledgerLoading}
            onPressTransaction={transaction =>
              navigation.navigate(ROUTES.INVESTMENT_TX_EDIT, { transaction })
            }
          />
        </Card>
      </Reveal>
    </MainLayout>
  );
}
