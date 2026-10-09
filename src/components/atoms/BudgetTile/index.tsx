import { View } from 'react-native';
import { makeStyles } from '@/theme/makeStyles';
import type { Budget, Category } from '@/types';
import { resolveBudgetIcon } from '@/utils/budgetUi';

export interface BudgetTileProps {
  budget: Budget;
  categories: Category[];
  /** Sisi tile (default 40). Ikon ≈ 46% sisi. */
  size?: number;
  radius?: number;
  /** Latar `surface` (di atas gradien hero) alih-alih warna budget 15%. */
  onSurface?: boolean;
}

const useStyles = makeStyles(({ colors }) => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  onSurface: { backgroundColor: colors.surface },
}));

/** Tile ikon budget (port BudgetTile web). */
export default function BudgetTile({
  budget,
  categories,
  size = 40,
  radius = 14,
  onSurface = false,
}: BudgetTileProps) {
  const styles = useStyles();
  const Icon = resolveBudgetIcon(budget, categories);
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        onSurface ? styles.onSurface : { backgroundColor: `${budget.color}26` },
      ]}
    >
      <Icon size={Math.round(size * 0.46)} color={budget.color} />
    </View>
  );
}
