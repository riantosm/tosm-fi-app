import { useState } from 'react';
import { View } from 'react-native';
import {
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Gradient from '@/components/atoms/Gradient';
import IconButton from '@/components/atoms/IconButton';
import LogoMark from '@/components/atoms/LogoMark';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import ThemeToggleButton from '@/components/molecules/ThemeToggleButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { layout, radius, spacing } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import type { DashboardSummary } from '@/types';
import { AMOUNT_MASK } from '@/utils/money';
import Reveal from '@/components/atoms/Reveal';

export interface HeroBandProps {
  insetTop: number;
  appName: string;
  userName: string;
  greeting: string;
  summary: DashboardSummary | null;
  isLoading: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onSearch: () => void;
  onOpenMenu: () => void;
  onOpenWallets: () => void;
  onOpenInvestment: () => void;
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  band: {
    overflow: 'hidden',
    gap: 18,
    paddingHorizontal: layout.heroGutter,
    paddingBottom: 28,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    backgroundColor: colors.heroBg,
  },
  appBar: {
    height: layout.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  value: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  currency: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    lineHeight: 24,
    paddingBottom: 6,
  },
  amount: { flexShrink: 1 },
  chips: { gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  chipIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  chipTexts: { flex: 1, gap: 1 },
  chipValue: { fontSize: 15 },
}));

/** Hero band Dashboard HP (pen `g4ZdnS`): app bar, sapaan, kekayaan bersih, dua chip saldo. */
export default function HeroBand({
  insetTop,
  appName,
  userName,
  greeting,
  summary,
  isLoading,
  isDark,
  onToggleTheme,
  onSearch,
  onOpenMenu,
  onOpenWallets,
  onOpenInvestment,
}: HeroBandProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { symbol, format, formatNumber } = useMoneyFormat();
  const [visible, setVisible] = useState(true);

  const walletTotal = summary?.wallet.totalBalance ?? 0;
  const investmentTotal = summary?.investment.totalCurrentValue ?? 0;
  const initialLoading = isLoading && !summary;
  const mask = (value: string) => (visible ? value : AMOUNT_MASK);
  const EyeIcon = visible ? Eye : EyeOff;

  const chips = [
    {
      key: 'wallet',
      Icon: Wallet,
      color: colors.cashText,
      label: t('dashboard.yourMoneyMeta', {
        count: summary?.wallet.walletCount ?? 0,
      }),
      value: format(walletTotal),
      onPress: onOpenWallets,
    },
    {
      key: 'investment',
      Icon: TrendingUp,
      color: colors.investmentText,
      label: t('dashboard.yourInvestmentMeta', {
        count: summary?.investment.instrumentCount ?? 0,
      }),
      value: format(investmentTotal),
      onPress: onOpenInvestment,
    },
  ];

  return (
    <View style={[styles.band, { paddingTop: insetTop }]}>
      <Gradient />
      <View style={styles.appBar}>
        <View style={styles.brand}>
          <LogoMark />
          <Typography variant="wordmark" tone="hero">
            {appName}
          </Typography>
        </View>
        <View style={styles.actions}>
          <IconButton
            variant="hero"
            size={36}
            label={t('topbar.searchTransactions')}
            onPress={onSearch}
            renderIcon={(color, size) => <Search size={size} color={color} />}
          />
          <ThemeToggleButton
            isDark={isDark}
            label={t('topbar.theme')}
            onToggle={onToggleTheme}
          />
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={userName || t('nav.more')}
            onPress={onOpenMenu}
          >
            <Avatar name={userName} size={36} tone="solid" />
          </PressableScale>
        </View>
      </View>

      <Typography variant="greeting" tone="heroMuted" numberOfLines={1}>
        {greeting}
      </Typography>

      <View style={styles.value}>
        <View style={styles.labelRow}>
          <Typography variant="secondary" tone="heroMuted">
            {t('dashboard.totalNetWorth')}
          </Typography>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t(
              visible ? 'dashboard.hideAmount' : 'dashboard.showAmount',
            )}
            hitSlop={10}
            onPress={() => setVisible(value => !value)}
          >
            <EyeIcon size={15} color={colors.heroFg2} />
          </PressableScale>
        </View>
        {initialLoading ? (
          <Skeleton width={240} height={42} />
        ) : (
          <Reveal
            variant="fade"
            key={visible ? 'shown' : 'hidden'}
            style={styles.amountRow}
          >
            <Typography tone="heroMuted" style={styles.currency}>
              {symbol}
            </Typography>
            <Typography
              variant="heroAmount"
              tone="hero"
              tabular
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.amount}
            >
              {mask(formatNumber(walletTotal + investmentTotal))}
            </Typography>
          </Reveal>
        )}
      </View>

      <View style={styles.chips}>
        {chips.map(({ key, Icon, color, label, value, onPress }) => (
          <PressableScale
            key={key}
            accessibilityRole="button"
            scaleTo={0.98}
            onPress={onPress}
            style={styles.chip}
          >
            <View style={styles.chipIcon}>
              <Icon size={16} color={color} />
            </View>
            <View style={styles.chipTexts}>
              <Typography variant="caption" tone="subtle" numberOfLines={1}>
                {label}
              </Typography>
              {initialLoading ? (
                <Skeleton width={110} height={14} />
              ) : (
                <Typography
                  variant="num"
                  tabular
                  numberOfLines={1}
                  style={styles.chipValue}
                >
                  {mask(value)}
                </Typography>
              )}
            </View>
            <ChevronRight size={16} color={colors.text3} />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}
