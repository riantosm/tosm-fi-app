import { Platform } from 'react-native';
import { navigationRef } from '@/navigation/navigationRef';
import { reportClientErrorApi } from '@/services/api/clientError.service';
import { store } from '@/store';

/**
 * Satu pintu semua log crash (port `crash-logger.ts` web): console.error untuk debug lokal, lalu
 * laporan best-effort ke backend supaya admin bisa melihatnya di Pengaturan → Log Error.
 */
export function logCrash(source: string, details: Record<string, unknown>) {
  const path = navigationRef.isReady()
    ? navigationRef.getCurrentRoute()?.name
    : undefined;
  console.error(`[Crash:${source}]`, { path, ...details });

  // POST /errors butuh token; crash sebelum login hanya tercatat di console (sama dengan web).
  if (!store.getState().auth.token) {
    return;
  }
  const { message, stack, ...extra } = details;
  reportClientErrorApi({
    source,
    environment: __DEV__ ? 'development' : 'production',
    message: typeof message === 'string' ? message : 'Unknown error',
    stack: typeof stack === 'string' ? stack : undefined,
    path,
    userAgent: `TosmFi ${Platform.OS} ${Platform.Version}`,
    extra: Object.keys(extra).length > 0 ? extra : undefined,
  }).catch(() => {
    // Melaporkan crash tidak boleh ikut melempar error.
  });
}

interface HermesRejectionTracker {
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, rejection: unknown) => void;
    onHandled: (id: number) => void;
  }) => void;
}

/**
 * Error di luar render (handler, timer) lewat `ErrorUtils`, dan promise ditolak yang tidak
 * ditangani. Di dev RN sudah melacak rejection untuk LogBox, jadi tracker sendiri hanya di produksi.
 */
export function setupGlobalErrorLogging() {
  const previous = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logCrash(isFatal ? 'fatal' : 'global', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    previous(error, isFatal);
  });

  if (!__DEV__) {
    const hermes = (globalThis as { HermesInternal?: HermesRejectionTracker })
      .HermesInternal;
    hermes?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: (_id, rejection) =>
        logCrash('unhandledrejection', {
          message:
            rejection instanceof Error ? rejection.message : String(rejection),
          stack: rejection instanceof Error ? rejection.stack : undefined,
        }),
      onHandled: () => {},
    });
  }
}
