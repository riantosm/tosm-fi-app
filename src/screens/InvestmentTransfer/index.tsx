import { useState } from 'react';
import { View } from 'react-native';
import { ArrowLeftRight, ArrowRight, ArrowUpDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import Typography from '@/components/atoms/Typography';
import AmountField from '@/components/molecules/AmountField';
import InvestmentAccountSummary from '@/components/molecules/InvestmentAccountSummary';
import InvestmentDateTimeField from '@/components/organisms/InvestmentDateTimeField';
import InvestmentTargetSheet from '@/components/organisms/InvestmentTargetSheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { parseFormattedNumber } from '@/utils/numberInput';
import Reveal from '@/components/atoms/Reveal';

interface AccountRef {
  idInstrument: string;
  idInvestmentAccount: string;
}

const useStyles = makeStyles(({ colors }) => ({
  sides: { alignItems: 'center', gap: 6 },
  side: { alignSelf: 'stretch' },
  swap: { backgroundColor: colors.primarySoft },
  previews: { flexDirection: 'row', gap: 10 },
  preview: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewBefore: { flexShrink: 1 },
  footerButton: { flex: 1 },
}));

/** Transfer antar akun (pen `JdZov`) — port TransferFormModal web. */
export default function InvestmentTransferScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.INVESTMENT_TRANSFER>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { formatNumber } = useMoneyFormat();
  const { instruments } = useInstruments();
  const { createTransfer } = useInvestmentTransactions();
  const close = navigation.goBack;
  const [from, setFrom] = useState<AccountRef | null>(null);
  const [to, setTo] = useState<AccountRef | null>(null);
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  const resolve = (ref: AccountRef | null) => {
    if (!ref) {
      return null;
    }
    const instrument = instruments.find(
      item => item.idInstrument === ref.idInstrument,
    );
    const account = instrument?.investmentAccounts.find(
      item => item.idInvestmentAccount === ref.idInvestmentAccount,
    );
    return instrument && account ? { instrument, account } : null;
  };
  const source = resolve(from);
  const destination = resolve(to);
  const amount = parseFormattedNumber(amountInput);
  const pickingRef = picking === 'from' ? from : picking === 'to' ? to : null;

  const save = async () => {
    if (amount <= 0) {
      return showToast(t('transaction.amountRequiredError'), 'error');
    }
    if (!from) {
      return showToast(
        t('investment.selectSourceAccountRequiredError'),
        'error',
      );
    }
    if (!to) {
      return showToast(
        t('investment.selectDestinationAccountRequiredError'),
        'error',
      );
    }
    if (from.idInvestmentAccount === to.idInvestmentAccount) {
      return showToast(t('investment.transferSameAccountError'), 'error');
    }
    setSaving(true);
    try {
      await createTransfer({
        idInstrument: from.idInstrument,
        idInvestmentAccount: from.idInvestmentAccount,
        idInstrumentTo: to.idInstrument,
        idInvestmentAccountTo: to.idInvestmentAccount,
        amount,
        date: date.toISOString(),
      });
      showToast(t('investment.transferSuccess'), 'success');
      close();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('investment.genericError'),
        'error',
      );
      setSaving(false);
    }
  };

  const renderSide = (side: 'from' | 'to') => {
    const resolved = side === 'from' ? source : destination;
    return (
      <View style={styles.side}>
        <InvestmentAccountSummary
          eyebrow={t(
            side === 'from'
              ? 'investment.transferFromLabel'
              : 'investment.transferToLabel',
          )}
          title={
            resolved
              ? resolved.account.nameInvestmentAccount
              : t('investment.selectAccountPlaceholder')
          }
          subtitle={resolved?.instrument.nameInstrument}
          valueLabel={resolved ? t('investment.valueShort') : undefined}
          value={
            resolved ? formatNumber(resolved.account.currentValue) : undefined
          }
          empty={!resolved}
          onPress={() => setPicking(side)}
        />
      </View>
    );
  };

  const renderPreview = (name: string, before: number, after: number) => (
    <View style={styles.preview}>
      <Typography variant="caption" tone="subtle" numberOfLines={1}>
        {name}
      </Typography>
      <View style={styles.previewRow}>
        <Typography
          variant="caption"
          tone="subtle"
          tabular
          numberOfLines={1}
          style={styles.previewBefore}
        >
          {formatNumber(before)}
        </Typography>
        <ArrowRight size={12} color={colors.text3} />
        <Typography variant="captionStrong" tabular numberOfLines={1}>
          {formatNumber(after)}
        </Typography>
      </View>
    </View>
  );

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t('investment.transferTitle')}
        subtitle={t('investment.transferSubtitle')}
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
              label={t('investment.transferAction')}
              renderIcon={color => <ArrowLeftRight size={18} color={color} />}
              loading={saving}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <View style={styles.sides}>
          {renderSide('from')}
          <IconButton
            size={32}
            label={t('investment.swapAccounts')}
            onPress={() => {
              setFrom(to);
              setTo(from);
            }}
            style={styles.swap}
            renderIcon={(_, size) => (
              <ArrowUpDown size={size - 2} color={colors.primaryText} />
            )}
          />
          {renderSide('to')}
        </View>
        <AmountField
          label={t('investment.transferAmountLabel')}
          value={amountInput}
          onChange={setAmountInput}
        />
        <InvestmentDateTimeField value={date} onChange={setDate} />
        {source && destination && amount > 0 && (
          <Reveal variant="fade" style={styles.previews}>
            {renderPreview(
              source.account.nameInvestmentAccount,
              source.account.currentValue,
              source.account.currentValue - amount,
            )}
            {renderPreview(
              destination.account.nameInvestmentAccount,
              destination.account.currentValue,
              destination.account.currentValue + amount,
            )}
          </Reveal>
        )}
      </SheetLayout>

      <InvestmentTargetSheet
        visible={picking !== null}
        instruments={instruments}
        // Tujuan kosong → mulai dari instrumen sumber (transfer biasanya di instrumen yang sama).
        idInstrument={
          pickingRef?.idInstrument ??
          (picking === 'to' ? from?.idInstrument : to?.idInstrument) ??
          null
        }
        idInvestmentAccount={pickingRef?.idInvestmentAccount ?? null}
        excludeAccountId={
          picking === 'to' ? from?.idInvestmentAccount : to?.idInvestmentAccount
        }
        title={t('investment.pickAccountTitle')}
        subtitle={t(
          picking === 'to'
            ? 'investment.pickDestinationSubtitle'
            : 'investment.pickSourceSubtitle',
        )}
        onClose={() => setPicking(null)}
        onConfirm={(instrument, account) => {
          const ref = {
            idInstrument: instrument.idInstrument,
            idInvestmentAccount: account.idInvestmentAccount,
          };
          if (picking === 'from') {
            setFrom(ref);
          } else {
            setTo(ref);
          }
        }}
      />
    </>
  );
}
