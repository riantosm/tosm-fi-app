import { useState } from 'react';
import { View } from 'react-native';
import {
  CalendarClock,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import WalletTile from '@/components/atoms/WalletTile';
import Keypad from '@/components/molecules/Keypad';
import PickerField from '@/components/molecules/PickerField';
import TextField from '@/components/molecules/TextField';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAmountCalculator } from '@/hooks/useAmountCalculator';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useTransactions } from '@/hooks/useTransactions';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { Transaction, TransactionInput, WalletAccount } from '@/types';
import { formatDateTimeLabel } from '@/utils/txTime';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: 18,
  },
  walletTexts: { flex: 1, gap: 1 },
  walletName: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  walletNameText: { flexShrink: 1 },
  display: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 18 },
  value: { flexShrink: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    marginTop: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  pillSame: { backgroundColor: colors.surface },
  pillDown: { backgroundColor: colors.expenseSoft },
  pillUp: { backgroundColor: colors.incomeSoft },
  pillText: { flexShrink: 1 },
}));

/**
 * Koreksi saldo (pen `kdRVQ`) — port BalanceCorrectionModal web. Kalkulator mulai dari saldo
 * dompet; selisih terhadap saldo tercatat disimpan sebagai transaksi `correction`.
 */
export default function BalanceCorrectionScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.BALANCE_CORRECTION>) {
  const { idWallet, transaction } = route.params;
  const liveWallet = useAppSelector(state =>
    state.wallet.wallets.find(item => item.idWallet === idWallet),
  );
  // Dibekukan selama sheet terbuka: saldo store berubah setelah simpan (resync).
  const [wallet] = useState(liveWallet);

  if (!wallet) {
    return null;
  }
  return (
    <CorrectionSheet
      wallet={wallet}
      transaction={transaction ?? null}
      onClose={navigation.goBack}
    />
  );
}

function CorrectionSheet({
  wallet,
  transaction,
  onClose,
}: {
  wallet: WalletAccount;
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const { symbol, format, formatSigned } = useMoneyFormat();
  const { createTransaction, editTransaction, deleteTransaction } =
    useTransactions();

  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [date, setDate] = useState(() =>
    transaction ? new Date(transaction.date) : new Date(),
  );
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [sheet, setSheet] = useState<'date' | 'delete' | null>(null);

  // Saldo sebelum koreksi ini (saat edit, koreksi lama dikeluarkan dulu).
  const baseBalance = transaction
    ? wallet.balance - transaction.amount
    : wallet.balance;
  const calc = useAmountCalculator(wallet.balance);
  const delta = calc.value - baseBalance;
  const DeltaIcon = delta < 0 ? TrendingDown : TrendingUp;
  const fontSize =
    calc.displayValue.length > 14
      ? 28
      : calc.displayValue.length > 11
      ? 34
      : 40;

  const save = async () => {
    if (delta === 0 && !transaction) {
      onClose();
      return;
    }
    setBusy('save');
    try {
      const input: TransactionInput = {
        type: 'correction',
        idWallet: wallet.idWallet,
        idCategory: null,
        idSubCategory: null,
        idWalletFrom: null,
        idWalletTo: null,
        title: t('transaction.balanceCorrection'),
        notes: notes.trim(),
        amount: delta,
        date: date.toISOString(),
      };
      if (transaction) {
        await editTransaction(transaction.idTransaction, input);
        showToast(t('transaction.updateSuccess'), 'success');
      } else {
        await createTransaction(input);
        showToast(t('transaction.createSuccess'), 'success');
      }
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('transaction.genericError'),
        'error',
      );
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!transaction) {
      return;
    }
    setBusy('delete');
    try {
      await deleteTransaction(transaction.idTransaction);
      showToast(t('transaction.deleteSuccess'), 'success');
      setSheet(null);
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('transaction.genericError'),
        'error',
      );
      setBusy(null);
    }
  };

  return (
    <>
      <SheetLayout
        onClose={onClose}
        closeLabel={t('common.close')}
        title={t('wallet.correctionTitle')}
        subtitle={t('wallet.correctionSubtitle')}
        headerActions={
          transaction && (
            <IconButton
              label={t('transaction.deleteButton')}
              disabled={!!busy}
              onPress={() => setSheet('delete')}
              renderIcon={(_, size) => (
                <Trash2 size={size} color={colors.expenseText} />
              )}
            />
          )
        }
      >
        <View style={[styles.wallet, { backgroundColor: `${wallet.color}1F` }]}>
          <WalletTile color={wallet.color} radius={radius.pill} onTint />
          <View style={styles.walletTexts}>
            <View style={styles.walletName}>
              <Typography
                variant="label"
                numberOfLines={1}
                style={styles.walletNameText}
              >
                {wallet.nameWallet}
              </Typography>
              {wallet.isPrimary && <Badge label={t('wallet.primary')} />}
            </View>
            <Typography variant="meta" tone="muted" tabular numberOfLines={1}>
              {t('wallet.recordedBalance', { amount: format(baseBalance) })}
            </Typography>
          </View>
        </View>

        <View style={styles.display}>
          <Typography variant="meta" tone="subtle" tabular numberOfLines={1}>
            {calc.hasExpression
              ? calc.expressionDisplay
              : t('wallet.actualBalance')}
          </Typography>
          <View style={styles.valueRow}>
            <Typography tone="subtle" style={styles.symbol}>
              {symbol}
            </Typography>
            <Typography
              variant="amount"
              tabular
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.value, { fontSize, lineHeight: fontSize * 1.15 }]}
            >
              {calc.displayValue}
            </Typography>
          </View>
          <Reveal
            variant="fade"
            key={delta === 0 ? 'same' : delta < 0 ? 'down' : 'up'}
            style={[
              styles.pill,
              delta === 0
                ? styles.pillSame
                : delta < 0
                ? styles.pillDown
                : styles.pillUp,
            ]}
          >
            {delta !== 0 && (
              <DeltaIcon
                size={14}
                color={delta < 0 ? colors.expenseText : colors.incomeText}
              />
            )}
            <Typography
              variant="captionStrong"
              tone={delta === 0 ? 'subtle' : delta < 0 ? 'expense' : 'income'}
              numberOfLines={1}
              style={styles.pillText}
            >
              {delta === 0
                ? t('wallet.noDifference')
                : t('wallet.differenceNote', { amount: formatSigned(delta) })}
            </Typography>
          </Reveal>
        </View>

        <PickerField
          label={t('transaction.dateTimeLabel')}
          value={formatDateTimeLabel(date, i18n.language, {
            today: t('transaction.today'),
            yesterday: t('transaction.yesterday'),
          })}
          renderIcon={iconColor => (
            <CalendarClock size={18} color={iconColor} />
          )}
          onPress={() => setSheet('date')}
        />

        <TextField
          variant="filled"
          label={t('transaction.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('transaction.notesPlaceholder')}
          autoCapitalize="sentences"
        />

        <Keypad
          onDigit={calc.handleDigit}
          onDecimal={calc.handleDecimal}
          onTripleZero={calc.handleTripleZero}
          onOperator={calc.handleOperator}
          onBackspace={calc.handleBackspace}
          decimalLabel={calc.decimalSeparator}
          confirmLabel={t('wallet.saveCorrection')}
          backspaceLabel={t('common.backspace')}
          confirming={busy === 'save'}
          onConfirm={() => {
            if (!busy) {
              save();
            }
          }}
        />
      </SheetLayout>

      <DateTimePickerSheet
        visible={sheet === 'date'}
        value={date}
        onClose={() => setSheet(null)}
        onConfirm={setDate}
      />
      <ConfirmDialog
        visible={sheet === 'delete'}
        tone="danger"
        renderIcon={iconColor => <Trash2 size={24} color={iconColor} />}
        title={t('transaction.deleteConfirmTitle')}
        message={t('transaction.deleteConfirmDescription')}
        confirmLabel={t('transaction.deleteConfirmAction')}
        cancelLabel={t('common.cancel')}
        loading={busy === 'delete'}
        onConfirm={remove}
        onCancel={() => setSheet(null)}
      />
    </>
  );
}
