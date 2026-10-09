import { useState } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface BudgetProgressBarProps {
  /** terpakai / limit — boleh > 1; isian dibatasi lebar penuh. */
  ratio: number;
  /** Warna isian (warna budget, atau `expense` saat lewat limit). */
  color: string;
  /** Hari ke- (1-based) posisi penanda "Hari ini". */
  dayOfMonth: number;
  daysInMonth: number;
  todayLabel: string;
  /** hero = di atas gradien hero (track tembus, warna hero). */
  tone?: 'card' | 'hero';
}

const PILL_HALF = 26;

const useStyles = makeStyles(({ colors }) => ({
  wrap: { gap: 6 },
  pillRow: { height: 18 },
  pill: {
    position: 'absolute',
    top: 2,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
  },
  pillHero: { backgroundColor: colors.heroFg },
  pillText: { fontSize: 9.5, lineHeight: 12, color: colors.surface },
  pillTextHero: { color: colors.heroBg },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  trackHero: { height: 12, backgroundColor: colors.heroControl },
  fill: { height: '100%', borderRadius: radius.pill },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: colors.text2,
  },
  tickHero: { backgroundColor: colors.heroFg },
}));

/**
 * Bar budget bulanan (pen `Lu9SC`): isian = pengeluaran, pil "Hari ini" + garis = kalender.
 * Isian yang mendahului garis berarti belanja terlalu cepat.
 */
export default function BudgetProgressBar({
  ratio,
  color,
  dayOfMonth,
  daysInMonth,
  todayLabel,
  tone = 'card',
}: BudgetProgressBarProps) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const [pillWidth, setPillWidth] = useState(PILL_HALF * 2);
  const hero = tone === 'hero';
  const todayRatio = daysInMonth > 0 ? dayOfMonth / daysInMonth : 0;
  const fill = Math.min(1, Math.max(0, ratio));
  // Pil tetap di dalam bar saat awal/akhir bulan.
  const pillLeft = Math.min(
    Math.max(width * todayRatio - pillWidth / 2, 0),
    Math.max(0, width - pillWidth),
  );

  return (
    <View
      style={styles.wrap}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.pillRow}>
        {width > 0 && (
          <View
            onLayout={event => setPillWidth(event.nativeEvent.layout.width)}
            style={[styles.pill, hero && styles.pillHero, { left: pillLeft }]}
          >
            <Typography
              variant="badge"
              numberOfLines={1}
              style={[styles.pillText, hero && styles.pillTextHero]}
            >
              {todayLabel}
            </Typography>
          </View>
        )}
      </View>
      <View style={[styles.track, hero && styles.trackHero]}>
        <MotiView
          from={{ width: 0 }}
          animate={{ width: width * fill }}
          transition={transitions.grow}
          style={[styles.fill, { backgroundColor: color }]}
        />
        <View
          style={[
            styles.tick,
            hero && styles.tickHero,
            { left: width * todayRatio },
          ]}
        />
      </View>
    </View>
  );
}
