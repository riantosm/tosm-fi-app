import { useState } from 'react';
import { View } from 'react-native';
import { CalendarClock, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import AmountCard from '@/components/molecules/AmountCard';
import CategoryPickerRow from '@/components/molecules/CategoryPickerRow';
import PickerField from '@/components/molecules/PickerField';
import WalletChipGroup from '@/components/molecules/WalletChipGroup';
import AmountCalculatorSheet from '@/components/organisms/AmountCalculatorSheet';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import SelectCategorySheet from '@/components/organisms/SelectCategorySheet';
import SelectSubCategorySheet from '@/components/organisms/SelectSubCategorySheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useScheduleOccurrences } from '@/hooks/useScheduleOccurrences';
import { useWallets } from '@/hooks/useWallets';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import { toIntlLocale } from '@/utils/locale';
import { formatDateTimeLabel } from '@/utils/txTime';
import { dateTimeFormat } from '@/utils/intl';

const useStyles = makeStyles(({ colors }) => ({
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.investmentSoft,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  infoTexts: { flex: 1, gap: 1 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
}));

/** Bayar / terima tagihan jadwal (pen `U7rLyW`) — port PayOccurrenceModal web. */
export default function PayOccurrenceScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.PAY_OCCURRENCE>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const { format } = useMoneyFormat();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const { payOccurrence } = useScheduleOccurrences({ autoLoad: false });
  const { occurrence } = route.params;
  const close = navigation.goBack;

  const [categoryId, setCategoryId] = useState<string | null>(
    occurrence.idCategory,
  );
  const [subCategoryId, setSubCategoryId] = useState(occurrence.idSubCategory);
  const [amount, setAmount] = useState(occurrence.amount);
  const [walletId, setWalletId] = useState(occurrence.idWallet);
  const [date, setDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [sheet, setSheet] = useState<
    'category' | 'sub' | 'amount' | 'date' | null
  >(null);

  const category = categories.find(c => c.idCategory === categoryId) ?? null;
  const subCategory =
    category?.subCategories.find(s => s.idSubCategory === subCategoryId) ??
    null;
  const original = categories.find(c => c.idCategory === occurrence.idCategory);
  const OriginalIcon = original
    ? resolveCategoryIcon(original.icon)
    : CalendarClock;
  const isIncome = occurrence.type === 'income';
  const due = new Date(occurrence.dueDate);
  const dueLabel =
    due.toDateString() === new Date().toDateString()
      ? t('schedule.dueToday')
      : t('schedule.dueOn', {
          date: dateTimeFormat(toIntlLocale(i18n.language), {
            day: 'numeric',
            month: 'short',
          }).format(due),
        });

  const confirm = async () => {
    if (amount <= 0) {
      return showToast(t('schedule.amountRequiredError'), 'error');
    }
    if (!category) {
      return showToast(t('schedule.categoryRequiredError'), 'error');
    }
    if (!walletId) {
      return showToast(t('schedule.walletRequiredError'), 'error');
    }
    setSaving(true);
    try {
      await payOccurrence(occurrence.idOccurrence, {
        amount,
        date: date.toISOString(),
        idWallet: walletId,
        idCategory: category.idCategory,
        idSubCategory: subCategory?.idSubCategory ?? null,
      });
      showToast(t('schedule.paySuccess'), 'success');
      close();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('schedule.genericError'),
        'error',
      );
      setSaving(false);
    }
  };

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t('schedule.payTitle')}
        subtitle={t(
          isIncome
            ? 'schedule.payIncomeSubtitle'
            : 'schedule.payExpenseSubtitle',
        )}
        footer={
          <>
            <Button
              variant="outline"
              label={t('schedule.later')}
              disabled={saving}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t(
                isIncome ? 'schedule.receiveAmount' : 'schedule.payAmount',
                {
                  amount: format(amount),
                },
              )}
              renderIcon={color => <Check size={18} color={color} />}
              loading={saving}
              onPress={confirm}
              style={styles.footerButton}
            />
          </>
        }
      >
        <View style={styles.info}>
          <View style={styles.infoIcon}>
            <OriginalIcon size={18} color={colors.investmentText} />
          </View>
          <View style={styles.infoTexts}>
            <Typography variant="label" numberOfLines={1}>
              {occurrence.title}
            </Typography>
            <Typography variant="meta" tone="muted" numberOfLines={1}>
              {[original?.nameCategory, dueLabel].filter(Boolean).join(' · ')}
            </Typography>
          </View>
          <View style={styles.badge}>
            <Typography variant="badge" tone="investment">
              {t('schedule.scheduledBadge')}
            </Typography>
          </View>
        </View>

        <AmountCard
          amount={amount}
          onPickAmount={() => setSheet('amount')}
          pickAmountLabel={t('transaction.amountTitle')}
          header={
            <CategoryPickerRow
              category={category}
              subCategory={subCategory}
              placeholder={t('transaction.selectCategoryPlaceholder')}
              onPress={() => setSheet('category')}
            />
          }
        />

        <PickerField
          label={t('transaction.dateTimeLabel')}
          value={formatDateTimeLabel(date, i18n.language, {
            today: t('transaction.today'),
            yesterday: t('transaction.yesterday'),
          })}
          renderIcon={color => <CalendarClock size={18} color={color} />}
          onPress={() => setSheet('date')}
        />

        <WalletChipGroup
          label={t(isIncome ? 'schedule.receiveTo' : 'schedule.payFrom')}
          wallets={wallets}
          selectedId={walletId}
          onSelect={setWalletId}
        />
      </SheetLayout>

      <SelectCategorySheet
        visible={sheet === 'category'}
        type={occurrence.type}
        categories={categories}
        selectedId={categoryId}
        onClose={() => setSheet(null)}
        onSelect={selected => {
          setCategoryId(selected.idCategory);
          setSubCategoryId(null);
          setSheet(selected.subCategories.length > 0 ? 'sub' : null);
        }}
      />
      <SelectSubCategorySheet
        visible={sheet === 'sub'}
        category={category}
        selectedId={subCategoryId}
        onBack={() => setSheet('category')}
        onClose={() => setSheet(null)}
        onSelect={selected => {
          setSubCategoryId(selected?.idSubCategory ?? null);
          setSheet(null);
        }}
      />
      <AmountCalculatorSheet
        visible={sheet === 'amount'}
        amount={amount}
        wallets={wallets}
        selectedWalletId={walletId}
        onSelectWallet={setWalletId}
        onClose={() => setSheet(null)}
        onConfirm={setAmount}
      />
      <DateTimePickerSheet
        visible={sheet === 'date'}
        value={date}
        onClose={() => setSheet(null)}
        onConfirm={setDate}
      />
    </>
  );
}
