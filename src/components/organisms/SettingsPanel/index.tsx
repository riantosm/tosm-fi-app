import type { ReactNode } from 'react';
import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';

export interface SettingsPanelProps {
  /** Render ikon (ukuran 18) dengan warna nada tile. */
  renderIcon: (color: string) => ReactNode;
  /** Nada tile ikon (default primary). */
  tone?: Tone;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const useStyles = makeStyles(() => ({
  card: { gap: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tile: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, minWidth: 0, gap: 1 },
  title: { fontSize: 17, lineHeight: 22 },
}));

/** Kartu berkepala tile ikon (port SettingsPanel web): Mata Uang, Format Desimal, Profil. */
export default function SettingsPanel({
  renderIcon,
  tone = 'primary',
  title,
  subtitle,
  children,
}: SettingsPanelProps) {
  const styles = useStyles();
  const { tones } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.tile, { backgroundColor: tones[tone].soft }]}>
          {renderIcon(tones[tone].text)}
        </View>
        <View style={styles.titles}>
          <Typography
            variant="cardTitle"
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Typography>
          {!!subtitle && (
            <Typography variant="meta" tone="subtle" numberOfLines={1}>
              {subtitle}
            </Typography>
          )}
        </View>
      </View>
      {children}
    </Card>
  );
}
