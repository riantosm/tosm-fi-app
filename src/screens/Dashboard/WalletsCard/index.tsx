import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MotiView } from 'moti';
import { Plus, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SectionHead from '@/components/molecules/SectionHead';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { LoadStatus, WalletAccount } from '@/types';
import { transitions, withDelay } from '@/utils/motion';

export interface WalletsCardProps {
  wallets: WalletAccount[];
  status: LoadStatus;
  onSetPrimary: (wallet: WalletAccount) => Promise<void>;
  /** Tap dompet utama → koreksi saldo. */
  onCorrectBalance?: (wallet: WalletAccount) => void;
  onManage: () => void;
  /** Tombol "Tambah dompet" → langsung ke form dompet baru. */
  onAddWallet: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.md },
  item: {
    gap: 10,
    padding: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  name: { flexShrink: 1 },
  balance: { marginLeft: 'auto', paddingLeft: spacing.sm },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { width: 92 },
  track: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  fill: { height: '100%', borderRadius: radius.pill },
  percent: { width: 36, textAlign: 'right' },
}));

/**
 * "Saldo · Dompet" (pen `LLTNr`). Tap dompet lain → jadikan utama; tap dompet utama →
 * koreksi saldo.
 */
export default function WalletsCard({
  wallets,
  status,
  onSetPrimary,
  onCorrectBalance,
  onManage,
  onAddWallet,
}: WalletsCardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { format } = useMoneyFormat();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const positiveTotal = wallets.reduce(
    (sum, wallet) => sum + Math.max(0, wallet.balance),
    0,
  );

  const handlePress = async (wallet: WalletAccount) => {
    if (wallet.isPrimary) {
      onCorrectBalance?.(wallet);
      return;
    }
    if (pendingId) {
      return;
    }
    setPendingId(wallet.idWallet);
    try {
      await onSetPrimary(wallet);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Card>
      <SectionHead
        eyebrow={t('dashboard.walletsEyebrow')}
        title={t('dashboard.walletsTitle')}
        actionLabel={t('dashboard.manage')}
        onAction={onManage}
      />
      {status !== 'loaded' && wallets.length === 0 ? (
        <View style={styles.list}>
          {[0, 1, 2].map(i => (
            <Skeleton key={i} height={71} radius={radius.control} />
          ))}
        </View>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon={<Wallet size={32} color={colors.primaryText} />}
          title={t('dashboard.noWallets')}
        />
      ) : (
        <View style={styles.list}>
          {wallets.map((wallet, index) => {
            const share =
              positiveTotal > 0
                ? Math.max(0, wallet.balance) / positiveTotal
                : 0;
            const percent = Math.round(share * 100);
            const pending = pendingId === wallet.idWallet;
            return (
              <PressableScale
                key={wallet.idWallet}
                accessibilityRole="button"
                accessibilityLabel={`${wallet.nameWallet} · ${t(
                  wallet.isPrimary
                    ? 'dashboard.correctBalanceHint'
                    : 'dashboard.setPrimaryHint',
                )}`}
                disabled={pending}
                scaleTo={0.98}
                onPress={() => handlePress(wallet)}
                style={[
                  styles.item,
                  wallet.isPrimary && {
                    backgroundColor: `${wallet.color}1F`,
                  },
                ]}
              >
                <View style={styles.top}>
                  {pending ? (
                    <ActivityIndicator size="small" color={wallet.color} />
                  ) : (
                    <View
                      style={[styles.dot, { backgroundColor: wallet.color }]}
                    />
                  )}
                  <Typography
                    variant="label"
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {wallet.nameWallet}
                  </Typography>
                  {wallet.isPrimary && <Badge label={t('wallet.primary')} />}
                  <Typography variant="num" tabular style={styles.balance}>
                    {format(wallet.balance)}
                  </Typography>
                </View>
                <View style={styles.bottom}>
                  <Typography
                    variant="caption"
                    tone="subtle"
                    numberOfLines={1}
                    style={styles.count}
                  >
                    {t('wallet.transactionCount', {
                      n: wallet.transactionCount,
                    })}
                  </Typography>
                  <View style={styles.track}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{
                        width: `${Math.max(percent, share > 0 ? 3 : 0)}%`,
                      }}
                      transition={withDelay(transitions.grow, index * 50)}
                      style={[styles.fill, { backgroundColor: wallet.color }]}
                    />
                  </View>
                  <Typography
                    variant="caption"
                    tone="subtle"
                    tabular
                    style={styles.percent}
                  >
                    {percent}%
                  </Typography>
                </View>
              </PressableScale>
            );
          })}
        </View>
      )}
      <Button
        variant="soft"
        label={t('dashboard.addWallet')}
        renderIcon={color => <Plus size={18} color={color} />}
        onPress={onAddWallet}
      />
    </Card>
  );
}
