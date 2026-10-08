import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/metrics';

export interface MenuGroupProps {
  /** Eyebrow seksi (ADMIN, UMUM). */
  title?: string;
  /** Biasanya beberapa MenuRow; dipisah garis otomatis. */
  children: ReactNode;
}

export default function MenuGroup({ title, children }: MenuGroupProps) {
  const items = Children.toArray(children);
  return (
    <View style={styles.group}>
      {!!title && (
        <Typography variant="eyebrow" tone="subtle">
          {title}
        </Typography>
      )}
      <Card variant="list">
        {items.map((child, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {child}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
});
