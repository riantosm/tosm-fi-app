import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { makeStyles } from '@/theme/makeStyles';
import { radius as radii } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

export interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  /** Default pill; isi angka untuk kotak (mis. radius.control). */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { backgroundColor: colors.surface2 },
}));

/** Blok placeholder berdenyut, dibentuk seperti konten yang sedang dimuat. */
export default function Skeleton({
  width = '100%',
  height,
  radius = radii.pill,
  style,
}: SkeletonProps) {
  const styles = useStyles();
  return (
    <MotiView
      from={{ opacity: 0.55 }}
      animate={{ opacity: 1 }}
      transition={transitions.pulse}
      style={[styles.base, { width, height, borderRadius: radius }, style]}
    />
  );
}
