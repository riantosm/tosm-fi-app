import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CalendarClock, CalendarX, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import IconButton from '@/components/atoms/IconButton';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useSchedules } from '@/hooks/useSchedules';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import ScheduleCard from '@/screens/Schedule/ScheduleCard';
import ScheduleSummary, {
  type NextDueInfo,
} from '@/screens/Schedule/ScheduleSummary';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Schedule } from '@/types';
import { toIntlLocale } from '@/utils/locale';
import {
  describeFrequency,
  formatDueDate,
  getNextDueDate,
  monthlyEquivalent,
  ruleFromSchedule,
} from '@/utils/schedule';
import Reveal from '@/components/atoms/Reveal';

const useStyles = makeStyles(() => ({
  section: { gap: spacing.md },
  sectionLabel: {
    paddingHorizontal: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.72,
  },
}));

/** Halaman Jadwal (pen `a0SVGi` · `go3lT`) — port SchedulePage web. */
export default function ScheduleScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SCHEDULE>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const showToast = useToast();
  const { categories, loadCategories } = useCategories();
  const {
    schedules,
    status,
    loadSchedules,
    setScheduleActive,
    deleteSchedule,
  } = useSchedules();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Schedule | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const dueLabels = {
    today: t('schedule.today'),
    tomorrow: t('schedule.tomorrow'),
  };

  const rows = useMemo(
    () =>
      schedules.map(schedule => {
        const rule = ruleFromSchedule(schedule);
        return {
          schedule,
          rule,
          next: schedule.isActive ? getNextDueDate(rule) : null,
        };
      }),
    [schedules],
  );
  const activeRows = rows.filter(row => row.schedule.isActive);
  const pausedRows = rows.filter(row => !row.schedule.isActive);

  const nextRow = activeRows
    .filter(row => row.next)
    .sort((a, b) => a.next!.getTime() - b.next!.getTime())[0];
  const nextDue: NextDueInfo | null = nextRow?.next
    ? {
        title: nextRow.schedule.title,
        whenLabel: formatDueDate(nextRow.next, locale, dueLabels).toLowerCase(),
        amount: nextRow.schedule.amount,
        isIncome: nextRow.schedule.type === 'income',
      }
    : null;

  let monthlyExpense = 0;
  let monthlyIncome = 0;
  for (const { schedule } of activeRows) {
    const perMonth = monthlyEquivalent(schedule);
    if (perMonth === null) {
      continue;
    }
    if (schedule.type === 'income') {
      monthlyIncome += perMonth;
    } else {
      monthlyExpense += perMonth;
    }
  }

  const initialLoading = status !== 'loaded' && schedules.length === 0;
  const empty = status === 'loaded' && schedules.length === 0;
  const sections = [
    {
      key: 'active',
      label: t('schedule.activeSection', { count: activeRows.length }),
      rows: activeRows,
    },
    {
      key: 'paused',
      label: t('schedule.pausedSection', { count: pausedRows.length }),
      rows: pausedRows,
    },
  ].filter(section => section.rows.length > 0);

  const openCreate = () => navigation.navigate(ROUTES.SCHEDULE_FORM);

  const fail = (error: unknown) =>
    showToast(
      error instanceof Error ? error.message : t('schedule.genericError'),
      'error',
    );

  const toggleActive = async (schedule: Schedule) => {
    setBusyId(schedule.idSchedule);
    try {
      await setScheduleActive(schedule.idSchedule, !schedule.isActive);
      showToast(
        t(
          schedule.isActive
            ? 'schedule.pauseSuccess'
            : 'schedule.resumeSuccess',
        ),
        'success',
      );
    } catch (error) {
      fail(error);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteSchedule(deleting.idSchedule);
      showToast(t('schedule.deleteSuccess'), 'success');
      setDeleting(null);
    } catch (error) {
      fail(error);
    } finally {
      setDeleteBusy(false);
    }
  };

  let cardIndex = 0;

  return (
    <>
      <MainLayout
        title={t('nav.schedule')}
        withTabBar
        headerRight={
          !empty && (
            <IconButton
              variant="primary"
              label={t('schedule.addSchedule')}
              onPress={openCreate}
              renderIcon={(color, size) => <Plus size={size} color={color} />}
            />
          )
        }
        onRefresh={() => Promise.all([loadSchedules(), loadCategories()])}
      >
        {empty ? (
          <Card>
            <EmptyState
              icon={<CalendarClock size={30} color={colors.primaryText} />}
              title={t('schedule.emptyTitle')}
              description={t('schedule.emptyDescription')}
              action={
                <Button
                  label={t('schedule.addFirst')}
                  renderIcon={color => <Plus size={18} color={color} />}
                  onPress={openCreate}
                />
              }
            />
          </Card>
        ) : (
          <>
            <Reveal>
              <ScheduleSummary
                nextDue={nextDue}
                monthlyExpense={monthlyExpense}
                monthlyIncome={monthlyIncome}
                loading={initialLoading}
              />
            </Reveal>
            {initialLoading
              ? [0, 1, 2].map(index => (
                  <Skeleton key={index} height={132} radius={radius.card} />
                ))
              : sections.map(section => (
                  <View key={section.key} style={styles.section}>
                    <Typography
                      variant="eyebrow"
                      tone="subtle"
                      style={styles.sectionLabel}
                    >
                      {section.label}
                    </Typography>
                    {section.rows.map(({ schedule, rule, next }) => (
                      <Reveal
                        delay={Math.min(cardIndex++, 6) * 40}
                        key={schedule.idSchedule}
                      >
                        <ScheduleCard
                          schedule={schedule}
                          category={categories.find(
                            item => item.idCategory === schedule.idCategory,
                          )}
                          frequencyLabel={describeFrequency(rule, t, locale)}
                          nextLabel={
                            next ? formatDueDate(next, locale, dueLabels) : null
                          }
                          busy={busyId === schedule.idSchedule}
                          onToggleActive={() => toggleActive(schedule)}
                          onEdit={() =>
                            navigation.navigate(ROUTES.SCHEDULE_FORM, {
                              schedule,
                            })
                          }
                          onDelete={() => setDeleting(schedule)}
                        />
                      </Reveal>
                    ))}
                  </View>
                ))}
          </>
        )}
      </MainLayout>

      <ConfirmDialog
        visible={!!deleting}
        tone="danger"
        renderIcon={color => <CalendarX size={24} color={color} />}
        title={t('schedule.deleteConfirmTitle', {
          name: deleting?.title ?? '',
        })}
        message={t('schedule.deleteConfirmDescription')}
        confirmLabel={t('schedule.deleteScheduleAction')}
        cancelLabel={t('common.cancel')}
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
