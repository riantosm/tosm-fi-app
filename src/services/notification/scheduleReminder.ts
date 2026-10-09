import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

/**
 * Notifikasi LOKAL untuk pengingat Jadwal (tanpa Firebase / push server). Disinkronkan oleh
 * `hooks/useScheduleReminders` setiap daftar jadwal berubah.
 */

/** Prefix id notifikasi pengingat jadwal (`schedule-<idSchedule>`). */
export const SCHEDULE_REMINDER_PREFIX = 'schedule-';

const CHANNEL_ID = 'schedule-reminder';

export interface ScheduleReminderInput {
  /** Id unik dan stabil, misalnya idScheduleOccurrence, supaya bisa di-update/batal. */
  id: string;
  title: string;
  body: string;
  /** Waktu notifikasi muncul (harus di masa depan). */
  date: Date;
}

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Pengingat jadwal',
    importance: AndroidImportance.HIGH,
  });
}

/** Minta izin notifikasi (Android 13+ / iOS). Mengembalikan true kalau diizinkan. */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

/** Jadwalkan (atau timpa, kalau id sama) satu pengingat. */
export async function scheduleReminder({
  id,
  title,
  body,
  date,
}: ScheduleReminderInput): Promise<void> {
  if (date.getTime() <= Date.now()) {
    return;
  }
  const channelId = await ensureChannel();
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: { channelId, pressAction: { id: 'default' } },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      // Tidak butuh izin exact alarm (Android 14 menolaknya secara default); meleset beberapa
      // menit tidak masalah untuk pengingat harian.
      alarmManager: { type: AlarmType.SET_AND_ALLOW_WHILE_IDLE },
    },
  );
}

export async function cancelReminder(id: string): Promise<void> {
  await notifee.cancelTriggerNotification(id);
}

/**
 * Samakan pengingat terjadwal dengan daftar `reminders`: yang tidak ada lagi dibatalkan,
 * sisanya dibuat/ditimpa (id sama).
 */
export async function syncScheduleReminders(
  reminders: ScheduleReminderInput[],
): Promise<void> {
  const wanted = new Set(reminders.map(reminder => reminder.id));
  const existing = await notifee.getTriggerNotificationIds();
  await Promise.all(
    existing
      .filter(id => id.startsWith(SCHEDULE_REMINDER_PREFIX) && !wanted.has(id))
      .map(id => notifee.cancelTriggerNotification(id)),
  );
  await Promise.all(reminders.map(scheduleReminder));
}

/** Dipanggil saat logout supaya pengingat akun sebelumnya tidak muncul. */
export async function cancelAllReminders(): Promise<void> {
  await notifee.cancelTriggerNotifications();
}
