import { StyleSheet, View } from 'react-native';
import {
  CalendarClock,
  ChartColumn,
  ChevronRight,
  Languages,
  LogOut,
  Settings,
  Tag,
  Target,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import MenuTile from '@/components/molecules/MenuTile';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/navigation/paths';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import type { LanguageCode } from '@/types';

export type MoreRoute =
  | typeof ROUTES.WALLET
  | typeof ROUTES.CATEGORIES
  | typeof ROUTES.SCHEDULE
  | typeof ROUTES.BUDGETS
  | typeof ROUTES.REPORTS
  | typeof ROUTES.SETTINGS
  | typeof ROUTES.PROFILE;

/** Urutan, ikon & nada sama dengan pen `Popup/Menu lainnya` (cPZgw). */
const TILES: {
  route: MoreRoute;
  labelKey: string;
  Icon: typeof Wallet;
  tone: Tone;
}[] = [
  {
    route: ROUTES.WALLET,
    labelKey: 'navShort.wallet',
    Icon: Wallet,
    tone: 'primary',
  },
  {
    route: ROUTES.CATEGORIES,
    labelKey: 'navShort.category',
    Icon: Tag,
    tone: 'expense',
  },
  {
    route: ROUTES.SCHEDULE,
    labelKey: 'navShort.schedule',
    Icon: CalendarClock,
    tone: 'investment',
  },
  {
    route: ROUTES.BUDGETS,
    labelKey: 'navShort.budgets',
    Icon: Target,
    tone: 'income',
  },
  {
    route: ROUTES.REPORTS,
    labelKey: 'navShort.reports',
    Icon: ChartColumn,
    tone: 'primary',
  },
  {
    route: ROUTES.SETTINGS,
    labelKey: 'nav.settings',
    Icon: Settings,
    tone: 'neutral',
  },
];

export interface MoreMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: MoreRoute) => void;
  onLogout: () => void;
}

/** Sheet "Lainnya" dari bottom nav (DESIGN_SYSTEM.md §6.14). */
export default function MoreMenuSheet({
  visible,
  onClose,
  onNavigate,
  onLogout,
}: MoreMenuSheetProps) {
  const { t } = useTranslation();
  const user = useAppSelector(state => state.auth.user);
  const { language, setLanguage, options } = useLanguage();
  const rows = [TILES.slice(0, 3), TILES.slice(3)];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t('common.close')}
      gutter={spacing.lg}
    >
      <PressableScale
        accessibilityRole="button"
        scaleTo={0.98}
        onPress={() => onNavigate(ROUTES.PROFILE)}
        style={styles.profile}
      >
        <Avatar name={user?.nameUser ?? ''} size={44} />
        <View style={styles.profileText}>
          <Typography variant="label" numberOfLines={1}>
            {user?.nameUser ?? ''}
          </Typography>
          <Typography variant="captionStrong" tone="primary">
            {t('topbar.editProfile')}
          </Typography>
        </View>
        <ChevronRight size={16} color={colors.text3} />
      </PressableScale>

      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(({ route, labelKey, Icon, tone }) => (
            <MenuTile
              key={route}
              label={t(labelKey)}
              tone={tone}
              renderIcon={color => <Icon size={20} color={color} />}
              onPress={() => onNavigate(route)}
            />
          ))}
        </View>
      ))}

      <View style={styles.prefBox}>
        <Languages size={18} color={colors.text2} />
        <View style={styles.prefControl}>
          <SegmentedControl<LanguageCode>
            variant="compact"
            value={language}
            onChange={setLanguage}
            options={options.map(o => ({ value: o.code, label: o.short }))}
          />
        </View>
      </View>

      <Button
        variant="dangerSoft"
        label={t('topbar.logout')}
        renderIcon={color => <LogOut size={18} color={color} />}
        onPress={onLogout}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  profileText: { flex: 1, gap: 1 },
  row: { flexDirection: 'row', gap: 10 },
  prefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  prefControl: { flex: 1 },
});
