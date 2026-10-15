import { useState } from 'react';
import { View } from 'react-native';
import {
  ArrowUpDown,
  Check,
  Info,
  LayoutGrid,
  List,
  Plus,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Badge from '@/components/atoms/Badge';
import WalletTile from '@/components/atoms/WalletTile';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import LockedBanner from '@/components/molecules/LockedBanner';
import LockedUnlockBar from '@/components/molecules/LockedUnlockBar';
import ReorderList from '@/components/organisms/ReorderList';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAppLock } from '@/hooks/useAppLock';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useWallets } from '@/hooks/useWallets';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import WalletCard from '@/screens/Wallet/WalletCard';
import WalletSummaryCard from '@/screens/Wallet/WalletSummaryCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAppLocked } from '@/store/slices/appLockSlice';
import { setSettings } from '@/store/slices/settingsSlice';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { WalletAccount } from '@/types';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1 },
  section: { gap: spacing.md },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  hintText: { flex: 1 },
  reorderTexts: { flex: 1, gap: 1 },
  reorderTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reorderName: { flexShrink: 1 },
  reorderBadge: { alignSelf: 'center' },
}));

/**
 * Halaman Dompet (pen `cnoOe` · `YYZ1Z` · `PWG8l` · `ZcRnk`) — port WalletPage web.
 * Saat app terkunci jadi "Dompet saya" (pen "Pintasan · Dompet saya"): hanya lihat, tanpa
 * tambah/edit/urutkan, kembali ke Beranda kunci, dan tombol Masuk mengambang.
 */
export default function WalletScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.WALLET>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format } = useMoneyFormat();
  const showToast = useToast();
  const dispatch = useAppDispatch();
  const viewMode =
    useAppSelector(state => state.settings.walletViewMode) ?? 'grid';
  const { wallets, status, loadWallets, reorderWallets } = useWallets();
  const isLocked = useAppSelector(selectIsAppLocked);
  const biometricEnabled = useAppSelector(
    state => state.appLock.biometricEnabled,
  );
  const { startUnlock } = useAppLock();

  const [reordering, setReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<WalletAccount[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const positiveTotal = wallets.reduce(
    (sum, wallet) => sum + Math.max(0, wallet.balance),
    0,
  );
  const shareOf = (wallet: WalletAccount) =>
    positiveTotal > 0 ? (Math.max(0, wallet.balance) / positiveTotal) * 100 : 0;
  const initialLoading = status !== 'loaded' && wallets.length === 0;
  const empty = status === 'loaded' && wallets.length === 0;

  const openCreate = () => navigation.navigate(ROUTES.WALLET_FORM);
  const openEdit = (wallet: WalletAccount) =>
    navigation.navigate(ROUTES.WALLET_FORM, { wallet });

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await reorderWallets(localOrder.map(wallet => wallet.idWallet));
      setReordering(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('wallet.genericError'),
        'error',
      );
    } finally {
      setSavingOrder(false);
    }
  };

  const headerRight = reordering ? (
    <>
      <Button
        size="sm"
        variant="outline"
        label={t('common.cancel')}
        disabled={savingOrder}
        onPress={() => setReordering(false)}
      />
      <Button
        size="sm"
        label={t('wallet.saveShort')}
        loading={savingOrder}
        renderIcon={color => <Check size={16} color={color} />}
        onPress={saveOrder}
      />
    </>
  ) : empty ? undefined : (
    <>
      <IconButton
        variant="surface"
        label={t(viewMode === 'grid' ? 'wallet.viewList' : 'wallet.viewGrid')}
        onPress={() =>
          dispatch(
            setSettings({
              walletViewMode: viewMode === 'grid' ? 'list' : 'grid',
            }),
          )
        }
        renderIcon={(color, size) =>
          viewMode === 'grid' ? (
            <List size={size} color={color} />
          ) : (
            <LayoutGrid size={size} color={color} />
          )
        }
      />
      {wallets.length > 1 && !isLocked && (
        <IconButton
          variant="surface"
          label={t('wallet.toggleReorder')}
          onPress={() => {
            setLocalOrder(wallets);
            setReordering(true);
          }}
          renderIcon={(color, size) => (
            <ArrowUpDown size={size} color={color} />
          )}
        />
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <MainLayout
        title={isLocked ? t('appLock.myWallets') : t('nav.wallet')}
        onBack={isLocked ? navigation.goBack : undefined}
        backLabel={t('common.back')}
        topBanner={
          isLocked ? (
            <LockedBanner
              message={t('appLock.lockedBanner')}
              actionLabel={t('appLock.signIn')}
              onAction={startUnlock}
            />
          ) : undefined
        }
        withTabBar
        headerRight={headerRight}
        onRefresh={reordering ? undefined : loadWallets}
      >
        {reordering ? (
          <Reveal key="reorder" style={styles.section}>
            <View style={styles.hint}>
              <Info size={16} color={colors.primaryText} />
              <Typography variant="meta" tone="primary" style={styles.hintText}>
                {t('wallet.reorderHintShort')}
              </Typography>
            </View>
            <ReorderList
              items={localOrder}
              keyExtractor={wallet => wallet.idWallet}
              onReorder={setLocalOrder}
              renderContent={wallet => (
                <>
                  <WalletTile color={wallet.color} />
                  {/* Sama dengan web: nama + badge Utama, jumlah transaksi, saldo di kanan. */}
                  <View style={styles.reorderTexts}>
                    <View style={styles.reorderTitle}>
                      <Typography
                        variant="label"
                        numberOfLines={1}
                        style={styles.reorderName}
                      >
                        {wallet.nameWallet}
                      </Typography>
                      {wallet.isPrimary && (
                        <Badge
                          label={t('wallet.primary')}
                          style={styles.reorderBadge}
                        />
                      )}
                    </View>
                    <Typography variant="meta" tone="subtle" numberOfLines={1}>
                      {t('wallet.transactionCount', {
                        n: wallet.transactionCount,
                      })}
                    </Typography>
                  </View>
                </>
              )}
              renderTrailing={wallet => (
                <Typography variant="numBody" tone="muted" tabular>
                  {format(wallet.balance)}
                </Typography>
              )}
            />
          </Reveal>
        ) : empty ? (
          <Card key="empty">
            <EmptyState
              icon={<Wallet size={30} color={colors.primaryText} />}
              title={t('wallet.emptyTitle')}
              description={t('wallet.emptyDescription')}
              action={
                isLocked ? undefined : (
                  <Button
                    label={t('wallet.addFirst')}
                    renderIcon={color => <Plus size={18} color={color} />}
                    onPress={openCreate}
                  />
                )
              }
            />
          </Card>
        ) : (
          <Reveal key={`view-${viewMode}`} style={styles.section}>
            <WalletSummaryCard wallets={wallets} loading={initialLoading} />
            {initialLoading ? (
              [0, 1, 2].map(index => (
                <Skeleton key={index} height={132} radius={radius.card} />
              ))
            ) : viewMode === 'grid' ? (
              <>
                {wallets.map((wallet, index) => (
                  <Reveal delay={Math.min(index, 6) * 40} key={wallet.idWallet}>
                    <WalletCard
                      wallet={wallet}
                      share={shareOf(wallet)}
                      onPress={isLocked ? undefined : () => openEdit(wallet)}
                    />
                  </Reveal>
                ))}
                {!isLocked && (
                  <PressableScale
                    accessibilityRole="button"
                    scaleTo={0.98}
                    onPress={openCreate}
                    style={styles.addCard}
                  >
                    <Plus size={18} color={colors.primaryText} />
                    <Typography variant="label" tone="primary">
                      {t('wallet.addTitle')}
                    </Typography>
                  </PressableScale>
                )}
              </>
            ) : (
              <Card variant="list">
                {wallets.map((wallet, index) => (
                  <WalletCard
                    key={wallet.idWallet}
                    variant="row"
                    divider={index > 0}
                    wallet={wallet}
                    share={shareOf(wallet)}
                    onPress={isLocked ? undefined : () => openEdit(wallet)}
                  />
                ))}
                {!isLocked && (
                  <PressableScale
                    accessibilityRole="button"
                    scaleTo={0.98}
                    onPress={openCreate}
                    style={styles.addRow}
                  >
                    <Plus size={18} color={colors.primaryText} />
                    <Typography variant="label" tone="primary">
                      {t('wallet.addTitle')}
                    </Typography>
                  </PressableScale>
                )}
              </Card>
            )}
          </Reveal>
        )}
      </MainLayout>
      {isLocked && (
        <LockedUnlockBar
          message={t('appLock.otherFeaturesLocked')}
          actionLabel={t('appLock.signIn')}
          biometric={biometricEnabled}
          onUnlock={startUnlock}
        />
      )}
    </View>
  );
}
