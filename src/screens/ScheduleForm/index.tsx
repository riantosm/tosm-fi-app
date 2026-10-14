import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { BellRing, Calendar, Check, Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import AmountCard from '@/components/molecules/AmountCard';
import CategoryPickerRow from '@/components/molecules/CategoryPickerRow';
import PickerField from '@/components/molecules/PickerField';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import TextField from '@/components/molecules/TextField';
import WalletChipGroup from '@/components/molecules/WalletChipGroup';
import AmountCalculatorSheet from '@/components/organisms/AmountCalculatorSheet';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import SelectCategorySheet from '@/components/organisms/SelectCategorySheet';
import SelectSubCategorySheet from '@/components/organisms/SelectSubCategorySheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useSchedules } from '@/hooks/useSchedules';
import { useWallets } from '@/hooks/useWallets';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { requestNotificationPermission } from '@/services/notification/scheduleReminder';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  Category,
  CategoryType,
  ScheduleFrequency,
  ScheduleInput,
  SubCategory,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { toIsoDateString } from '@/utils/month';
import { transitions } from '@/utils/motion';
import {
  WEEKDAY_ORDER,
  describeRecurrencePreview,
  formatLongDate,
  parseScheduleDate,
  weekdayLabel,
} from '@/utils/schedule';

const FREQUENCIES: ScheduleFrequency[] = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
];
const FREQUENCY_KEY: Record<ScheduleFrequency, string> = {
  daily: 'schedule.frequencyDaily',
  weekly: 'schedule.frequencyWeekly',
  monthly: 'schedule.frequencyMonthly',
  yearly: 'schedule.frequencyYearly',
};

const useStyles = makeStyles(({ colors }) => ({
  field: { gap: spacing.sm },
  weekdays: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: {
    flex: 1,
    maxWidth: 44,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  daySelected: { backgroundColor: colors.primary },
  preview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.primarySoft,
  },
  previewTexts: { flex: 1, gap: spacing.xs },
  footerButton: { flex: 1 },
}));

/** Tambah / edit jadwal (pen `nHHvn` · `W9TVu`) — port AddScheduleModal web. */
export default function ScheduleFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.SCHEDULE_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const showToast = useToast();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const { createSchedule, editSchedule } = useSchedules({ autoLoad: false });
  const schedule = route.params?.schedule ?? null;
  const close = navigation.goBack;

  const [type, setType] = useState<CategoryType>(schedule?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState<string | null>(
    schedule?.idCategory ?? null,
  );
  const [subCategoryId, setSubCategoryId] = useState<string | null>(
    schedule?.idSubCategory ?? null,
  );
  const [amount, setAmount] = useState(schedule?.amount ?? 0);
  const [walletId, setWalletId] = useState<string | null>(
    schedule?.idWallet ?? null,
  );
  const [title, setTitle] = useState(schedule?.title ?? '');
  const [notes, setNotes] = useState(schedule?.notes ?? '');
  const [frequency, setFrequency] = useState<ScheduleFrequency>(
    schedule?.frequency ?? 'monthly',
  );
  const [weekdays, setWeekdays] = useState<number[]>(schedule?.weekdays ?? []);
  const [startDate, setStartDate] = useState(() =>
    schedule ? parseScheduleDate(schedule.startDate) : new Date(),
  );
  const [saving, setSaving] = useState(false);
  const [sheet, setSheet] = useState<
    'category' | 'sub' | 'amount' | 'date' | null
  >(null);

  const selectedWalletId =
    walletId ??
    (wallets.find(wallet => wallet.isPrimary) ?? wallets[0])?.idWallet ??
    null;
  const category =
    categories.find(item => item.idCategory === categoryId) ?? null;
  const subCategory =
    category?.subCategories.find(sub => sub.idSubCategory === subCategoryId) ??
    null;
  const preview = describeRecurrencePreview(
    { frequency, weekdays, dayOfMonth: null, month: null, startDate },
    t,
    locale,
  );

  const changeType = (next: CategoryType) => {
    if (next === type) {
      return;
    }
    setType(next);
    setCategoryId(null);
    setSubCategoryId(null);
  };

  const toggleWeekday = (day: number) =>
    setWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(item => item !== day)
        : [...prev, day].sort(),
    );

  const buildInput = (): ScheduleInput | null => {
    if (amount <= 0) {
      showToast(t('schedule.amountRequiredError'), 'error');
      return null;
    }
    if (!category) {
      showToast(t('schedule.categoryRequiredError'), 'error');
      return null;
    }
    if (!selectedWalletId) {
      showToast(t('schedule.walletRequiredError'), 'error');
      return null;
    }
    if (frequency === 'weekly' && weekdays.length === 0) {
      showToast(t('schedule.weekdaysRequiredError'), 'error');
      return null;
    }
    return {
      type,
      idWallet: selectedWalletId,
      idCategory: category.idCategory,
      idSubCategory: subCategory?.idSubCategory ?? null,
      title: title.trim() || category.nameCategory,
      notes: notes.trim(),
      amount,
      frequency,
      weekdays: frequency === 'weekly' ? weekdays : [],
      startDate: toIsoDateString(startDate),
    };
  };

  const save = async () => {
    const input = buildInput();
    if (!input) {
      return;
    }
    setSaving(true);
    try {
      if (schedule) {
        await editSchedule(schedule.idSchedule, input);
        showToast(t('schedule.updateSuccess'), 'success');
      } else {
        await createSchedule(input);
        showToast(t('schedule.createSuccess'), 'success');
        // Pengingat butuh izin notifikasi (Android 13+); diminta saat jadwal pertama dibuat.
        requestNotificationPermission().catch(() => {});
      }
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
        title={t(schedule ? 'schedule.editSchedule' : 'schedule.addSchedule')}
        subtitle={schedule?.title}
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={saving}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t(
                schedule ? 'transaction.saveChanges' : 'schedule.saveSchedule',
              )}
              renderIcon={color => <Check size={18} color={color} />}
              loading={saving}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <SegmentedControl<CategoryType>
          value={type}
          onChange={changeType}
          activeColor={
            type === 'expense' ? colors.expenseText : colors.incomeText
          }
          options={[
            { value: 'expense', label: t('transaction.expense') },
            { value: 'income', label: t('transaction.income') },
          ]}
        />

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

        <TextField
          variant="filled"
          label={t('schedule.titleLabel')}
          value={title}
          onChangeText={setTitle}
          placeholder={category?.nameCategory ?? t('schedule.titlePlaceholder')}
          autoCapitalize="sentences"
          renderLeadingIcon={color => <Type size={18} color={color} />}
        />

        <WalletChipGroup
          label={t('transaction.walletLabel')}
          wallets={wallets}
          selectedId={selectedWalletId}
          onSelect={setWalletId}
        />

        <View style={styles.field}>
          <Typography variant="fieldLabel" tone="muted">
            {t('schedule.frequencyLabel')}
          </Typography>
          <SegmentedControl<ScheduleFrequency>
            value={frequency}
            onChange={setFrequency}
            activeColor={colors.primaryText}
            options={FREQUENCIES.map(item => ({
              value: item,
              label: t(FREQUENCY_KEY[item]),
            }))}
          />
        </View>

        <AnimatePresence>
          {frequency === 'weekly' && (
            <MotiView
              key="weekdays"
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -6 }}
              transition={transitions.fade}
              style={styles.field}
            >
              <Typography variant="fieldLabel" tone="muted">
                {t('schedule.weekdaysLabel')}
              </Typography>
              <View style={styles.weekdays}>
                {WEEKDAY_ORDER.map(day => {
                  const selected = weekdays.includes(day);
                  const label = weekdayLabel(day, locale);
                  return (
                    <PressableScale
                      key={day}
                      accessibilityRole="checkbox"
                      accessibilityLabel={weekdayLabel(day, locale, 'long')}
                      accessibilityState={{ checked: selected }}
                      scaleTo={0.9}
                      onPress={() => toggleWeekday(day)}
                      style={[styles.day, selected && styles.daySelected]}
                    >
                      <Typography
                        variant={selected ? 'fieldLabel' : 'secondaryMedium'}
                        tone={selected ? 'inverse' : 'muted'}
                        numberOfLines={1}
                      >
                        {label}
                      </Typography>
                    </PressableScale>
                  );
                })}
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        <PickerField
          label={t('schedule.startLabel')}
          value={formatLongDate(startDate, locale)}
          renderIcon={color => <Calendar size={18} color={color} />}
          onPress={() => setSheet('date')}
        />

        {!!preview && (
          <MotiView
            key={preview}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitions.fade}
            style={styles.preview}
          >
            <BellRing size={16} color={colors.primaryText} />
            <View style={styles.previewTexts}>
              <Typography variant="meta" tone="primary">
                {preview}
              </Typography>
              <Typography variant="caption" tone="primary">
                {t('schedule.reminderNote')}
              </Typography>
            </View>
          </MotiView>
        )}

        <TextField
          variant="filled"
          label={t('transaction.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('transaction.notesPlaceholder')}
          autoCapitalize="sentences"
          multiline
        />
      </SheetLayout>

      <SelectCategorySheet
        visible={sheet === 'category'}
        type={type}
        categories={categories}
        selectedId={categoryId}
        onClose={() => setSheet(null)}
        onSelect={(selected: Category) => {
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
        onSelect={(selected: SubCategory | null) => {
          setSubCategoryId(selected?.idSubCategory ?? null);
          setSheet(null);
        }}
      />
      <AmountCalculatorSheet
        visible={sheet === 'amount'}
        amount={amount}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setWalletId}
        onClose={() => setSheet(null)}
        onConfirm={setAmount}
      />
      <DateTimePickerSheet
        visible={sheet === 'date'}
        value={startDate}
        dateOnly
        title={t('schedule.startDateLabel')}
        onClose={() => setSheet(null)}
        onConfirm={setStartDate}
      />
    </>
  );
}
