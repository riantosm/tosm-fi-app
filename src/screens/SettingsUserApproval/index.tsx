import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { CircleCheck, Hourglass, UserPlus, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Monogram from '@/components/atoms/Monogram';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import MainLayout from '@/components/templates/MainLayout';
import { WALLET_COLOR_PRESETS } from '@/constants/walletColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserApproval } from '@/hooks/useUserApproval';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import { formatShortDate } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';
import Reveal from '@/components/atoms/Reveal';

/** Warna avatar stabil per username supaya tidak berganti antar kunjungan. */
function colorFor(seed: string): string {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 4294967296;
  }
  return WALLET_COLOR_PRESETS[hash % WALLET_COLOR_PRESETS.length];
}

const useStyles = makeStyles(({ colors }) => ({
  counts: { flexDirection: 'row', gap: spacing.md },
  countCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  countTile: {
    width: 36,
    height: 36,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTexts: { flex: 1, minWidth: 0, gap: 2 },
  countValue: { fontSize: 22, lineHeight: 26 },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  texts: { flex: 1, minWidth: 0, gap: 2 },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.incomeSoft,
  },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skeletonTexts: { flex: 1, gap: 6 },
  skeletons: { gap: spacing.md, paddingVertical: spacing.md },
}));

function CountCard({
  renderIcon,
  tone,
  value,
  label,
  loading,
}: {
  renderIcon: (color: string) => ReactNode;
  tone: Tone;
  value: number;
  label: string;
  loading: boolean;
}) {
  const styles = useStyles();
  const { tones } = useTheme();
  return (
    <Card style={styles.countCard}>
      <View style={[styles.countTile, { backgroundColor: tones[tone].soft }]}>
        {renderIcon(tones[tone].text)}
      </View>
      <View style={styles.countTexts}>
        {loading ? (
          <Skeleton width={32} height={22} radius={radius.pill} />
        ) : (
          <Reveal variant="fade" key={value}>
            <Typography variant="num" tabular style={styles.countValue}>
              {value}
            </Typography>
          </Reveal>
        )}
        <Typography variant="caption" tone="muted" numberOfLines={2}>
          {label}
        </Typography>
      </View>
    </Card>
  );
}

/**
 * Permintaan Pengguna (pen `DaxsW`, port SettingsUserApprovalPage web): jumlah menunggu/aktif,
 * daftar pendaftaran (menunggu di atas) dengan tombol Aktifkan. Khusus admin (route hanya
 * terdaftar untuk admin).
 */
export default function SettingsUserApprovalScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_USER_APPROVAL>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const showToast = useToast();
  const { users, status, pendingCount, loadUsers, acceptUser } =
    useUserApproval();
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const locale = toIntlLocale(language);

  useEffect(() => {
    loadUsers().catch(() => {});
  }, [loadUsers]);

  // Pendaftaran yang menunggu di atas, lalu akun yang sudah aktif.
  const sortedUsers = useMemo(
    () =>
      [...users].sort(
        (a, b) => Number(a.status === 'active') - Number(b.status === 'active'),
      ),
    [users],
  );
  const activeCount = users.length - pendingCount;
  const initialLoading = status !== 'loaded' && users.length === 0;

  const handleActivate = async (idUser: string) => {
    setActivatingId(idUser);
    try {
      await acceptUser(idUser);
      showToast(t('userApproval.activateSuccess'), 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('userApproval.genericError'),
        'error',
      );
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <MainLayout
      title={t('userApproval.title')}
      subtitle={t('userApproval.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
      onRefresh={() => loadUsers().catch(() => {})}
    >
      <Reveal style={styles.counts}>
        <CountCard
          tone="investment"
          renderIcon={color => <Hourglass size={18} color={color} />}
          value={pendingCount}
          label={t('userApproval.pendingLabel')}
          loading={initialLoading}
        />
        <CountCard
          tone="income"
          renderIcon={color => <Users size={18} color={color} />}
          value={activeCount}
          label={t('userApproval.statusActive')}
          loading={initialLoading}
        />
      </Reveal>

      <Reveal delay={50}>
        <Card variant="list" style={styles.list}>
          {initialLoading ? (
            <View style={styles.skeletons}>
              {[0, 1, 2, 3].map(index => (
                <View key={index} style={styles.skeletonRow}>
                  <Skeleton width={44} height={44} radius={radius.pill} />
                  <View style={styles.skeletonTexts}>
                    <Skeleton width="40%" height={14} radius={radius.pill} />
                    <Skeleton width="60%" height={12} radius={radius.pill} />
                  </View>
                </View>
              ))}
            </View>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={32} color={colors.primaryText} />}
              title={t('userApproval.empty')}
            />
          ) : (
            sortedUsers.map((item, index) => (
              <Reveal
                variant="fade"
                key={item.idUser}
                style={[styles.row, index > 0 && styles.divider]}
              >
                <Monogram
                  name={item.nameUser}
                  color={colorFor(item.username)}
                  shape="circle"
                  size={44}
                />
                <View style={styles.texts}>
                  <Typography variant="label" numberOfLines={1}>
                    {item.nameUser}
                  </Typography>
                  <Typography variant="meta" tone="subtle" numberOfLines={1}>
                    @{item.username} ·{' '}
                    {t('userApproval.registeredAt', {
                      date: formatShortDate(new Date(item.createdAt), locale),
                    })}
                  </Typography>
                </View>
                {item.status === 'active' ? (
                  <View style={styles.active}>
                    <CircleCheck size={14} color={colors.incomeText} />
                    <Typography variant="captionStrong" tone="income">
                      {t('userApproval.statusActive')}
                    </Typography>
                  </View>
                ) : (
                  <Button
                    size="sm"
                    label={t('userApproval.activateButton')}
                    loading={activatingId === item.idUser}
                    disabled={activatingId !== null}
                    onPress={() => handleActivate(item.idUser)}
                    renderIcon={color => <UserPlus size={16} color={color} />}
                  />
                )}
              </Reveal>
            ))
          )}
        </Card>
      </Reveal>
    </MainLayout>
  );
}
