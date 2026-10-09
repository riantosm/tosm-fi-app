import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';

export interface MenuGroupProps {
  /** Eyebrow seksi (ADMIN, UMUM). */
  title?: string;
  /** Biasanya beberapa MenuRow; dipisah garis otomatis. */
  children: ReactNode;
}

const useStyles = makeStyles(({ colors }) => ({
  group: { gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
}));

export default function MenuGroup({ title, children }: MenuGroupProps) {
  const styles = useStyles();
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
