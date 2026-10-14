import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Monogram from '@/components/atoms/Monogram';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Instrument, InvestmentAccount } from '@/types';

export interface InvestmentTargetSheetProps {
  visible: boolean;
  instruments: Instrument[];
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  onConfirm: (instrument: Instrument, account: InvestmentAccount) => void;
  onClose: () => void;
  /** Akun yang tidak boleh dipilih (mis. sisi lain transfer). */
  excludeAccountId?: string;
  title?: string;
  subtitle?: string;
}

const useStyles = makeStyles(({ colors }) => ({
  section: { gap: spacing.sm },
  tiles: { gap: spacing.sm },
  tile: {
    width: 84,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface2,
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  accounts: { gap: spacing.sm },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary, borderWidth: 6 },
  accountName: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
}));

/** Catat ke investasi (pen `C4brtg`): pilih instrumen (tile monogram), lalu akun (radio). */
export default function InvestmentTargetSheet(
  props: InvestmentTargetSheetProps,
) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={props.visible}
      title={props.title ?? t('investment.targetTitle')}
      subtitle={props.subtitle ?? t('investment.targetSubtitle')}
      closeLabel={t('common.close')}
      onClose={props.onClose}
    >
      {props.visible && <TargetBody {...props} />}
    </BottomSheet>
  );
}

function TargetBody({
  instruments,
  idInstrument,
  idInvestmentAccount,
  onConfirm,
  onClose,
  excludeAccountId,
}: InvestmentTargetSheetProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { format } = useMoneyFormat();
  const [instrumentId, setInstrumentId] = useState(
    idInstrument ?? instruments[0]?.idInstrument ?? null,
  );
  const [accountId, setAccountId] = useState(idInvestmentAccount);
  const instrument = instruments.find(i => i.idInstrument === instrumentId);
  const accounts =
    instrument?.investmentAccounts.filter(
      a => !a.isDeleted && a.idInvestmentAccount !== excludeAccountId,
    ) ?? [];
  const account = accounts.find(a => a.idInvestmentAccount === accountId);

  return (
    <>
      <View style={styles.section}>
        <Typography variant="fieldLabel" tone="muted">
          {t('investment.instrumentLabel')}
        </Typography>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tiles}
        >
          {instruments.map(item => {
            const active = item.idInstrument === instrumentId;
            return (
              <PressableScale
                key={item.idInstrument}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setInstrumentId(item.idInstrument);
                  setAccountId(null);
                }}
                style={[styles.tile, active && styles.tileActive]}
              >
                <Monogram
                  name={item.nameInstrument}
                  color={item.color}
                  variant="solid"
                  shape="square"
                  size={46}
                />
                <Typography
                  variant={active ? 'tileLabel' : 'metaMedium'}
                  tone={active ? 'primary' : 'muted'}
                  numberOfLines={1}
                >
                  {item.nameInstrument}
                </Typography>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
      {instrument && (
        <View style={styles.section}>
          <Typography variant="fieldLabel" tone="muted">
            {t('investment.accountsIn', { name: instrument.nameInstrument })}
          </Typography>
          {accounts.length === 0 ? (
            <Typography variant="label" tone="subtle">
              {t('investment.noAccounts')}
            </Typography>
          ) : (
            <View style={styles.accounts}>
              {accounts.map(item => {
                const active = item.idInvestmentAccount === accountId;
                return (
                  <PressableScale
                    key={item.idInvestmentAccount}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    scaleTo={0.98}
                    onPress={() => setAccountId(item.idInvestmentAccount)}
                    style={[styles.account, active && styles.accountActive]}
                  >
                    <View
                      style={[styles.radio, active && styles.radioActive]}
                    />
                    <Typography
                      variant={active ? 'label' : 'body'}
                      numberOfLines={1}
                      style={styles.accountName}
                    >
                      {item.nameInvestmentAccount}
                    </Typography>
                    <Typography variant="numSecondary" tone="muted" tabular>
                      {format(item.currentValue)}
                    </Typography>
                  </PressableScale>
                );
              })}
            </View>
          )}
        </View>
      )}
      <View style={styles.actions}>
        <Button
          variant="outline"
          label={t('common.cancel')}
          onPress={onClose}
          style={styles.action}
        />
        <Button
          label={t('investment.chooseAccount')}
          renderIcon={color => <Check size={18} color={color} />}
          disabled={!instrument || !account}
          onPress={() => {
            if (instrument && account) {
              onConfirm(instrument, account);
              onClose();
            }
          }}
          style={styles.action}
        />
      </View>
    </>
  );
}
