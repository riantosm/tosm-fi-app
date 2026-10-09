import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useSchedules } from '@/hooks/useSchedules';
import {
  SCHEDULE_REMINDER_PREFIX,
  syncScheduleReminders,
} from '@/services/notification/scheduleReminder';
import { useAppSelector } from '@/store/hooks';
import { getNextDueDate, ruleFromSchedule } from '@/utils/schedule';

/** Jam pengingat di hari jatuh tempo. */
export const REMINDER_HOUR = 8;

/**
 * Pengingat lokal jadwal aktif: satu notifikasi jam 08.00 di jatuh tempo berikutnya
 * (dipasang ulang setiap daftar jadwal / bahasa berubah). Dipanggil sekali di AppShell.
 */
export function useScheduleReminders() {
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const { schedules, status } = useSchedules({ autoLoad: isLogin });
  const { t, i18n } = useTranslation();
  const { format } = useMoneyFormat();

  useEffect(() => {
    if (!isLogin || status !== 'loaded') {
      return;
    }
    const now = new Date();
    const reminders = schedules
      .filter(schedule => schedule.isActive)
      .flatMap(schedule => {
        const rule = ruleFromSchedule(schedule);
        let due = getNextDueDate(rule, now);
        if (due) {
          due.setHours(REMINDER_HOUR, 0, 0, 0);
          // Jam pengingat hari ini sudah lewat → pakai jatuh tempo berikutnya.
          if (due.getTime() <= now.getTime()) {
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            due = getNextDueDate(rule, tomorrow);
            due?.setHours(REMINDER_HOUR, 0, 0, 0);
          }
        }
        if (!due) {
          return [];
        }
        return [
          {
            id: `${SCHEDULE_REMINDER_PREFIX}${schedule.idSchedule}`,
            title: t(
              schedule.type === 'income'
                ? 'schedule.reminderTitleIncome'
                : 'schedule.reminderTitleExpense',
            ),
            body: t('schedule.reminderBody', {
              title: schedule.title,
              amount: format(schedule.amount),
            }),
            date: due,
          },
        ];
      });
    syncScheduleReminders(reminders).catch(() => {});
    // i18n.language: teks notifikasi ikut bahasa aktif.
  }, [isLogin, status, schedules, t, format, i18n.language]);
}
