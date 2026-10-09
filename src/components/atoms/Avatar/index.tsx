import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { fonts } from '@/theme/typography';
import { getInitials } from '@/utils/format';

export type AvatarTone = 'solid' | 'soft';

export interface AvatarProps {
  name: string;
  /** 36 (app bar) · 44 (sheet Lainnya). */
  size?: number;
  tone?: AvatarTone;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.display },
  solidBox: { backgroundColor: colors.primary },
  solidText: { color: colors.primaryFg },
  softBox: { backgroundColor: colors.primarySoft },
  softText: { color: colors.primaryText },
}));

export default function Avatar({
  name,
  size = 44,
  tone = 'soft',
}: AvatarProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        tone === 'solid' ? styles.solidBox : styles.softBox,
        { width: size, height: size, borderRadius: radius.pill },
      ]}
    >
      <Typography
        style={[
          styles.text,
          tone === 'solid' ? styles.solidText : styles.softText,
          { fontSize: size * 0.34 },
        ]}
      >
        {getInitials(name)}
      </Typography>
    </View>
  );
}
