import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Chip from '@/components/atoms/Chip';
import Typography from '@/components/atoms/Typography';
import Keypad from '@/components/molecules/Keypad';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useAmountCalculator } from '@/hooks/useAmountCalculator';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { WalletAccount } from '@/types';

export interface AmountCalculatorSheetProps {
  visible: boolean;
  amount: number;
  /** Kosong → baris pilih dompet disembunyikan (transfer). */
  wallets?: WalletAccount[];
  selectedWalletId?: string | null;
  onSelectWallet?: (id: string) => void;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

const useStyles = makeStyles(({ colors }) => ({
  display: {
    minHeight: 106,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  symbol: { fontFamily: fonts.displayMedium, fontSize: 18 },
  wallets: { alignItems: 'center', gap: spacing.sm },
}));

/** Kalkulator nominal (pen `U0tbU`): tampilan ekspresi + nilai, pilih dompet, keypad. */
export default function AmountCalculatorSheet(
  props: AmountCalculatorSheetProps,
) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={props.visible}
      title={t('transaction.amountTitle')}
      subtitle={t('transaction.amountSubtitle')}
      closeLabel={t('common.close')}
      onClose={props.onClose}
      scroll={false}
    >
      {/* Isi dipasang ulang tiap dibuka supaya kalkulator mulai dari nominal terbaru. */}
      {props.visible && <CalculatorBody {...props} />}
    </BottomSheet>
  );
}

function CalculatorBody({
  amount,
  wallets = [],
  selectedWalletId,
  onSelectWallet,
  onClose,
  onConfirm,
}: AmountCalculatorSheetProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { symbol } = useMoneyFormat();
  const calc = useAmountCalculator(amount);
  const fontSize =
    calc.displayValue.length > 14
      ? 28
      : calc.displayValue.length > 11
      ? 34
      : 42;

  const confirm = () => {
    onConfirm(Math.max(0, calc.value));
    onClose();
  };

  return (
    <>
      <View style={styles.display}>
        <Typography variant="secondary" tone="subtle" tabular numberOfLines={1}>
          {calc.hasExpression ? calc.expressionDisplay : ' '}
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
            style={{ fontSize, lineHeight: fontSize * 1.15 }}
          >
            {calc.displayValue}
          </Typography>
        </View>
      </View>
      {wallets.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wallets}
        >
          <Typography variant="meta" tone="subtle">
            {t('transaction.fromWalletShort')}
          </Typography>
          {wallets.map(wallet => (
            <Chip
              key={wallet.idWallet}
              variant="outline"
              label={wallet.nameWallet}
              dot={wallet.color}
              active={wallet.idWallet === selectedWalletId}
              onPress={() => onSelectWallet?.(wallet.idWallet)}
            />
          ))}
        </ScrollView>
      )}
      <Keypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
        decimalLabel={calc.decimalSeparator}
        confirmLabel={t('transaction.amountDone')}
        backspaceLabel={t('common.backspace')}
        onConfirm={confirm}
      />
    </>
  );
}
