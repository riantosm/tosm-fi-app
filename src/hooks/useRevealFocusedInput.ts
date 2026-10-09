import { useEffect, type RefObject } from 'react';
import { TextInput } from 'react-native';

/** Bagian ScrollView yang dibutuhkan (ScrollView biasa maupun Animated.ScrollView). */
export interface RevealScrollable {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
  scrollTo: (options: { y: number; animated?: boolean }) => void;
}

/** Ruang di atas keyboard (label field + sedikit napas) dan di bawah tepi atas ScrollView. */
const REVEAL_MARGIN = 32;

/**
 * Setelah keyboard muncul, gulir ScrollView supaya input yang sedang fokus terlihat utuh di atas
 * keyboard. Di Android edge-to-edge window tidak di-resize, jadi layout pemanggil wajib
 * memperpendek area scroll setinggi keyboard (padding bawah); hook ini lalu memastikan input yang
 * memicu keyboard tidak tertinggal di bawah tepi baru tersebut. Pindah fokus antar-input sesudahnya
 * ditangani ScrollView native (menggulir anak yang fokus ke dalam viewport).
 */
export function useRevealFocusedInput(
  scrollRef: RefObject<RevealScrollable | null>,
  getOffset: () => number,
  keyboardHeight: number,
) {
  useEffect(() => {
    if (keyboardHeight <= 0) {
      return;
    }
    // Tunggu padding bawah diterapkan (layout baru) sebelum mengukur. Diulang sekali lagi: di sheet,
    // tinggi area scroll masih menyusut setelah keyboard muncul (sheet ikut memendek).
    const reveal = () => {
      const input =
        TextInput.State.currentlyFocusedInput() as unknown as RevealScrollable | null;
      const scroll = scrollRef.current;
      if (!input || !scroll) {
        return;
      }
      scroll.measureInWindow((_sx, scrollY, _sw, scrollHeight) => {
        input.measureInWindow((_ix, inputY, _iw, inputHeight) => {
          const visibleBottom = scrollY + scrollHeight - REVEAL_MARGIN;
          const overflowBottom = inputY + inputHeight - visibleBottom;
          const overflowTop = scrollY + REVEAL_MARGIN - inputY;
          if (overflowBottom > 0) {
            scroll.scrollTo({
              y: getOffset() + overflowBottom,
              animated: true,
            });
          } else if (overflowTop > 0) {
            scroll.scrollTo({
              y: Math.max(0, getOffset() - overflowTop),
              animated: true,
            });
          }
        });
      });
    };
    const timeouts = [setTimeout(reveal, 80), setTimeout(reveal, 400)];
    return () => timeouts.forEach(clearTimeout);
    // getOffset/scrollRef stabil (ref); hanya perubahan tinggi keyboard yang memicu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardHeight]);
}
