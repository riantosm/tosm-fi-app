import type { ReactNode } from 'react';
import { View } from 'react-native';
import PressableScale from '@/components/atoms/PressableScale';
import Typography, { type TypographyTone } from '@/components/atoms/Typography';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';

export type TxAmountTone = 'income' | 'expense' | 'neutral' | 'muted';

export interface TxRowProps {
  /** Render ikon (ukuran 18) dengan warna tile. */
  renderIcon: (color: string) => ReactNode;
  /** Warna data user (kategori/dompet): tile `${color}26` + ikon berwarna. */
  color?: string;
  /** Nada tile kalau tidak ada warna data user. */
  tone?: Tone;
  title: string;
  meta?: string;
  amount?: string;
  amountTone?: TxAmountTone;
  caption?: string;
  /** Pengganti kolom nominal di kanan. */
  trailing?: ReactNode;
  onPress?: () => void;
}

const AMOUNT_TONE: Record<TxAmountTone, TypographyTone> = {
  income: 'income',
  expense: 'expense',
  neutral: 'default',
  muted: 'muted',
};

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderRadius: radius.control,
  },
  tile: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: spacing.xxs },
  right: { alignItems: 'flex-end', gap: spacing.xxs },
}));

/** Satu-satunya bentuk baris transaksi (pen V2/TxRow): tile 42, judul + meta, nominal + waktu. */
export default function TxRow({
  renderIcon,
  color,
  tone = 'neutral',
  title,
  meta,
  amount,
  amountTone = 'neutral',
  caption,
  trailing,
  onPress,
}: TxRowProps) {
  const styles = useStyles();
  const { tones } = useTheme();
  const tile = color
    ? { backgroundColor: `${color}26`, iconColor: color }
    : { backgroundColor: tones[tone].soft, iconColor: tones[tone].text };

  return (
    <PressableScale
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      scaleTo={0.985}
      onPress={onPress}
      style={styles.row}
    >
      <View style={[styles.tile, { backgroundColor: tile.backgroundColor }]}>
        {renderIcon(tile.iconColor)}
      </View>
      <View style={styles.texts}>
        <Typography variant="label" numberOfLines={1}>
          {title}
        </Typography>
        {!!meta && (
          <Typography variant="meta" tone="subtle" numberOfLines={1}>
            {meta}
          </Typography>
        )}
      </View>
      {trailing ?? (
        <View style={styles.right}>
          {amount !== undefined && (
            <Typography
              variant="num"
              tone={AMOUNT_TONE[amountTone]}
              tabular
              numberOfLines={1}
            >
              {amount}
            </Typography>
          )}
          {!!caption && (
            <Typography variant="caption" tone="subtle" tabular>
              {caption}
            </Typography>
          )}
        </View>
      )}
    </PressableScale>
  );
}
