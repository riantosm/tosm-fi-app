import { useMemo } from 'react';
import { View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ReceiptText,
  TrendingUpDown,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import EmptyState from '@/components/molecules/EmptyState';
import TxRow, { type TxAmountTone } from '@/components/molecules/TxRow';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import type { Instrument, InvestmentTransaction } from '@/types';
import { formatRelativeDay } from '@/utils/investment';
import { MINUS } from '@/utils/money';
import { formatTxTime } from '@/utils/txTime';

export interface InvestmentTransactionListProps {
  transactions: InvestmentTransaction[];
  instruments: Instrument[];
  emptyMessage: string;
  onPressTransaction: (transaction: InvestmentTransaction) => void;
  loading?: boolean;
  /** Sedang refetch setelah filter berubah — baris diredupkan. */
  refreshing?: boolean;
  /** grouped = header hari; flat = hari masuk ke meta tiap baris. */
  layout?: 'grouped' | 'flat';
}

const useStyles = makeStyles(() => ({
  list: {},
  dim: { opacity: 0.6 },
  dayHeader: { paddingTop: spacing.md, paddingBottom: spacing.xs },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  skeletonTexts: { flex: 1, gap: 6 },
}));

/** Nama instrumen & akun (akun ter-soft-delete tetap berlabel "(Dihapus)"). */
export function useInvestmentLabels(instruments: Instrument[]) {
  const { t } = useTranslation();
  return (idInstrument: string, idInvestmentAccount: string | null) => {
    const instrument = instruments.find(
      item => item.idInstrument === idInstrument,
    );
    const account = instrument?.investmentAccounts.find(
      item => item.idInvestmentAccount === idInvestmentAccount,
    );
    const accountName = account
      ? account.isDeleted
        ? `${account.nameInvestmentAccount} ${t(
            'investment.deletedAccountSuffix',
          )}`
        : account.nameInvestmentAccount
      : null;
    return { instrumentName: instrument?.nameInstrument ?? '-', accountName };
  };
}

/** Daftar ledger investasi (pen `Q1BjKl` · `Dn41X`): top up, tarik, transfer, update nilai. */
export default function InvestmentTransactionList({
  transactions,
  instruments,
  emptyMessage,
  onPressTransaction,
  loading = false,
  refreshing = false,
  layout = 'grouped',
}: InvestmentTransactionListProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const labels = useInvestmentLabels(instruments);
  const dayLabels = {
    today: t('transaction.today'),
    yesterday: t('transaction.yesterday'),
  };

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { date: Date; items: InvestmentTransaction[] }
    >();
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      const key = date.toDateString();
      const group = map.get(key) ?? { date, items: [] };
      group.items.push(transaction);
      map.set(key, group);
    }
    return Array.from(map.entries());
  }, [transactions]);

  if (loading) {
    return (
      <View>
        {[0, 1, 2, 3].map(index => (
          <View key={index} style={styles.skeletonRow}>
            <Skeleton width={42} height={42} />
            <View style={styles.skeletonTexts}>
              <Skeleton width="45%" height={13} />
              <Skeleton width="30%" height={11} />
            </View>
            <Skeleton width={70} height={13} radius={radius.pill} />
          </View>
        ))}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText size={30} color={colors.primaryText} />}
        title={emptyMessage}
      />
    );
  }

  const renderRow = (transaction: InvestmentTransaction, showDate: boolean) => {
    const source = labels(
      transaction.idInstrument,
      transaction.idInvestmentAccount,
    );
    const destination = transaction.idInstrumentTo
      ? labels(transaction.idInstrumentTo, transaction.idInvestmentAccountTo)
      : null;
    const loss = transaction.type === 'pl' && transaction.amount < 0;
    const magnitude = formatNumber(Math.abs(transaction.amount));
    let Icon = ArrowDownLeft;
    let tone: Tone = 'income';
    let title: string;
    let detail: string | null = transaction.note ?? null;
    let amount = magnitude;
    let amountTone: TxAmountTone = 'neutral';

    switch (transaction.type) {
      case 'out':
        Icon = ArrowUpRight;
        tone = 'expense';
        title = source.accountName
          ? t('investment.row.withdraw', { account: source.accountName })
          : t('investment.withdrawalTitle');
        amount = `${MINUS}${magnitude}`;
        amountTone = 'expense';
        break;
      case 'transfer':
        Icon = ArrowLeftRight;
        tone = 'primary';
        title = destination?.accountName
          ? t('investment.row.transferTo', {
              account: destination.accountName,
            })
          : t('investment.typeFilter.transfer');
        detail = source.accountName
          ? t('investment.row.from', { account: source.accountName })
          : null;
        break;
      case 'pl':
        Icon = TrendingUpDown;
        tone = 'investment';
        title = source.accountName
          ? t('investment.row.update', { account: source.accountName })
          : t('investment.profitLossTitle');
        detail = t(loss ? 'investment.row.loss' : 'investment.row.profit');
        amount = `${loss ? MINUS : '+'}${magnitude}`;
        amountTone = loss ? 'expense' : 'income';
        break;
      default:
        title = source.accountName
          ? t('investment.row.topUp', { account: source.accountName })
          : t('investment.typeFilter.in');
        amount = `+${magnitude}`;
        amountTone = 'income';
    }

    const meta = [
      showDate
        ? formatRelativeDay(
            new Date(transaction.date),
            i18n.language,
            dayLabels,
          )
        : source.instrumentName,
      detail,
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <TxRow
        key={transaction.idInvestmentTransaction}
        tone={tone}
        renderIcon={color => <Icon size={18} color={color} />}
        title={title}
        meta={meta}
        amount={amount}
        amountTone={amountTone}
        caption={formatTxTime(transaction.date, i18n.language)}
        onPress={() => onPressTransaction(transaction)}
      />
    );
  };

  return (
    <View style={refreshing && styles.dim}>
      {layout === 'flat'
        ? transactions.map(transaction => renderRow(transaction, true))
        : groups.map(([key, group]) => (
            <View key={key}>
              <Typography
                variant="captionStrong"
                tone="muted"
                style={styles.dayHeader}
              >
                {formatRelativeDay(group.date, i18n.language, dayLabels, true)}
              </Typography>
              {group.items.map(transaction => renderRow(transaction, false))}
            </View>
          ))}
    </View>
  );
}
