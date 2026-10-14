import { useState } from 'react';
import { StackActions } from '@react-navigation/native';
import { Check, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import InstrumentFields from '@/components/organisms/InstrumentFields';
import SheetLayout from '@/components/templates/SheetLayout';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useInstruments } from '@/hooks/useInstruments';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { activeAccounts } from '@/utils/investment';

const useStyles = makeStyles(({ colors }) => ({
  delete: { width: 50, height: 50, backgroundColor: colors.expenseSoft },
  footerButton: { flex: 1 },
}));

/** Tambah / edit instrumen (pen `WTcV3`) — port InstrumentFormModal web. */
export default function InstrumentFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INSTRUMENT_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { createInstrument, editInstrument, deleteInstrument } = useInstruments(
    { autoLoad: false },
  );
  const instrument = route.params?.instrument ?? null;
  const close = navigation.goBack;

  const [name, setName] = useState(instrument?.nameInstrument ?? '');
  const [color, setColor] = useState(
    instrument?.color ?? WALLET_COLOR_PRESETS[0],
  );
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
      if (instrument) {
        await editInstrument(instrument.idInstrument, {
          nameInstrument: trimmed,
          color,
        });
        close();
      } else {
        const created = await createInstrument({
          nameInstrument: trimmed,
          color,
        });
        // Instrumen baru langsung dibuka supaya bisa menambah akun.
        navigation.dispatch(
          StackActions.replace(ROUTES.INSTRUMENT_DETAIL, {
            idInstrument: created.idInstrument,
          }),
        );
      }
    } catch (error) {
      fail(error);
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!instrument) {
      return;
    }
    setBusy('delete');
    try {
      await deleteInstrument(instrument.idInstrument);
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
        title={t(instrument ? 'investment.editTitle' : 'investment.addTitle')}
        subtitle={
          instrument
            ? `${instrument.nameInstrument} · ${t('investment.accountsShort', {
                count: activeAccounts(instrument).length,
              })}`
            : t('investment.addInstrumentSubtitle')
        }
        footer={
          <>
            {instrument && (
              <IconButton
                label={t('investment.deleteInstrument')}
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
              label={t('investment.save')}
              renderIcon={iconColor => <Check size={18} color={iconColor} />}
              loading={busy === 'save'}
              disabled={!!busy || !name.trim()}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <InstrumentFields
          name={name}
          onNameChange={setName}
          color={color}
          onColorChange={setColor}
        />
      </SheetLayout>

      {instrument && (
        <ConfirmDialog
          visible={confirming}
          tone="danger"
          renderIcon={iconColor => <Trash2 size={24} color={iconColor} />}
          title={t('investment.deleteConfirmTitle', {
            name: instrument.nameInstrument,
          })}
          message={t('investment.deleteConfirmDescription')}
          confirmLabel={t('investment.deleteInstrument')}
          cancelLabel={t('common.cancel')}
          loading={busy === 'delete'}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
