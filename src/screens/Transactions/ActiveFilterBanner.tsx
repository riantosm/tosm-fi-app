import { AnimatePresence, MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, WalletAccount } from '@/types';
import { transitions } from '@/utils/motion';
import {
  DEFAULT_FILTERS,
  TYPE_OPTIONS,
  formatRangeLabel,
  type TransactionFilters,
} from '@/screens/Transactions/FilterSheet';

const useStyles = makeStyles(({ colors }) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  text: { flex: 1 },
}));

export interface ActiveFilterBannerProps {
  filters: TransactionFilters;
  search: string;
  wallets: WalletAccount[];
  categories: Category[];
  locale: string;
  matchCount: number | null;
  /** Ketuk teks banner → buka sheet filter. */
  onPress: () => void;
  onReset: () => void;
}

/**
 * Ringkasan filter aktif ("9 transaksi · Pengeluaran › Makan") + Reset (pen `z5AbmD`). Urutan
 * non-default ikut tampil supaya selaras dengan angka di tombol Filter; Reset mengembalikan semua
 * (filter, urutan, kata kunci).
 */
export default function ActiveFilterBanner({
  filters,
  search,
  wallets,
  categories,
  locale,
  matchCount,
  onPress,
  onReset,
}: ActiveFilterBannerProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const wallet = wallets.find(w => w.idWallet === filters.walletId);
  const typeItem = TYPE_OPTIONS.find(item => item.value === filters.type);
  const category = categories.find(c => c.idCategory === filters.categoryId);
  const sub = category?.subCategories.find(
    s => s.idSubCategory === filters.subCategoryId,
  );
  const labels = [
    wallet?.nameWallet,
    typeItem ? t(typeItem.labelKey) : null,
    category?.nameCategory,
    sub?.nameSubCategory,
    search ? `“${search}”` : null,
    formatRangeLabel(filters.range, locale) || null,
    filters.sort !== DEFAULT_FILTERS.sort
      ? t(`transaction.sortShort.${filters.sort}`)
      : null,
  ].filter(Boolean);

  return (
    <AnimatePresence>
      {labels.length > 0 && (
        <MotiView
          key="active"
          from={{ opacity: 0, translateY: -6 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0 }}
          transition={transitions.enter}
        >
          <PressableScale
            accessibilityRole="button"
            scaleTo={0.99}
            onPress={onPress}
            style={styles.banner}
          >
            <Typography
              variant="fieldLabel"
              tone="primary"
              numberOfLines={1}
              style={styles.text}
            >
              {[
                matchCount !== null
                  ? t('transaction.matchCountShort', { count: matchCount })
                  : null,
                labels.join(' › '),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
            <PressableScale
              accessibilityRole="button"
              hitSlop={8}
              onPress={onReset}
            >
              <Typography variant="fieldLabel" tone="primary">
                {t('transaction.reset')}
              </Typography>
            </PressableScale>
          </PressableScale>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
