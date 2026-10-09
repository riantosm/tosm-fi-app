import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  ArrowDownLeft,
  ArrowDownWideNarrow,
  ArrowLeftRight,
  ArrowUpNarrowWide,
  ArrowUpRight,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarRange,
  Check,
  Layers,
  Scale,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Typography from '@/components/atoms/Typography';
import PickerField from '@/components/molecules/PickerField';
import BottomSheet from '@/components/organisms/BottomSheet';
import DateRangeSheet, {
  type DateRange,
} from '@/components/organisms/DateRangeSheet';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type {
  Category,
  TransactionSortOption,
  TransactionType,
  WalletAccount,
} from '@/types';
import { formatShortDate, parseIsoDate } from '@/utils/calendar';
import { transitions } from '@/utils/motion';

export type TypeFilter = TransactionType | 'all';

/** Semua filter halaman Transaksi selain bulan & kata kunci. */
export interface TransactionFilters {
  walletId: string;
  type: TypeFilter;
  categoryId: string;
  subCategoryId: string;
  range: DateRange;
  sort: TransactionSortOption;
}

export const EMPTY_RANGE: DateRange = { from: '', to: '' };

export const DEFAULT_FILTERS: TransactionFilters = {
  walletId: 'all',
  type: 'all',
  categoryId: 'all',
  subCategoryId: 'all',
  range: EMPTY_RANGE,
  sort: 'dateDesc',
};

export const TYPE_OPTIONS: {
  value: Exclude<TypeFilter, 'all'>;
  labelKey: string;
  Icon: typeof Scale;
}[] = [
  { value: 'expense', labelKey: 'transaction.expense', Icon: ArrowUpRight },
  { value: 'income', labelKey: 'transaction.income', Icon: ArrowDownLeft },
  { value: 'transfer', labelKey: 'transaction.transfer', Icon: ArrowLeftRight },
  {
    value: 'correction',
    labelKey: 'transaction.balanceCorrection',
    Icon: Scale,
  },
];

export const SORT_ICONS: Record<TransactionSortOption, typeof Scale> = {
  dateDesc: CalendarArrowDown,
  dateAsc: CalendarArrowUp,
  amountDesc: ArrowDownWideNarrow,
  amountAsc: ArrowUpNarrowWide,
};

/** Jumlah filter yang aktif (untuk angka di tombol Filter). */
export function countActiveFilters(filters: TransactionFilters): number {
  return [
    filters.walletId !== 'all',
    filters.type !== 'all',
    filters.categoryId !== 'all',
    filters.subCategoryId !== 'all',
    !!filters.range.from,
    filters.sort !== 'dateDesc',
  ].filter(Boolean).length;
}

export function formatRangeLabel(range: DateRange, locale: string): string {
  if (!range.from) {
    return '';
  }
  const from = formatShortDate(parseIsoDate(range.from), locale);
  if (!range.to || range.to === range.from) {
    return from;
  }
  return `${from} – ${formatShortDate(parseIsoDate(range.to), locale)}`;
}

const useStyles = makeStyles(() => ({
  section: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footerButton: { flex: 1 },
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Typography variant="eyebrow" tone="subtle">
        {title}
      </Typography>
      {children}
    </View>
  );
}

export interface FilterSheetProps {
  visible: boolean;
  value: TransactionFilters;
  wallets: WalletAccount[];
  categories: Category[];
  /** Bulan yang sedang dilihat (awal kalender rentang tanggal). */
  month: Date;
  locale: string;
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
}

/**
 * Sheet filter Transaksi: dompet, tipe, kategori → subkategori, rentang tanggal, urutan. Pilihan
 * disimpan sebagai draf dan baru diterapkan dengan "Terapkan", jadi daftar tidak dimuat ulang
 * setiap chip diketuk.
 */
export default function FilterSheet({
  visible,
  value,
  wallets,
  categories,
  month,
  locale,
  onApply,
  onClose,
}: FilterSheetProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [rangeOpen, setRangeOpen] = useState(false);

  // Setiap dibuka mulai dari filter yang sedang berlaku.
  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const set = (patch: Partial<TransactionFilters>) =>
    setDraft(current => ({ ...current, ...patch }));
  const category = categories.find(c => c.idCategory === draft.categoryId);

  return (
    <>
      <BottomSheet
        visible={visible}
        title={t('transaction.filterTitle')}
        subtitle={t('transaction.filterSubtitle')}
        closeLabel={t('common.close')}
        onClose={onClose}
        footer={
          <>
            <Button
              variant="outline"
              label={t('transaction.reset')}
              onPress={() => setDraft(DEFAULT_FILTERS)}
              style={styles.footerButton}
            />
            <Button
              label={t('transaction.applyDateFilter')}
              renderIcon={color => <Check size={18} color={color} />}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              style={styles.footerButton}
            />
          </>
        }
      >
        <Section title={t('transaction.filterWallet')}>
          <View style={styles.chips}>
            <Chip
              label={t('transaction.allWallets')}
              active={draft.walletId === 'all'}
              onPress={() => set({ walletId: 'all' })}
            />
            {wallets.map(item => (
              <Chip
                key={item.idWallet}
                label={item.nameWallet}
                dot={item.color}
                active={draft.walletId === item.idWallet}
                onPress={() => set({ walletId: item.idWallet })}
              />
            ))}
          </View>
        </Section>

        <Section title={t('transaction.filterType')}>
          <View style={styles.chips}>
            <Chip
              label={t('transaction.allTypes')}
              active={draft.type === 'all'}
              onPress={() => set({ type: 'all' })}
            />
            {TYPE_OPTIONS.map(({ value: option, labelKey, Icon }) => (
              <Chip
                key={option}
                label={t(labelKey)}
                active={draft.type === option}
                renderIcon={color => <Icon size={14} color={color} />}
                onPress={() => set({ type: option })}
              />
            ))}
          </View>
        </Section>

        <Section title={t('transaction.filterCategory')}>
          <View style={styles.chips}>
            <Chip
              label={t('transaction.allCategories')}
              active={draft.categoryId === 'all'}
              onPress={() => set({ categoryId: 'all', subCategoryId: 'all' })}
            />
            {categories.map(item => {
              const Icon = resolveCategoryIcon(item.icon);
              return (
                <Chip
                  key={item.idCategory}
                  label={item.nameCategory}
                  active={draft.categoryId === item.idCategory}
                  renderIcon={color => <Icon size={14} color={color} />}
                  onPress={() =>
                    set({ categoryId: item.idCategory, subCategoryId: 'all' })
                  }
                />
              );
            })}
          </View>
        </Section>

        <AnimatePresence>
          {!!category && category.subCategories.length > 0 && (
            <MotiView
              key={`sub-${category.idCategory}`}
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0 }}
              transition={transitions.enter}
            >
              <Section title={t('transaction.filterSubCategory')}>
                <View style={styles.chips}>
                  <Chip
                    label={t('transaction.allSub')}
                    active={draft.subCategoryId === 'all'}
                    renderIcon={color => <Layers size={14} color={color} />}
                    onPress={() => set({ subCategoryId: 'all' })}
                  />
                  {category.subCategories.map(item => {
                    const Icon = resolveCategoryIcon(item.icon);
                    return (
                      <Chip
                        key={item.idSubCategory}
                        label={item.nameSubCategory}
                        active={draft.subCategoryId === item.idSubCategory}
                        renderIcon={color => <Icon size={14} color={color} />}
                        onPress={() =>
                          set({ subCategoryId: item.idSubCategory })
                        }
                      />
                    );
                  })}
                </View>
              </Section>
            </MotiView>
          )}
        </AnimatePresence>

        <Section title={t('transaction.dateFilterTitle')}>
          <PickerField
            label=""
            value={
              formatRangeLabel(draft.range, locale) ||
              t('transaction.filterAllDates')
            }
            renderIcon={color => <CalendarRange size={18} color={color} />}
            onPress={() => setRangeOpen(true)}
          />
        </Section>

        <Section title={t('transaction.sortTitle')}>
          <View style={styles.chips}>
            {(Object.keys(SORT_ICONS) as TransactionSortOption[]).map(
              option => {
                const Icon = SORT_ICONS[option];
                return (
                  <Chip
                    key={option}
                    label={t(`transaction.sortOptions.${option}`)}
                    active={draft.sort === option}
                    renderIcon={color => <Icon size={14} color={color} />}
                    onPress={() => set({ sort: option })}
                  />
                );
              },
            )}
          </View>
        </Section>
      </BottomSheet>

      <DateRangeSheet
        visible={rangeOpen}
        value={draft.range}
        initialMonth={month}
        onApply={range => set({ range })}
        onClose={() => setRangeOpen(false)}
      />
    </>
  );
}
