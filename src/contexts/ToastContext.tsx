import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import Toast, { type ToastTone } from '@/components/molecules/Toast';
import { layout } from '@/theme/metrics';
import { transitions } from '@/utils/motion';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone, durationMs?: number) => void;
  current: ToastState | null;
  /** Host paling atas yang boleh merender toast. */
  topHost: string | null;
  registerHost: (id: string) => () => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  current: null,
  topHost: null,
  registerHost: () => () => {},
});

/**
 * Toast global. Modal (BottomSheet, route sheet) tampil di window native terpisah di atas
 * window utama, jadi tiap sheet memasang `ToastHost` sendiri; hanya host yang terakhir
 * terpasang (paling atas) yang merender toast supaya selalu terlihat dan tidak dobel.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastState | null>(null);
  const [hosts, setHosts] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info', durationMs = 2200) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      counter.current += 1;
      setCurrent({ id: counter.current, message, tone });
      timer.current = setTimeout(() => setCurrent(null), durationMs);
    },
    [],
  );

  const registerHost = useCallback((id: string) => {
    setHosts(prev => [...prev, id]);
    return () => setHosts(prev => prev.filter(item => item !== id));
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      current,
      topHost: hosts[hosts.length - 1] ?? null,
      registerHost,
    }),
    [showToast, current, hosts, registerHost],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).showToast;
}

export interface ToastHostProps {
  /** Jarak dari tepi (bawah untuk `bottom`, atas untuk `top`). */
  offset: number;
  position?: 'top' | 'bottom';
}

/** Tempat toast dirender. Hanya host paling atas yang aktif. */
export function ToastHost({ offset, position = 'bottom' }: ToastHostProps) {
  const id = useId();
  const { current, topHost, registerHost } = useContext(ToastContext);
  useEffect(() => registerHost(id), [id, registerHost]);
  const fromY = position === 'bottom' ? 16 : -16;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.host,
        position === 'bottom' ? { bottom: offset } : { top: offset },
      ]}
    >
      <AnimatePresence>
        {current && topHost === id && (
          <MotiView
            key={current.id}
            from={{ opacity: 0, translateY: fromY }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: fromY }}
            transition={transitions.enter}
          >
            <Toast message={current.message} tone={current.tone} />
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
  },
});
