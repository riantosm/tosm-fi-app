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
import SegmentedControl from '@/components/molecules/SegmentedControl';
import BottomSheet from '@/components/organisms/BottomSheet';
import DateRangeSheet, {
  type DateRange,
} from '@/components/organisms/DateRangeSheet';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type {
  Category,
  TransactionFilterMode,
  TransactionListParams,
  TransactionSortOption,
  TransactionType,
  WalletAccount,
} from '@/types';
import { formatShortDate, parseIsoDate } from '@/utils/calendar';
import { transitions } from '@/utils/motion';

export type TypeFilter = TransactionType | 'all';

/** Semua filter halaman Transaksi selain bulan & kata kunci. */
export interface TransactionFilters {
  /** Kosong = semua dompet. */
  walletIds: string[];
  /** `walletIds` adalah dompet yang ditampilkan (include) atau disembunyikan (exclude). */
  walletMode: TransactionFilterMode;
  type: TypeFilter;
  /** Kosong = semua kategori. */
  categoryIds: string[];
  categoryMode: TransactionFilterMode;
  /** Hanya berlaku saat tepat satu kategori di-include. Kosong = semua subkategori. */
  subCategoryIds: string[];
  subCategoryMode: TransactionFilterMode;
  range: DateRange;
  sort: TransactionSortOption;
}

export const EMPTY_RANGE: DateRange = { from: '', to: '' };

export const DEFAULT_FILTERS: TransactionFilters = {
  walletIds: [],
  walletMode: 'include',
  type: 'all',
  categoryIds: [],
  categoryMode: 'include',
  subCategoryIds: [],
  subCategoryMode: 'include',
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
    filters.walletIds.length > 0,
    filters.type !== 'all',
    filters.categoryIds.length > 0,
    filters.subCategoryIds.length > 0,
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

/** Tambahkan `id` ke daftar, atau hapus kalau sudah ada. */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];
}

/** Satu-satunya kategori yang di-include (subkategorinya bisa difilter), kalau ada. */
export function getSubCategoryParent(
  filters: TransactionFilters,
): string | null {
  return filters.categoryMode === 'include' && filters.categoryIds.length === 1
    ? filters.categoryIds[0]
    : null;
}

/** Bagian dompet/kategori/subkategori dari query `GET /transactions`. */
export function buildIdFilterParams(
  filters: TransactionFilters,
): Pick<
  TransactionListParams,
  | 'idWallet'
  | 'walletMode'
  | 'idCategory'
  | 'categoryMode'
  | 'idSubCategory'
  | 'subCategoryMode'
> {
  const hasWallets = filters.walletIds.length > 0;
  const hasCategories = filters.categoryIds.length > 0;
  const hasSubCategories =
    getSubCategoryParent(filters) !== null && filters.subCategoryIds.length > 0;
  return {
    idWallet: hasWallets ? filters.walletIds.join(',') : undefined,
    walletMode:
      hasWallets && filters.walletMode === 'exclude' ? 'exclude' : undefined,
    idCategory: hasCategories ? filters.categoryIds.join(',') : undefined,
    categoryMode:
      hasCategories && filters.categoryMode === 'exclude'
        ? 'exclude'
        : undefined,
    idSubCategory: hasSubCategories
      ? filters.subCategoryIds.join(',')
      : undefined,
    subCategoryMode:
      hasSubCategories && filters.subCategoryMode === 'exclude'
        ? 'exclude'
        : undefined,
  };
}

const useStyles = makeStyles(() => ({
  section: { gap: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 32,
  },
  modeToggle: { width: 180 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footerButton: { flex: 1 },
}));

function Section({
  title,
  action,
  children,
}: {
  title: string;
  /** Kontrol di kanan baris judul. */
  action?: ReactNode;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Typography variant="eyebrow" tone="subtle">
          {title}
        </Typography>
        {action}
      </View>
      {children}
    </View>
  );
}

/** Toggle "Termasuk / Kecuali" untuk section multi-pilih. */
function ModeToggle({
  value,
  onChange,
}: {
  value: TransactionFilterMode;
  onChange: (mode: TransactionFilterMode) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.modeToggle}>
      <SegmentedControl<TransactionFilterMode>
        variant="compact"
        options={[
          { value: 'include', label: t('transaction.filterInclude') },
          { value: 'exclude', label: t('transaction.filterExclude') },
        ]}
        value={value}
        onChange={onChange}
      />
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
 * Sheet filter Transaksi: dompet, tipe, kategori → subkategori, rentang tanggal, urutan. Dompet &
 * kategori bisa pilih banyak, masing-masing dengan mode Termasuk/Kecuali. Pilihan
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
  const subCategoryParent = getSubCategoryParent(draft);
  const category = categories.find(c => c.idCategory === subCategoryParent);
  // Subkategori hanya bertahan selama kategori tunggalnya masih di-include.
  const setCategories = (
    patch: Pick<TransactionFilters, 'categoryIds' | 'categoryMode'>,
  ) => {
    const next = { ...draft, ...patch };
    set({
      ...patch,
      subCategoryIds:
        getSubCategoryParent(next) === subCategoryParent
          ? draft.subCategoryIds
          : [],
    });
  };

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
        <Section
          title={t('transaction.filterWallet')}
          action={
            <ModeToggle
              value={draft.walletMode}
              onChange={walletMode => set({ walletMode })}
            />
          }
        >
          <View style={styles.chips}>
            <Chip
              label={t('transaction.allWallets')}
              active={draft.walletIds.length === 0}
              onPress={() => set({ walletIds: [] })}
            />
            {wallets.map(item => (
              <Chip
                key={item.idWallet}
                label={item.nameWallet}
                dot={item.color}
                active={draft.walletIds.includes(item.idWallet)}
                onPress={() =>
                  set({ walletIds: toggleId(draft.walletIds, item.idWallet) })
                }
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

        <Section
          title={t('transaction.filterCategory')}
          action={
            <ModeToggle
              value={draft.categoryMode}
              onChange={categoryMode =>
                setCategories({ categoryIds: draft.categoryIds, categoryMode })
              }
            />
          }
        >
          <View style={styles.chips}>
            <Chip
              label={t('transaction.allCategories')}
              active={draft.categoryIds.length === 0}
              onPress={() =>
                setCategories({
                  categoryIds: [],
                  categoryMode: draft.categoryMode,
                })
              }
            />
            {categories.map(item => {
              const Icon = resolveCategoryIcon(item.icon);
              return (
                <Chip
                  key={item.idCategory}
                  label={item.nameCategory}
                  active={draft.categoryIds.includes(item.idCategory)}
                  renderIcon={color => <Icon size={14} color={color} />}
                  onPress={() =>
                    setCategories({
                      categoryIds: toggleId(draft.categoryIds, item.idCategory),
                      categoryMode: draft.categoryMode,
                    })
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
              <Section
                title={t('transaction.filterSubCategory')}
                action={
                  <ModeToggle
                    value={draft.subCategoryMode}
                    onChange={subCategoryMode => set({ subCategoryMode })}
                  />
                }
              >
                <View style={styles.chips}>
                  <Chip
                    label={t('transaction.allSub')}
                    active={draft.subCategoryIds.length === 0}
                    renderIcon={color => <Layers size={14} color={color} />}
                    onPress={() => set({ subCategoryIds: [] })}
                  />
                  {category.subCategories.map(item => {
                    const Icon = resolveCategoryIcon(item.icon);
                    return (
                      <Chip
                        key={item.idSubCategory}
                        label={item.nameSubCategory}
                        active={draft.subCategoryIds.includes(
                          item.idSubCategory,
                        )}
                        renderIcon={color => <Icon size={14} color={color} />}
                        onPress={() =>
                          set({
                            subCategoryIds: toggleId(
                              draft.subCategoryIds,
                              item.idSubCategory,
                            ),
                          })
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
