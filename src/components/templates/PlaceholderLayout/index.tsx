import type { ReactNode } from 'react';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import MainLayout, {
  type MainLayoutProps,
} from '@/components/templates/MainLayout';

export interface PlaceholderLayoutProps
  extends Omit<MainLayoutProps, 'children'> {
  icon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  /** Konten tambahan di bawah empty state. */
  children?: ReactNode;
}

/** Kerangka layar yang fiturnya belum di-port dari web. Ganti dengan isi asli saat di-port. */
export default function PlaceholderLayout({
  icon,
  emptyTitle,
  emptyDescription,
  children,
  ...layoutProps
}: PlaceholderLayoutProps) {
  return (
    <MainLayout {...layoutProps}>
      <Card>
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
      {children}
    </MainLayout>
  );
}
