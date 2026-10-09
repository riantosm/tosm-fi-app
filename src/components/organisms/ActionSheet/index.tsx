import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';

export interface ActionSheetAction {
  key: string;
  label: string;
  /** Ikon (ukuran 18) dengan warna aksi. */
  renderIcon: (color: string) => ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
  },
  danger: { backgroundColor: colors.expenseSoft },
  disabled: { opacity: 0.5 },
}));

/** Menu aksi (pengganti popover "⋮" web di HP): daftar tombol penuh, aksi berbahaya merah. */
export default function ActionSheet({
  visible,
  title,
  subtitle,
  actions,
  onClose,
}: ActionSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      title={title}
      subtitle={subtitle}
      closeLabel={t('common.close')}
      onClose={onClose}
      scroll={false}
    >
      <View style={styles.list}>
        {actions.map(action => {
          const color = action.danger ? colors.expenseText : colors.text;
          return (
            <PressableScale
              key={action.key}
              accessibilityRole="button"
              accessibilityState={{ disabled: action.disabled }}
              disabled={action.disabled}
              scaleTo={0.98}
              onPress={action.onPress}
              style={[
                styles.action,
                action.danger && styles.danger,
                action.disabled && styles.disabled,
              ]}
            >
              {action.renderIcon(color)}
              <Typography variant="label" style={{ color }}>
                {action.label}
              </Typography>
            </PressableScale>
          );
        })}
      </View>
    </BottomSheet>
  );
}
