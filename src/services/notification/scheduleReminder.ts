import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

/**
 * Notifikasi LOKAL untuk pengingat Jadwal (tanpa Firebase / push server).
 * Belum disambungkan ke UI; dipakai saat layar Jadwal di-port.
 */

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
      alarmManager: { allowWhileIdle: true },
    },
  );
}

export async function cancelReminder(id: string): Promise<void> {
  await notifee.cancelTriggerNotification(id);
}

/** Dipanggil saat logout supaya pengingat akun sebelumnya tidak muncul. */
export async function cancelAllReminders(): Promise<void> {
  await notifee.cancelTriggerNotifications();
}
