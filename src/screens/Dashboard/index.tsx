import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { CalendarX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/molecules/Card';
import SectionHead from '@/components/molecules/SectionHead';
import CategoryBreakdownChart from '@/components/organisms/CategoryBreakdownChart';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import TransactionList from '@/components/organisms/TransactionList';
import MainLayout from '@/components/templates/MainLayout';
import { useMoreSheetActions } from '@/contexts/MoreSheetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useBudgets';
import { useBudgetSpending } from '@/hooks/useBudgetSpending';
import { useCategories } from '@/hooks/useCategories';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useInstruments } from '@/hooks/useInstruments';
import { useScheduleOccurrences } from '@/hooks/useScheduleOccurrences';
import { useThemePreference } from '@/hooks/useThemePreference';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import { openTransaction } from '@/navigation/openTransaction';
import { ROUTES } from '@/navigation/paths';
import type {
  MainTabScreenProps,
  TransactionsParams,
} from '@/navigation/types';
import type {
  ScheduleOccurrence,
  Transaction,
  TransactionSummary,
  WalletAccount,
} from '@/types';
import { buildCategoryBreakdown } from '@/utils/categoryBreakdown';
import { getGreetingKey } from '@/utils/greeting';
import { toIntlLocale } from '@/utils/locale';
import { formatMonthParam, startOfMonth } from '@/utils/month';
import { filterOccurrencesForView } from '@/utils/scheduleOccurrenceFilter';
import BudgetsCard from '@/screens/Dashboard/BudgetsCard';
import FinancialHealthCard from '@/screens/Dashboard/FinancialHealthCard';
import HeroBand from '@/screens/Dashboard/HeroBand';
import MonthlySummaryCard from '@/screens/Dashboard/MonthlySummaryCard';
import WalletsCard from '@/screens/Dashboard/WalletsCard';
import { dateTimeFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

const PAGE_SIZE = 10;

/** Dashboard HP (pen `yHRM4`): urutan kartu sama dengan design. */
export default function DashboardScreen({
  navigation,
}: MainTabScreenProps<typeof ROUTES.DASHBOARD>) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const showToast = useToast();
  const moreSheet = useMoreSheetActions();
  const { user } = useAuth();
  const { isDark, toggle: toggleTheme } = useThemePreference();

  const [refreshKey, setRefreshKey] = useState(0);
  const {
    wallets,
    status: walletsStatus,
    loadWallets,
    setPrimaryWallet,
  } = useWallets();
  const {
    categories,
    status: categoriesStatus,
    loadCategories,
  } = useCategories();
  const { budgets, status: budgetsStatus, loadBudgets } = useBudgets();
  const { loadInstruments } = useInstruments();
  const { occurrences, loadPendingOccurrences, cancelOccurrence } =
    useScheduleOccurrences();
  const { version, queryTransactions } = useTransactions();
  const { summary, isLoading: summaryLoading } =
    useDashboardSummary(refreshKey);
  const { categoryBreakdown, isLoading: spendingLoading } =
    useBudgetSpending(refreshKey);

  // Transaksi bulan ini, 10 per halaman (infinite scroll), refetch saat ada mutasi.
  const month = formatMonthParam(startOfMonth(new Date()));
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Transaction[]>([]);
  const [monthSummary, setMonthSummary] = useState<TransactionSummary | null>(
    null,
  );
  const [monthTotal, setMonthTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const resetKey = `${version}-${refreshKey}`;
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
    setListLoading(true);
    queryTransactions({ month, page, limit: PAGE_SIZE })
      .then(result => {
        if (cancelled) {
          return;
        }
        setItems(prev =>
          page === 1 ? result.transactions : [...prev, ...result.transactions],
        );
        setTotalPages(result.totalPages ?? 0);
        setMonthTotal(result.total ?? 0);
        setMonthSummary(result.summary);
      })
      .catch(() => {})
      .finally(() => !cancelled && setListLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month, page, resetKey, queryTransactions]);

  const hasMore = page < totalPages;
  const loadMore = useCallback(() => {
    if (hasMore && !listLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, listLoading]);

  const visibleOccurrences = useMemo(
    () => filterOccurrencesForView(occurrences, { month }),
    [occurrences, month],
  );
  const slices = useMemo(
    () =>
      monthSummary
        ? buildCategoryBreakdown(monthSummary.categoryBreakdown)
        : [],
    [monthSummary],
  );

  const payOccurrence = useCallback(
    (occurrence: ScheduleOccurrence) =>
      navigation.navigate(ROUTES.PAY_OCCURRENCE, { occurrence }),
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshKey(key => key + 1);
    await Promise.all([
      loadWallets(),
      loadCategories(),
      loadBudgets(),
      loadInstruments(),
      loadPendingOccurrences(),
    ]);
  }, [
    loadWallets,
    loadCategories,
    loadBudgets,
    loadInstruments,
    loadPendingOccurrences,
  ]);

  const handleSetPrimary = async (wallet: WalletAccount) => {
    try {
      await setPrimaryWallet(wallet.idWallet);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('wallet.genericError'),
        'error',
      );
    }
  };

  // Batalkan tagihan: konfirmasi dulu (dialog tengah), lalu toast hasil.
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

  const openTransactions = (params: Omit<TransactionsParams, 'requestId'>) =>
    navigation.navigate(ROUTES.TRANSACTIONS, {
      ...params,
      requestId: Date.now(),
    });

  const firstName =
    user?.nameUser?.trim().split(/\s+/)[0] ||
    user?.username ||
    t('dashboard.greetingFallbackName');
  const locale = toIntlLocale(i18n.language);

  const sections = [
    <BudgetsCard
      key="budgets"
      budgets={budgets}
      categoryBreakdown={categoryBreakdown}
      isLoading={budgetsStatus !== 'loaded' || spendingLoading}
      onSeeAll={() => navigation.navigate(ROUTES.BUDGETS)}
      onOpenBudget={budget =>
        navigation.navigate(ROUTES.BUDGET_DETAIL, { idBudget: budget.idBudget })
      }
    />,
    <MonthlySummaryCard
      key="summary"
      summary={summary}
      transactionCount={monthTotal}
      isLoading={summaryLoading}
      onOpenIncome={() => openTransactions({ type: 'income' })}
      onOpenExpense={() => openTransactions({ type: 'expense' })}
      onOpenInvestment={() => navigation.navigate(ROUTES.INVESTMENT)}
    />,
    <FinancialHealthCard
      key="health"
      summary={summary}
      isLoading={summaryLoading}
    />,
    <CategoryBreakdownChart
      key="categories"
      slices={slices}
      title={t('dashboard.expenseByCategory')}
      periodLabel={t('dashboard.thisMonth')}
      actionLabel={t('dashboard.reportsLink')}
      onAction={() => navigation.navigate(ROUTES.REPORTS)}
      isLoading={listLoading && page === 1}
      onSelectCategory={slice =>
        openTransactions({ type: 'expense', idCategory: slice.id })
      }
      onSelectSubCategory={(sub, parent) =>
        openTransactions({
          type: 'expense',
          idCategory: parent.id,
          idSubCategory: sub.id,
        })
      }
    />,
    <WalletsCard
      key="wallets"
      wallets={wallets}
      status={walletsStatus}
      onSetPrimary={handleSetPrimary}
      onCorrectBalance={wallet =>
        navigation.navigate(ROUTES.BALANCE_CORRECTION, {
          idWallet: wallet.idWallet,
        })
      }
      onManage={() => navigation.navigate(ROUTES.WALLET)}
      onAddWallet={() => navigation.navigate(ROUTES.WALLET_FORM)}
    />,
    <Card key="transactions">
      <SectionHead
        eyebrow={t('dashboard.activityEyebrow')}
        title={t('dashboard.recentTransactions')}
        actionLabel={t('dashboard.seeAll')}
        onAction={() => navigation.navigate(ROUTES.TRANSACTIONS)}
      />
      <TransactionList
        transactions={items}
        occurrences={visibleOccurrences}
        categories={categories}
        wallets={wallets}
        onCancelOccurrence={setCancelling}
        onPayOccurrence={payOccurrence}
        onPressTransaction={openTransaction}
        isLoading={
          (listLoading && page === 1) ||
          walletsStatus !== 'loaded' ||
          categoriesStatus !== 'loaded'
        }
      />
      {hasMore && listLoading && page > 1 && (
        <ActivityIndicator color={colors.primary} />
      )}
    </Card>,
  ];

  return (
    <MainLayout
      title={t('nav.dashboard')}
      withTabBar
      onRefresh={handleRefresh}
      onEndReached={loadMore}
      renderHero={insetTop => (
        <HeroBand
          insetTop={insetTop}
          appName={t('common.appName')}
          userName={user?.nameUser ?? ''}
          greeting={t(getGreetingKey(), { name: firstName })}
          summary={summary}
          isLoading={summaryLoading}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onSearch={() => openTransactions({ focusSearch: true })}
          onOpenMenu={moreSheet.open}
          onOpenWallets={() => navigation.navigate(ROUTES.WALLET)}
          onOpenInvestment={() => navigation.navigate(ROUTES.INVESTMENT)}
        />
      )}
    >
      {sections.map((section, index) => (
        <Reveal delay={index * 50} key={section.key}>
          {section}
        </Reveal>
      ))}
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
