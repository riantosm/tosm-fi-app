import { Moon, Sun } from 'lucide-react-native';
import IconButton, {
  type IconButtonVariant,
} from '@/components/atoms/IconButton';

export interface ThemeToggleButtonProps {
  isDark: boolean;
  label: string;
  onToggle: () => void;
  variant?: IconButtonVariant;
}

/** Tombol bulat ☀/☾: menampilkan tema tujuan (gelap → ☀, terang → ☾). */
export default function ThemeToggleButton({
  isDark,
  label,
  onToggle,
  variant = 'hero',
}: ThemeToggleButtonProps) {
  return (
    <IconButton
      variant={variant}
      label={label}
      onPress={onToggle}
      renderIcon={(color, size) =>
        isDark ? (
          <Sun size={size} color={color} />
        ) : (
          <Moon size={size} color={color} />
        )
      }
    />
  );
}
