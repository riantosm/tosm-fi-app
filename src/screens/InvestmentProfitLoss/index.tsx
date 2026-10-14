import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Check, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import InvestmentAccountSummary from '@/components/molecules/InvestmentAccountSummary';
import InvestmentDateTimeField from '@/components/organisms/InvestmentDateTimeField';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTimelines } from '@/hooks/useInvestmentData';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import { formatPercent, timelineValueAt } from '@/utils/investment';
import { toIntlLocale } from '@/utils/locale';
import { formatNumberInput, parseFormattedNumber } from '@/utils/numberInput';
import { dateTimeFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  valueBox: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  valueBoxFocused: { borderColor: colors.primary },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 18 },
  input: {
    minWidth: 60,
    maxWidth: 260,
    padding: 0,
    fontFamily: fonts.num,
    fontSize: 36,
    letterSpacing: -0.7,
    color: colors.text,
    textAlign: 'center',
  },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  deltaSame: { backgroundColor: colors.surface2 },
  deltaUp: { backgroundColor: colors.incomeSoft },
  deltaDown: { backgroundColor: colors.expenseSoft },
  deltaIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  deltaTexts: { flex: 1, gap: 1 },
  footerButton: { flex: 1 },
}));

/** Update nilai / catat profit-rugi (pen `pJ1a2`) — port ProfitLossFormModal web. */
export default function InvestmentProfitLossScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INVESTMENT_PROFIT_LOSS>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const { symbol, formatNumber } = useMoneyFormat();
  const { instruments } = useInstruments({ autoLoad: false });
  const { createProfitLoss } = useInvestmentTransactions();
  const close = navigation.goBack;
  const instrument = instruments.find(
    item => item.idInstrument === route.params.idInstrument,
  );
  const account = instrument?.investmentAccounts.find(
    item => item.idInvestmentAccount === route.params.idInvestmentAccount,
  );
  // Dibekukan saat dibuka: nilai tercatat berubah setelah simpan (muat ulang instrumen).
  const [currentValue] = useState(account?.currentValue ?? 0);
  const [valueInput, setValueInput] = useState(
    formatNumberInput(String(currentValue).replace('.', ',')),
  );
  const [date, setDate] = useState(() => new Date());
  // Nilai baru = nilai PER tanggal terpilih (backend menghitung delta dengan cara sama), jadi
  // update bertanggal mundur dibandingkan dengan nilai akun pada tanggal itu.
  const { timelines } = useInvestmentTimelines();
  const series = timelines.accounts[route.params.idInvestmentAccount] ?? [];
  const latestPoint = series[series.length - 1];
  const isBackdated =
    latestPoint !== undefined &&
    date.getTime() < new Date(latestPoint.date).getTime();
  const recorded = isBackdated ? timelineValueAt(series, date) : currentValue;
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  const newValue = parseFormattedNumber(valueInput);
  const delta = newValue - recorded;
  const loss = delta < 0;
  const deltaPercent = recorded > 0 ? (delta / recorded) * 100 : 0;
  const Trend = loss ? TrendingDown : TrendingUp;

  const save = async () => {
    if (!instrument || !account) {
      return;
    }
    if (newValue < 0) {
      return showToast(t('investment.negativeValueError'), 'error');
    }
    if (delta === 0) {
      return showToast(t('investment.noOpProfitLossError'), 'error');
    }
    setSaving(true);
    try {
      await createProfitLoss({
        idInstrument: instrument.idInstrument,
        idInvestmentAccount: account.idInvestmentAccount,
        newCurrentValue: newValue,
        date: date.toISOString(),
      });
      showToast(t('investment.profitLossSuccess'), 'success');
      close();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('investment.genericError'),
        'error',
      );
      setSaving(false);
    }
  };

  return (
    <SheetLayout
      onClose={close}
      closeLabel={t('common.close')}
      title={t('investment.profitLossTitle')}
      subtitle={t('investment.profitLossSubtitle')}
      footer={
        <>
          <Button
            variant="outline"
            label={t('common.cancel')}
            disabled={saving}
            onPress={close}
            style={styles.footerButton}
          />
          <Button
            label={t('investment.saveValue')}
            renderIcon={color => <Check size={18} color={color} />}
            loading={saving}
            disabled={delta === 0 || !account}
            onPress={save}
            style={styles.footerButton}
          />
        </>
      }
    >
      {account && (
        <InvestmentAccountSummary
          title={account.nameInvestmentAccount}
          subtitle={
            isBackdated
              ? t('investment.recordedValueOn', {
                  date: dateTimeFormat(toIntlLocale(i18n.language), {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(date),
                  amount: formatNumber(recorded),
                })
              : t('investment.recordedValue', {
                  amount: formatNumber(recorded),
                })
          }
        />
      )}
      <InvestmentDateTimeField value={date} onChange={setDate} />
      <View style={[styles.valueBox, focused && styles.valueBoxFocused]}>
        <Typography variant="meta" tone="subtle">
          {t('investment.newCurrentValueLabel')}
        </Typography>
        <View style={styles.valueRow}>
          <Typography tone="subtle" style={styles.symbol}>
            {symbol}
          </Typography>
          <TextInput
            value={valueInput}
            onChangeText={raw => setValueInput(formatNumberInput(raw))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="decimal-pad"
            selectTextOnFocus
            placeholder="0"
            placeholderTextColor={colors.text3}
            selectionColor={colors.primary}
            accessibilityLabel={t('investment.newCurrentValueLabel')}
            style={styles.input}
          />
        </View>
      </View>
      <Reveal
        variant="fade"
        key={delta === 0 ? 'same' : loss ? 'down' : 'up'}
        style={[
          styles.delta,
          delta === 0
            ? styles.deltaSame
            : loss
            ? styles.deltaDown
            : styles.deltaUp,
        ]}
      >
        <View style={styles.deltaIcon}>
          <Trend
            size={18}
            color={
              delta === 0
                ? colors.text3
                : loss
                ? colors.expenseText
                : colors.incomeText
            }
          />
        </View>
        {delta === 0 ? (
          <Typography
            variant="secondary"
            tone="muted"
            style={styles.deltaTexts}
          >
            {t('investment.profitLossNoChange')}
          </Typography>
        ) : (
          <View style={styles.deltaTexts}>
            <Typography
              variant="num"
              tone={loss ? 'expense' : 'income'}
              tabular
            >
              {loss
                ? t('investment.lossAmount', {
                    amount: formatNumber(Math.abs(delta)),
                  })
                : t('investment.profitAmount', { amount: formatNumber(delta) })}
            </Typography>
            {recorded > 0 && (
              <Typography variant="meta" tone={loss ? 'expense' : 'income'}>
                {t(
                  loss
                    ? 'investment.downFromRecorded'
                    : 'investment.upFromRecorded',
                  { percent: formatPercent(deltaPercent, i18n.language) },
                )}
              </Typography>
            )}
          </View>
        )}
      </Reveal>
    </SheetLayout>
  );
}
