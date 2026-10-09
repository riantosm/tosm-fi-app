import { useState } from 'react';
import { View } from 'react-native';
import { Check, Landmark, Lock, Plus, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import Monogram from '@/components/atoms/Monogram';
import Typography from '@/components/atoms/Typography';
import TextField from '@/components/molecules/TextField';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

const useStyles = makeStyles(({ colors }) => ({
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  lockedName: { flex: 1 },
  delete: { width: 50, height: 50, backgroundColor: colors.expenseSoft },
  footerButton: { flex: 1 },
}));

/** Tambah / edit akun investasi (pen `o12ZPM`) — port InvestmentAccountFormModal web. */
export default function InvestmentAccountFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INVESTMENT_ACCOUNT_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const {
    instruments,
    createInvestmentAccount,
    editInvestmentAccount,
    deleteInvestmentAccount,
  } = useInstruments({ autoLoad: false });
  const { idInstrument, account } = route.params;
  const instrument = instruments.find(
    item => item.idInstrument === idInstrument,
  );
  const close = navigation.goBack;
  const [name, setName] = useState(account?.nameInvestmentAccount ?? '');
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [confirming, setConfirming] = useState(false);

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('investment.genericError'),
      'error',
    );

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setBusy('save');
    try {
      if (account) {
        await editInvestmentAccount(idInstrument, account.idInvestmentAccount, {
          nameInvestmentAccount: trimmed,
        });
      } else {
        await createInvestmentAccount(idInstrument, {
          nameInvestmentAccount: trimmed,
        });
      }
      close();
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!account) {
      return;
    }
    setBusy('delete');
    try {
      await deleteInvestmentAccount(idInstrument, account.idInvestmentAccount);
      setConfirming(false);
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
        title={t(
          account
            ? 'investment.editAccountTitle'
            : 'investment.addAccountTitle',
        )}
        subtitle={
          instrument
            ? t('investment.inInstrument', { name: instrument.nameInstrument })
            : undefined
        }
        footer={
          <>
            {account && (
              <IconButton
                label={t('investment.deleteAccount')}
                disabled={!!busy}
                onPress={() => setConfirming(true)}
                style={styles.delete}
                renderIcon={(_, size) => (
                  <Trash2 size={size} color={colors.expenseText} />
                )}
              />
            )}
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={!!busy}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t(account ? 'investment.save' : 'investment.addAccount')}
              renderIcon={iconColor =>
                account ? (
                  <Check size={18} color={iconColor} />
                ) : (
                  <Plus size={18} color={iconColor} />
                )
              }
              loading={busy === 'save'}
              disabled={!!busy || !name.trim()}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        {instrument && (
          <View style={styles.locked}>
            <Monogram
              name={instrument.nameInstrument}
              color={instrument.color}
              variant="solid"
              shape="square"
              size={28}
            />
            <Typography
              variant="label"
              numberOfLines={1}
              style={styles.lockedName}
            >
              {instrument.nameInstrument}
            </Typography>
            <Lock
              size={16}
              color={colors.text3}
              accessibilityLabel={t('investment.instrumentLocked')}
            />
          </View>
        )}
        <TextField
          variant="filled"
          label={t('investment.accountNameLabel')}
          helper={t('investment.accountNameHelper')}
          value={name}
          onChangeText={setName}
          placeholder={t('investment.accountNamePlaceholder')}
          autoCapitalize="words"
          renderLeadingIcon={iconColor => (
            <Landmark size={18} color={iconColor} />
          )}
        />
      </SheetLayout>

      {account && (
        <ConfirmDialog
          visible={confirming}
          tone="danger"
          renderIcon={iconColor => <Trash2 size={24} color={iconColor} />}
          title={t('investment.deleteAccountConfirmTitle', {
            name: account.nameInvestmentAccount,
          })}
          message={t('investment.deleteAccountConfirmDescription')}
          confirmLabel={t('investment.deleteAccount')}
          cancelLabel={t('common.cancel')}
          loading={busy === 'delete'}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
