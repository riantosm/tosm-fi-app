import type { ReactNode } from 'react';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import MainLayout, {
  type MainLayoutProps,
} from '@/components/templates/MainLayout';

export interface PlaceholderLayoutProps
  extends Omit<MainLayoutProps, 'children'> {
  /** Render ikon (ukuran 32) dengan warna primaryText. */
  renderIcon: (color: string) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  /** Konten tambahan di bawah empty state. */
  children?: ReactNode;
}

/** Kerangka layar yang fiturnya belum di-port dari web. Ganti dengan isi asli saat di-port. */
export default function PlaceholderLayout({
  renderIcon,
  emptyTitle,
  emptyDescription,
  children,
  ...layoutProps
}: PlaceholderLayoutProps) {
  const { colors } = useTheme();
  return (
    <MainLayout {...layoutProps}>
      <Card>
        <EmptyState
          icon={renderIcon(colors.primaryText)}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
      {children}
    </MainLayout>
  );
}
