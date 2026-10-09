import { Keyboard, Modal } from 'react-native';
import SheetLayout, {
  type SheetLayoutProps,
} from '@/components/templates/SheetLayout';

export interface BottomSheetProps extends SheetLayoutProps {
  visible: boolean;
}

/** Bottom sheet di atas layar saat ini (Modal) — tampilan dari `SheetLayout`. */
export default function BottomSheet({ visible, ...layout }: BottomSheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {
        // Back saat keyboard terbuka hanya menutup keyboard, bukan sheet (isian tidak hilang).
        if (Keyboard.isVisible()) {
          Keyboard.dismiss();
          return;
        }
        layout.onClose();
      }}
    >
      <SheetLayout {...layout} />
    </Modal>
  );
}
