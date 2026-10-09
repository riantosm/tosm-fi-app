import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Tinggi keyboard saat ini (0 bila tertutup). Di Android edge-to-edge `adjustResize` tidak
 * mengecilkan window, jadi sheet perlu menambah ruang bawah sendiri.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

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

  return height;
}
