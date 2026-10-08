import type { MotiTransition } from 'moti';
import type { WithSpringConfig } from 'react-native-reanimated';

/** Preset animasi bersama. Jangan menulis konfigurasi spring/timing inline di komponen. */
export const springs = {
  /** Tekan-lepas pada elemen yang bisa di-tap. */
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  /** Indikator aktif (tab bar, chip). Setara web: stiffness 420, damping 34. */
  indicator: { damping: 34, stiffness: 420 },
  /** Modal / sheet muncul. */
  pop: { damping: 22, stiffness: 260 },
} satisfies Record<string, WithSpringConfig>;

export const pressScale = 0.96;

/**
 * Transisi moti. Di-cast ke MotiTransition karena tipe moti 0.30 belum cocok dengan
 * tipe Reanimated 4 (runtime aman); komponen cukup memakai preset di sini.
 */
const timing = (duration: number) =>
  ({ type: 'timing', duration } as MotiTransition<any>);
const spring = (config: WithSpringConfig) =>
  ({ type: 'spring', ...config } as MotiTransition<any>);

export const transitions = {
  fade: timing(200),
  enter: timing(260),
  indicator: spring(springs.indicator),
  pop: spring(springs.pop),
};

/** Preset moti untuk konten yang muncul (fade + geser sedikit dari bawah). */
export const fadeInUp = {
  from: { opacity: 0, translateY: 12 },
  animate: { opacity: 1, translateY: 0 },
  transition: transitions.enter,
};

export const fadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: transitions.fade,
};
