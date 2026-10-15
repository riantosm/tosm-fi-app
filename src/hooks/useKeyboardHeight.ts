import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Tinggi keyboard saat ini (0 bila tertutup). Di Android edge-to-edge `adjustResize` tidak
 * mengecilkan window, jadi sheet perlu menambah ruang bawah sendiri.
 *
 * Android: `endCoordinates.height` dari RN = inset IME dikurangi inset system bar bawah, padahal
 * dengan edge-to-edge keyboard menutupi area navigation bar juga → tambahkan kembali inset bawah.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return Platform.OS === 'android' && height > 0 ? height + bottom : height;
}
