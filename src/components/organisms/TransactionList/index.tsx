import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { ReceiptText } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import EmptyState from '@/components/molecules/EmptyState';
import ScheduledTransactionRow from '@/components/molecules/ScheduledTransactionRow';
import TransactionRow from '@/components/molecules/TransactionRow';
import TransferRow from '@/components/molecules/TransferRow';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type {
  Category,
  ScheduleOccurrence,
  Transaction,
  WalletAccount,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { MINUS } from '@/utils/money';
import {
  formatDayHeader,
  formatDayHeaderFull,
  groupEntriesByDate,
  type SortWithinDay,
} from '@/utils/transactionGroups';
import { formatTxTime } from '@/utils/txTime';
import { dateTimeFormat } from '@/utils/intl';

export interface TransactionListProps {
  transactions: Transaction[];
  occurrences?: ScheduleOccurrence[];
  categories: Category[];
  wallets: WalletAccount[];
  onPressTransaction?: (transaction: Transaction) => void;
  onPayOccurrence?: (occurrence: ScheduleOccurrence) => void;
  onCancelOccurrence?: (occurrence: ScheduleOccurrence) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  /** Urutan grup hari (default terbaru dulu). */
  order?: 'desc' | 'asc';
  sortWithinDay?: SortWithinDay;
  /** short = "HARI INI" · full = "HARI INI · SENIN 5 OKT". */
  dayHeaderStyle?: 'short' | 'full';
}

const useStyles = makeStyles(() => ({
  list: { gap: 0 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: 14,
    paddingBottom: spacing.xxs,
  },
  dayLabel: { flex: 1, letterSpacing: 0.6, textTransform: 'uppercase' },
  occurrence: { paddingVertical: spacing.xs },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  skeletonTexts: { flex: 1, gap: 6 },
  dim: { opacity: 0.6 },
  skeletonHeader: { marginTop: 14 },
}));

/** Daftar transaksi per hari (header hari + total harian), termasuk tagihan jatuh tempo. */
function TransactionList({
  transactions,
  occurrences = [],
  categories,
  wallets,
  onPressTransaction,
  onPayOccurrence,
  onCancelOccurrence,
  emptyMessage,
  isLoading = false,
  order = 'desc',
  sortWithinDay = 'chronological',
  dayHeaderStyle = 'short',
}: TransactionListProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { format } = useMoneyFormat();
  const locale = toIntlLocale(i18n.language);

  const groups = useMemo(
    () => groupEntriesByDate(transactions, occurrences, order, sortWithinDay),
    [transactions, occurrences, order, sortWithinDay],
  );

  const categoryOf = (id: string | null) =>
    id ? categories.find(c => c.idCategory === id) : undefined;
  const subCategoryOf = (idCategory: string | null, id: string | null) =>
    id
      ? categoryOf(idCategory)?.subCategories.find(s => s.idSubCategory === id)
      : undefined;
  const walletOf = (id: string | null) =>
    id ? wallets.find(w => w.idWallet === id) : undefined;

  if (isLoading && groups.length === 0) {
    return (
      <View>
        <Skeleton width={80} height={12} style={styles.skeletonHeader} />
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.skeletonRow}>
            <Skeleton width={42} height={42} />
            <View style={styles.skeletonTexts}>
              <Skeleton width="45%" height={13} />
              <Skeleton width="30%" height={11} />
            </View>
            <Skeleton width={72} height={13} />
          </View>
        ))}
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText size={32} color={colors.primaryText} />}
        title={emptyMessage ?? t('dashboard.noTransactions')}
      />
    );
  }

  return (
    <View style={[styles.list, isLoading && styles.dim]}>
      {groups.map(group => (
        <View key={group.dateKey}>
          <View style={styles.dayHeader}>
            <Typography
              variant="captionStrong"
              tone="subtle"
              numberOfLines={1}
              style={styles.dayLabel}
            >
              {(dayHeaderStyle === 'full'
                ? formatDayHeaderFull
                : formatDayHeader)(group.date, locale, {
                today: t('transaction.today'),
                yesterday: t('dashboard.yesterday'),
              })}
            </Typography>
            {group.net !== 0 && (
              <Typography variant="caption" tone="subtle" tabular>
                {group.net < 0 ? MINUS : '+'}
                {format(Math.abs(group.net))}
              </Typography>
            )}
          </View>
          {group.entries.map(entry => {
            if (entry.kind === 'occurrence') {
              const { occurrence } = entry;
              const due = new Date(occurrence.dueDate);
              const dueLabel =
                due.toDateString() === new Date().toDateString()
                  ? t('schedule.dueToday')
                  : t('schedule.dueOn', {
                      date: dateTimeFormat(locale, {
                        day: 'numeric',
                        month: 'short',
                      }).format(due),
                    });
              const category = categoryOf(occurrence.idCategory);
              const title =
                occurrence.title ||
                subCategoryOf(occurrence.idCategory, occurrence.idSubCategory)
                  ?.nameSubCategory ||
                category?.nameCategory ||
                '-';
              return (
                <View key={occurrence.idOccurrence} style={styles.occurrence}>
                  <ScheduledTransactionRow
                    title={`${title} · ${t(
                      'schedule.scheduledBadge',
                    ).toLowerCase()}`}
                    meta={[
                      category?.nameCategory,
                      walletOf(occurrence.idWallet)?.nameWallet,
                      dueLabel,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    amount={`${
                      occurrence.type === 'income' ? '+' : MINUS
                    }${format(occurrence.amount)}`}
                    payLabel={t('schedule.payButton')}
                    cancelLabel={t('schedule.cancelButton')}
                    onPay={
                      onPayOccurrence
                        ? () => onPayOccurrence(occurrence)
                        : undefined
                    }
                    onCancel={
                      onCancelOccurrence
                        ? () => onCancelOccurrence(occurrence)
                        : undefined
                    }
                  />
                </View>
              );
            }
            const { transaction } = entry;
            const timeLabel = formatTxTime(transaction.date, i18n.language);
            const onPress = onPressTransaction
              ? () => onPressTransaction(transaction)
              : undefined;
            return transaction.type === 'transfer' ? (
              <TransferRow
                key={transaction.idTransaction}
                transaction={transaction}
                walletFrom={walletOf(transaction.idWalletFrom)}
                walletTo={walletOf(transaction.idWalletTo)}
                format={format}
                timeLabel={timeLabel}
                onPress={onPress}
              />
            ) : (
              <TransactionRow
                key={transaction.idTransaction}
                transaction={transaction}
                category={categoryOf(transaction.idCategory)}
                subCategory={subCategoryOf(
                  transaction.idCategory,
                  transaction.idSubCategory,
                )}
                wallet={walletOf(transaction.idWallet)}
                format={format}
                timeLabel={timeLabel}
                onPress={onPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Memo: layar induk sering dirender ulang karena state sheet/dialog; daftar ini tidak perlu ikut.
export default memo(TransactionList);
