import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import {
  Banknote,
  Check,
  ChevronRight,
  Info,
  Pencil,
  Star,
  Trash2,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import WalletTile from '@/components/atoms/WalletTile';
import TextField from '@/components/molecules/TextField';
import ColorPicker from '@/components/organisms/ColorPicker';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import SheetLayout from '@/components/templates/SheetLayout';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useWallets } from '@/hooks/useWallets';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { formatNumberInput, parseFormattedNumber } from '@/utils/numberInput';
import { pickWalletLogo } from '@/utils/walletLogo';
import type { WalletLogoChange } from '@/types';
import { fonts } from '@/theme/typography';

const useStyles = makeStyles(({ colors, shadows }) => ({
  // Angka saldo = web `font-num`.
  numText: { fontFamily: fonts.numRegular },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: 18,
  },
  previewTexts: { flex: 1, gap: 1 },
  // Pensil kecil di pojok tile = tile ini tombol ganti logo.
  logoBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  logoBusy: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: -spacing.sm,
  },
  logoError: { flex: 1, color: colors.expenseText },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  hintText: { flex: 1 },
  footerButton: { flex: 1 },
}));

/** Tambah / edit dompet (pen `KiasV` · `nrR3J`) — port WalletFormModal web. */
export default function WalletFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.WALLET_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const { format } = useMoneyFormat();
  const {
    createWallet,
    editWallet,
    deleteWallet,
    setPrimaryWallet,
    changeWalletLogo,
  } = useWallets({ autoLoad: false });
  const wallet = route.params?.wallet ?? null;
  const close = navigation.goBack;

  const [name, setName] = useState(wallet?.nameWallet ?? '');
  const [color, setColor] = useState(wallet?.color ?? WALLET_COLOR_PRESETS[0]);
  const [balanceInput, setBalanceInput] = useState('');
  const [busy, setBusy] = useState<'save' | 'delete' | 'primary' | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Logo yang tampil + perubahan yang diterapkan saat simpan (kosong = tetap).
  const [logo, setLogo] = useState<{
    previewUri: string | null;
    change?: WalletLogoChange;
  }>({ previewUri: wallet?.logoUrl ?? null });
  const [logoError, setLogoError] = useState<string | null>(null);
  const [pickingLogo, setPickingLogo] = useState(false);

  const previewBalance = wallet
    ? wallet.balance
    : parseFormattedNumber(balanceInput);
  // Pratinjau memakai warna yang valid saja (hex custom bisa masih diketik).
  const previewColor = /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : WALLET_COLOR_PRESETS[0];

  const run = async (
    kind: NonNullable<typeof busy>,
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    try {
      await action();
      close();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('wallet.genericError'),
        'error',
      );
      setBusy(null);
    }
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || pickingLogo) {
      return;
    }
    setBusy('save');
    let idWallet: string;
    try {
      if (wallet) {
        idWallet = wallet.idWallet;
        await editWallet(idWallet, { nameWallet: trimmed, color });
      } else {
        idWallet = (
          await createWallet({
            nameWallet: trimmed,
            color,
            balance: parseFormattedNumber(balanceInput),
          })
        ).idWallet;
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('wallet.genericError'),
        'error',
      );
      setBusy(null);
      return;
    }
    // Dompet sudah tersimpan: logo yang gagal cukup toast, form tetap ditutup
    // (simpan ulang dari form tambah akan menggandakan dompet).
    let logoFailure: string | null = null;
    if (logo.change) {
      try {
        await changeWalletLogo(idWallet, logo.change);
      } catch (error) {
        logoFailure =
          error instanceof Error ? error.message : t('wallet.logoUploadError');
      }
    }
    close();
    if (logoFailure) {
      showToast(logoFailure, 'error');
    }
  };

  const chooseLogo = async () => {
    setLogoError(null);
    setPickingLogo(true);
    try {
      const picked = await pickWalletLogo();
      if (picked) {
        setLogo({
          previewUri: picked.previewUri,
          change: { type: 'upload', image: picked.image },
        });
      }
    } catch (error) {
      setLogoError(
        t(
          error instanceof Error && error.message === 'tooLarge'
            ? 'wallet.logoTooLarge'
            : 'wallet.logoInvalid',
        ),
      );
    } finally {
      setPickingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoError(null);
    // Logo yang baru dipilih di form ini (belum tersimpan) cukup kembali ke "tidak berubah".
    setLogo(
      wallet?.logoUrl
        ? { previewUri: null, change: { type: 'remove' } }
        : { previewUri: null },
    );
  };

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t(wallet ? 'wallet.editTitle' : 'wallet.addTitle')}
        subtitle={
          wallet
            ? t('wallet.transactionCount', { n: wallet.transactionCount })
            : undefined
        }
        headerActions={
          wallet && (
            <>
              <IconButton
                label={t(
                  wallet.isPrimary
                    ? 'wallet.primary'
                    : 'wallet.setPrimaryButton',
                )}
                disabled={wallet.isPrimary || !!busy}
                onPress={() =>
                  run('primary', () => setPrimaryWallet(wallet.idWallet))
                }
                renderIcon={(_, size) => (
                  <Star
                    size={size}
                    color={colors.investmentText}
                    fill={wallet.isPrimary ? colors.investmentText : 'none'}
                  />
                )}
              />
              <IconButton
                label={t('wallet.deleteButton')}
                disabled={!!busy}
                onPress={() => setConfirmingDelete(true)}
                renderIcon={(_, size) => (
                  <Trash2 size={size} color={colors.expenseText} />
                )}
              />
            </>
          )
        }
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={!!busy}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t(
                wallet ? 'transaction.saveChanges' : 'wallet.saveWallet',
              )}
              renderIcon={iconColor => <Check size={18} color={iconColor} />}
              loading={busy === 'save'}
              disabled={!!busy || pickingLogo || !name.trim()}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <View
          style={[styles.preview, { backgroundColor: `${previewColor}1F` }]}
        >
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t(
              logo.previewUri ? 'wallet.logoChange' : 'wallet.logoUpload',
            )}
            accessibilityHint={t('wallet.logoHelper')}
            disabled={!!busy || pickingLogo}
            scaleTo={0.94}
            onPress={chooseLogo}
          >
            <WalletTile
              color={previewColor}
              logoUrl={logo.previewUri}
              size={44}
              radius={14}
              onTint
            />
            {pickingLogo && (
              <View style={styles.logoBusy}>
                <ActivityIndicator size="small" color={previewColor} />
              </View>
            )}
            <View style={styles.logoBadge}>
              <Pencil size={10} color={colors.text2} />
            </View>
          </PressableScale>
          <View style={styles.previewTexts}>
            <Typography variant="label" numberOfLines={1}>
              {name.trim() || t('wallet.namePreview')}
            </Typography>
            <Typography
              variant="numSecondary"
              tone="muted"
              tabular
              numberOfLines={1}
            >
              {format(previewBalance)}
            </Typography>
          </View>
          <Typography variant="caption" tone="subtle">
            {t('wallet.preview')}
          </Typography>
        </View>

        {(!!logoError || !!logo.previewUri) && (
          <View style={styles.logoRow}>
            <Typography variant="meta" style={styles.logoError}>
              {logoError ?? ''}
            </Typography>
            {!!logo.previewUri && (
              <PressableScale
                accessibilityRole="button"
                disabled={!!busy || pickingLogo}
                onPress={removeLogo}
              >
                <Typography variant="meta" tone="subtle">
                  {t('wallet.logoRemove')}
                </Typography>
              </PressableScale>
            )}
          </View>
        )}

        <TextField
          variant="filled"
          label={t('wallet.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('wallet.namePlaceholder')}
          autoCapitalize="words"
          returnKeyType="done"
          renderLeadingIcon={iconColor => (
            <Wallet size={18} color={iconColor} />
          )}
        />

        {wallet ? (
          // Saldo tidak diedit di sini: ketuk untuk langsung ke koreksi saldo.
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('wallet.correctionTitle')}
            scaleTo={0.99}
            disabled={!!busy}
            onPress={() =>
              navigation.dispatch(
                StackActions.replace(ROUTES.BALANCE_CORRECTION, {
                  idWallet: wallet.idWallet,
                }),
              )
            }
            style={styles.hint}
          >
            <Info size={16} color={colors.text3} />
            <Typography variant="meta" tone="muted" style={styles.hintText}>
              {t('wallet.balanceEditHint')}
            </Typography>
            <ChevronRight size={16} color={colors.text3} />
          </PressableScale>
        ) : (
          <TextField
            variant="filled"
            label={t('wallet.balanceLabel')}
            helper={t('wallet.balanceHelper')}
            value={balanceInput}
            onChangeText={raw => setBalanceInput(formatNumberInput(raw))}
            placeholder="0"
            keyboardType="decimal-pad"
            style={styles.numText}
            renderLeadingIcon={iconColor => (
              <Banknote size={18} color={iconColor} />
            )}
          />
        )}

        <ColorPicker
          label={t('wallet.colorLabel')}
          value={color}
          onChange={setColor}
          presets={WALLET_COLOR_PRESETS}
        />
      </SheetLayout>

      {wallet && (
        <ConfirmDialog
          visible={confirmingDelete}
          tone="danger"
          renderIcon={iconColor => <Trash2 size={24} color={iconColor} />}
          title={t('wallet.deleteConfirmTitle', { name: wallet.nameWallet })}
          message={t('wallet.deleteConfirmDescription')}
          confirmLabel={t('wallet.deleteWalletAction')}
          cancelLabel={t('common.cancel')}
          loading={busy === 'delete'}
          onConfirm={() => run('delete', () => deleteWallet(wallet.idWallet))}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
