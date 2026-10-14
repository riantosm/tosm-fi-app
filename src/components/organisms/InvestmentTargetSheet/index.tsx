import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Monogram from '@/components/atoms/Monogram';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import InstrumentFields from '@/components/organisms/InstrumentFields';
import InvestmentAccountFields from '@/components/organisms/InvestmentAccountFields';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
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
  // Tile "Baru" (garis putus-putus, sama dengan web).
  tileNew: {
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.transparent,
  },
  newIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format } = useMoneyFormat();
  const [creating, setCreating] = useState<'instrument' | 'account' | null>(
    null,
  );
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
          <PressableScale
            accessibilityRole="button"
            onPress={() => setCreating('instrument')}
            style={[styles.tile, styles.tileNew]}
          >
            <View style={styles.newIcon}>
              <Plus size={20} color={colors.text2} />
            </View>
            <Typography variant="metaMedium" tone="muted" numberOfLines={1}>
              {t('investment.newShort')}
            </Typography>
          </PressableScale>
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
          <Button
            variant="soft"
            label={t('investment.newAccount')}
            renderIcon={color => <Plus size={18} color={color} />}
            onPress={() => setCreating('account')}
          />
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

      <CreateInstrumentSheet
        visible={creating === 'instrument'}
        onCreated={created => {
          setInstrumentId(created.idInstrument);
          setAccountId(null);
          setCreating(null);
        }}
        onClose={() => setCreating(null)}
      />
      <CreateAccountSheet
        visible={creating === 'account'}
        instrument={instrument ?? null}
        onCreated={created => {
          setAccountId(created.idInvestmentAccount);
          setCreating(null);
        }}
        onClose={() => setCreating(null)}
      />
    </>
  );
}

/** Tombol Batal + Simpan untuk sheet buat baru. */
function CreateFooter({
  busy,
  canSave,
  saveLabel,
  onCancel,
  onSave,
}: {
  busy: boolean;
  canSave: boolean;
  saveLabel: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="outline"
        label={t('common.cancel')}
        disabled={busy}
        onPress={onCancel}
        style={styles.action}
      />
      <Button
        label={saveLabel}
        renderIcon={color => <Check size={18} color={color} />}
        loading={busy}
        disabled={busy || !canSave}
        onPress={onSave}
        style={styles.action}
      />
    </>
  );
}

/** "+ Baru": buat instrumen lalu langsung dipilih (sama dengan web). */
function CreateInstrumentSheet({
  visible,
  onCreated,
  onClose,
}: {
  visible: boolean;
  onCreated: (instrument: Instrument) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const showToast = useToast();
  const { createInstrument } = useInstruments({ autoLoad: false });
  const [name, setName] = useState('');
  const [color, setColor] = useState(WALLET_COLOR_PRESETS[0]);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setName('');
    setColor(WALLET_COLOR_PRESETS[0]);
    onClose();
  };
  const save = async () => {
    setBusy(true);
    try {
      const created = await createInstrument({
        nameInstrument: name.trim(),
        color,
      });
      setName('');
      setColor(WALLET_COLOR_PRESETS[0]);
      onCreated(created);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('investment.genericError'),
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('investment.addTitle')}
      subtitle={t('investment.addInstrumentSubtitle')}
      closeLabel={t('common.close')}
      onClose={close}
      footer={
        <CreateFooter
          busy={busy}
          canSave={!!name.trim()}
          saveLabel={t('investment.save')}
          onCancel={close}
          onSave={save}
        />
      }
    >
      <InstrumentFields
        name={name}
        onNameChange={setName}
        color={color}
        onColorChange={setColor}
      />
    </BottomSheet>
  );
}

/** "Akun baru": buat akun di instrumen terpilih lalu langsung dipilih. */
function CreateAccountSheet({
  visible,
  instrument,
  onCreated,
  onClose,
}: {
  visible: boolean;
  instrument: Instrument | null;
  onCreated: (account: InvestmentAccount) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const showToast = useToast();
  const { createInvestmentAccount } = useInstruments({ autoLoad: false });
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setName('');
    onClose();
  };
  const save = async () => {
    if (!instrument) {
      return;
    }
    setBusy(true);
    try {
      const created = await createInvestmentAccount(instrument.idInstrument, {
        nameInvestmentAccount: name.trim(),
      });
      setName('');
      onCreated(created);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('investment.genericError'),
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('investment.addAccountTitle')}
      subtitle={
        instrument
          ? t('investment.inInstrument', { name: instrument.nameInstrument })
          : undefined
      }
      closeLabel={t('common.close')}
      onClose={close}
      footer={
        <CreateFooter
          busy={busy}
          canSave={!!name.trim() && !!instrument}
          saveLabel={t('investment.addAccount')}
          onCancel={close}
          onSave={save}
        />
      }
    >
      <InvestmentAccountFields
        instrument={instrument}
        name={name}
        onNameChange={setName}
      />
    </BottomSheet>
  );
}
