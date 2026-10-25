import { Platform } from 'react-native';
import type { TFunction } from 'i18next';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  AndroidVisibility,
  EventType,
  type AndroidInboxStyle,
  type Event,
  type Notification,
} from '@notifee/react-native';
import { CURRENCIES } from '@/constants/currencies';
import i18n from '@/i18n';
import { getWalletsApi } from '@/services/api/wallet.service';
import { cancelWalletRefresh } from '@/services/native/walletRefresh';
import { persistor, store } from '@/store';
import {
  selectWalletNotificationPrefs,
  setWalletNotification,
  type WalletNotificationPrefs,
} from '@/store/slices/settingsSlice';
import { setWallets } from '@/store/slices/walletSlice';
import { lightColors } from '@/theme/colors';
import type { CurrencyCode, WalletAccount } from '@/types';
import { AMOUNT_MASK, formatNumber } from '@/utils/money';

/**
 * Notifikasi saldo dompet (Android, desain kanvas "Notifikasi Saldo Dompet"): selalu tampil,
 * senyap, isi tersembunyi di layar kunci. Diperbarui oleh `hooks/useWalletNotification` saat app
 * dipakai dan oleh task headless `WalletNotificationRefresh` (WorkManager, tiap jam) saat tidak.
 */

export const WALLET_NOTIFICATION_ID = 'wallet-balance';
const CHANNEL_ID = 'wallet-balance';
/** Baris InboxStyle maksimal; lebih dari itu baris terakhir jadi "+n dompet lainnya". */
const MAX_LINES = 5;

export const WALLET_NOTIFICATION_ACTION = {
  ADD: 'wallet-notification-add',
  TOGGLE_AMOUNTS: 'wallet-notification-toggle',
  OPEN_WALLET: 'wallet-notification-open',
} as const;

export type WalletNotificationRoute = 'quickAdd' | 'wallet';

export type WalletSnapshotItem = Pick<
  WalletAccount,
  'nameWallet' | 'balance' | 'isPrimary'
>;

/** Data dompet terakhir, ikut disimpan di `data` notifikasi supaya bisa ditampilkan ulang tanpa API. */
interface WalletSnapshot {
  wallets: WalletSnapshotItem[];
  updatedAt: number;
}

const isAndroid = Platform.OS === 'android';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface WalletNotificationLine {
  name: string;
  amount: string;
  isPrimary: boolean;
}

/** Isi notifikasi saldo (dipakai notifikasi asli dan pratinjau di Pengaturan). */
export interface WalletNotificationText {
  title: string;
  body: string;
  /** Header diperluas ("4 dompet"); header ringkas memakai `walletNotification.subtitle`. */
  summary: string;
  /** Diisi hanya untuk isi "Semua dompet". */
  lines: WalletNotificationLine[] | null;
  /** Jumlah dompet yang tidak muat di `lines`. */
  moreCount: number;
  toggleLabel: string;
}

interface ContentOptions {
  prefs: WalletNotificationPrefs;
  currency: CurrencyCode;
  decimalPlaces: number;
  t: TFunction;
}

export function buildWalletNotificationContent(
  snapshotWallets: WalletSnapshotItem[],
  { prefs, currency, decimalPlaces, t }: ContentOptions,
): WalletNotificationText {
  const { symbol, locale } =
    CURRENCIES.find(item => item.code === currency) ?? CURRENCIES[0];
  const money = (value: number) =>
    `${symbol} ${
      prefs.hideAmounts
        ? AMOUNT_MASK
        : formatNumber(value, locale, decimalPlaces)
    }`;
  // Dompet utama di atas, sisanya sesuai urutan halaman Dompet.
  const wallets = [
    ...snapshotWallets.filter(wallet => wallet.isPrimary),
    ...snapshotWallets.filter(wallet => !wallet.isPrimary),
  ];
  const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const count = t('walletNotification.walletCount', { count: wallets.length });
  const primary = wallets.find(wallet => wallet.isPrimary);

  let body = prefs.hideAmounts
    ? t('walletNotification.bodyHidden', { count })
    : count;
  if (prefs.content !== 'total' && primary) {
    body = t('walletNotification.bodyPrimary', {
      name: primary.nameWallet,
      amount: money(primary.balance),
      count,
    });
  }

  let lines: WalletNotificationLine[] | null = null;
  let moreCount = 0;
  if (prefs.content === 'all' && wallets.length > 0) {
    const overflow = wallets.length > MAX_LINES;
    const shown = overflow ? wallets.slice(0, MAX_LINES - 1) : wallets;
    moreCount = wallets.length - shown.length;
    lines = shown.map(wallet => ({
      name: wallet.nameWallet,
      amount: money(wallet.balance),
      isPrimary: wallet.isPrimary,
    }));
  }

  return {
    title: money(total),
    body,
    summary: count,
    lines,
    moreCount,
    toggleLabel: t(
      prefs.hideAmounts
        ? 'walletNotification.actionShow'
        : 'walletNotification.actionHide',
    ),
  };
}

function buildNotification(snapshot: WalletSnapshot): Notification {
  const state = store.getState();
  const t = i18n.t.bind(i18n);
  const content = buildWalletNotificationContent(snapshot.wallets, {
    prefs: selectWalletNotificationPrefs(state),
    currency: state.settings.currency,
    decimalPlaces: state.settings.decimalPlaces,
    t,
  });

  let style: AndroidInboxStyle | undefined;
  if (content.lines) {
    const lines = content.lines.map(line => {
      const text = `<b>${escapeHtml(line.name)}</b> · ${line.amount}`;
      return line.isPrimary
        ? `${text} · ${t('walletNotification.primaryTag')}`
        : text;
    });
    if (content.moreCount > 0) {
      lines.push(t('walletNotification.moreWallets', { n: content.moreCount }));
    }
    style = { type: AndroidStyle.INBOX, lines, summary: content.summary };
  }

  return {
    id: WALLET_NOTIFICATION_ID,
    title: content.title,
    subtitle: t('walletNotification.subtitle'),
    body: content.body,
    data: { snapshot: JSON.stringify(snapshot) },
    android: {
      channelId: CHANNEL_ID,
      smallIcon: 'ic_stat_tosmfi',
      color: lightColors.primary,
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      showTimestamp: true,
      timestamp: snapshot.updatedAt,
      visibility: AndroidVisibility.PRIVATE,
      style,
      pressAction: {
        id: WALLET_NOTIFICATION_ACTION.OPEN_WALLET,
        launchActivity: 'default',
      },
      actions: [
        {
          title: t('walletNotification.actionAdd'),
          pressAction: {
            id: WALLET_NOTIFICATION_ACTION.ADD,
            launchActivity: 'default',
          },
        },
        {
          title: content.toggleLabel,
          // Tanpa launchActivity: ditangani di latar belakang, app tidak terbuka.
          pressAction: { id: WALLET_NOTIFICATION_ACTION.TOGGLE_AMOUNTS },
        },
        {
          title: t('walletNotification.actionOpenWallet'),
          pressAction: {
            id: WALLET_NOTIFICATION_ACTION.OPEN_WALLET,
            launchActivity: 'default',
          },
        },
      ],
    },
  };
}

async function display(snapshot: WalletSnapshot): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: i18n.t('walletNotification.channelName'),
    importance: AndroidImportance.LOW,
    vibration: false,
  });
  await notifee.displayNotification(buildNotification(snapshot));
}

function parseSnapshot(
  notification: Notification | undefined,
): WalletSnapshot | null {
  const raw = notification?.data?.snapshot;
  if (typeof raw !== 'string') {
    return null;
  }
  try {
    return JSON.parse(raw) as WalletSnapshot;
  } catch {
    return null;
  }
}

/** Tampilkan / perbarui notifikasi saldo (id tetap, jadi yang lama tertimpa tanpa bunyi). */
export async function showWalletNotification(
  wallets: WalletAccount[],
  updatedAt = Date.now(),
): Promise<void> {
  if (!isAndroid) {
    return;
  }
  if (wallets.length === 0) {
    await cancelWalletNotification();
    return;
  }
  await display({
    wallets: wallets.map(({ nameWallet, balance, isPrimary }) => ({
      nameWallet,
      balance,
      isPrimary,
    })),
    updatedAt,
  });
}

export async function cancelWalletNotification(): Promise<void> {
  if (isAndroid) {
    await notifee.cancelDisplayedNotification(WALLET_NOTIFICATION_ID);
  }
}

function canShow(): boolean {
  const state = store.getState();
  return state.auth.isLogin && selectWalletNotificationPrefs(state).enabled;
}

/**
 * Di task headless/event latar belakang app bisa belum dirender: tunggu rehydrate redux-persist
 * (token + pengaturan) lalu samakan bahasa i18n dengan pilihan user.
 */
async function ensureStoreReady(): Promise<void> {
  if (!persistor.getState().bootstrapped) {
    await new Promise<void>(resolve => {
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
  const { language } = store.getState().settings;
  if (language && i18n.language !== language) {
    await i18n.changeLanguage(language);
  }
}

/** Task headless WorkManager: muat ulang saldo dari API lalu perbarui notifikasi. */
export async function refreshWalletNotification(): Promise<void> {
  await ensureStoreReady();
  if (!canShow()) {
    await cancelWalletNotification();
    await cancelWalletRefresh().catch(() => {});
    return;
  }
  try {
    const wallets = await getWalletsApi();
    store.dispatch(setWallets(wallets));
    await showWalletNotification(wallets);
  } catch {
    // Offline / server error: notifikasi lama (dengan jam sinkron terakhir) dibiarkan.
  }
}

/** Ganti sembunyikan/tampilkan nominal lalu tampilkan ulang dari data terakhir (tanpa API). */
async function toggleAmounts(notification: Notification | undefined) {
  await ensureStoreReady();
  const { hideAmounts } = selectWalletNotificationPrefs(store.getState());
  store.dispatch(setWalletNotification({ hideAmounts: !hideAmounts }));
  await persistor.flush();
  const snapshot = parseSnapshot(notification);
  if (snapshot && canShow()) {
    await display(snapshot);
  }
}

let pendingRoute: WalletNotificationRoute | null = null;
let routeListener: ((route: WalletNotificationRoute) => void) | null = null;

/** Dipakai hook navigasi: rute dari tombol notifikasi yang belum sempat dibuka. */
export function takePendingWalletNotificationRoute(): WalletNotificationRoute | null {
  const route = pendingRoute;
  pendingRoute = null;
  return route;
}

export function setWalletNotificationRouteListener(
  listener: ((route: WalletNotificationRoute) => void) | null,
) {
  routeListener = listener;
}

/** Rute tujuan untuk tap notifikasi / tombol aksi (null = bukan tap yang membuka app). */
export function routeForWalletNotificationPress(
  pressActionId: string | undefined,
): WalletNotificationRoute | null {
  if (pressActionId === WALLET_NOTIFICATION_ACTION.ADD) {
    return 'quickAdd';
  }
  if (pressActionId === WALLET_NOTIFICATION_ACTION.OPEN_WALLET) {
    return 'wallet';
  }
  return null;
}

/**
 * Event notifee untuk notifikasi saldo, dari latar depan maupun belakang. Mengembalikan false
 * kalau event milik notifikasi lain.
 */
export async function handleWalletNotificationEvent({
  type,
  detail,
}: Event): Promise<boolean> {
  if (detail.notification?.id !== WALLET_NOTIFICATION_ID) {
    return false;
  }
  if (type === EventType.DISMISSED) {
    // Android 14+ mengizinkan notifikasi ongoing digeser; selama fitur aktif, tampilkan lagi.
    await ensureStoreReady();
    const snapshot = parseSnapshot(detail.notification);
    if (snapshot && canShow()) {
      await display(snapshot);
    }
    return true;
  }
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const actionId = detail.pressAction?.id;
    if (actionId === WALLET_NOTIFICATION_ACTION.TOGGLE_AMOUNTS) {
      await toggleAmounts(detail.notification);
      return true;
    }
    const route = routeForWalletNotificationPress(actionId);
    if (route) {
      if (routeListener) {
        routeListener(route);
      } else {
        pendingRoute = route;
      }
    }
    return true;
  }
  return true;
}
