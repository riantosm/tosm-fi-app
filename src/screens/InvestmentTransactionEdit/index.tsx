import { useState } from 'react';
import { View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  NotebookPen,
  Trash2,
  TrendingUpDown,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import AmountField from '@/components/molecules/AmountField';
import CheckboxRow from '@/components/molecules/CheckboxRow';
import TextField from '@/components/molecules/TextField';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import InvestmentDateTimeField from '@/components/organisms/InvestmentDateTimeField';
import { useInvestmentLabels } from '@/components/organisms/InvestmentTransactionList';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import type { InvestmentTransactionType } from '@/types';
import { formatNumberInput, parseFormattedNumber } from '@/utils/numberInput';

const TYPE_BADGE: Record<
  InvestmentTransactionType,
  { tone: Tone; Icon: typeof ArrowDownLeft }
> = {
  in: { tone: 'income', Icon: ArrowDownLeft },
  out: { tone: 'expense', Icon: ArrowUpRight },
  transfer: { tone: 'primary', Icon: ArrowLeftRight },
  pl: { tone: 'investment', Icon: TrendingUpDown },
};

const useStyles = makeStyles(({ colors }) => ({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  delete: { width: 50, height: 50, backgroundColor: colors.expenseSoft },
  footerButton: { flex: 1 },
}));

/** Edit / hapus transaksi investasi (pen `ngkTb`) — port EditInvestmentTransactionModal web. */
export default function InvestmentTransactionEditScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INVESTMENT_TX_EDIT>) {
  const styles = useStyles();
  const { colors, tones } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { instruments } = useInstruments({ autoLoad: false });
  const { editInvestmentTransaction, deleteInvestmentTransaction } =
    useInvestmentTransactions();
  const labels = useInvestmentLabels(instruments);
  const { transaction } = route.params;
  const close = navigation.goBack;
  const isPl = transaction.type === 'pl';
  const isOut = transaction.type === 'out';

  const [amountInput, setAmountInput] = useState(
    formatNumberInput(String(Math.abs(transaction.amount)).replace('.', ',')),
  );
  const [negative, setNegative] = useState(transaction.amount < 0);
  const [date, setDate] = useState(() => new Date(transaction.date));
  const [note, setNote] = useState(transaction.note ?? '');
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [sheet, setSheet] = useState<'delete' | null>(null);

  const source = labels(
    transaction.idInstrument,
    transaction.idInvestmentAccount,
  );
  const destination = transaction.idInstrumentTo
    ? labels(transaction.idInstrumentTo, transaction.idInvestmentAccountTo)
    : null;
  const badge = TYPE_BADGE[transaction.type];

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('investment.genericError'),
      'error',
    );

  const save = async () => {
    const magnitude = parseFormattedNumber(amountInput);
    if (magnitude <= 0) {
      return showToast(t('transaction.amountRequiredError'), 'error');
    }
    setBusy('save');
    try {
      await editInvestmentTransaction(transaction.idInvestmentTransaction, {
        amount: isPl && negative ? -magnitude : magnitude,
        date: date.toISOString(),
        ...(isOut && { note: note || undefined }),
      });
      showToast(t('investment.transactionUpdateSuccess'), 'success');
      close();
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await deleteInvestmentTransaction(
        transaction.idInvestmentTransaction,
        transaction.idTransaction !== null,
      );
      showToast(t('investment.transactionDeleteSuccess'), 'success');
      setSheet(null);
      close();
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t('investment.editTransactionTitle')}
        subtitle={
          destination
            ? `${source.accountName ?? '-'} → ${destination.accountName ?? '-'}`
            : `${source.accountName ?? '-'} · ${source.instrumentName}`
        }
        footer={
          <>
            <IconButton
              label={t('investment.deleteButton')}
              disabled={!!busy}
              onPress={() => setSheet('delete')}
              style={styles.delete}
              renderIcon={(_, size) => (
                <Trash2 size={size} color={colors.expenseText} />
              )}
            />
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={!!busy}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t('investment.save')}
              renderIcon={color => <Check size={18} color={color} />}
              loading={busy === 'save'}
              disabled={!!busy}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badgePill,
              { backgroundColor: tones[badge.tone].soft },
            ]}
          >
            <badge.Icon size={14} color={tones[badge.tone].text} />
            <Typography
              variant="captionStrong"
              style={{ color: tones[badge.tone].text }}
            >
              {t(`investment.typeFilter.${transaction.type}`)}
            </Typography>
          </View>
          {destination && (
            <Typography variant="meta" tone="subtle">
              {t('investment.row.from', { account: source.accountName ?? '-' })}
            </Typography>
          )}
        </View>
        <AmountField
          label={t(
            isPl
              ? 'investment.profitLossPreviewLabel'
              : 'investment.amountLabel',
          )}
          value={amountInput}
          onChange={setAmountInput}
        />
        {isPl && (
          <CheckboxRow
            checked={negative}
            onChange={setNegative}
            title={t('investment.negativeChangeLabel')}
            hint={t('investment.negativeChangeHint')}
          />
        )}
        <InvestmentDateTimeField value={date} onChange={setDate} />
        {isOut && (
          <TextField
            variant="filled"
            label={t('investment.noteLabel')}
            value={note}
            onChangeText={setNote}
            placeholder={t('investment.notePlaceholder')}
            autoCapitalize="sentences"
            renderLeadingIcon={color => <NotebookPen size={18} color={color} />}
          />
        )}
      </SheetLayout>

      <ConfirmDialog
        visible={sheet === 'delete'}
        tone="danger"
        renderIcon={color => <Trash2 size={24} color={color} />}
        title={t('investment.deleteTransactionConfirmTitle')}
        message={t('investment.deleteTransactionConfirmDescription')}
        confirmLabel={t('investment.deleteTransactionConfirmAction')}
        cancelLabel={t('common.cancel')}
        loading={busy === 'delete'}
        onConfirm={remove}
        onCancel={() => setSheet(null)}
      />
    </>
  );
}
