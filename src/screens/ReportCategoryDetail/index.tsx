import { useTranslation } from 'react-i18next';
import Reveal from '@/components/atoms/Reveal';
import CategoryBreakdownChart from '@/components/organisms/CategoryBreakdownChart';
import MainLayout from '@/components/templates/MainLayout';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import {
  OTHER_SUB_CATEGORY_ID,
  type CategorySlice,
} from '@/utils/categoryBreakdown';

/**
 * Rincian satu kategori dari Laporan: donut + tile subkategori dengan total kategori di tengah.
 * Pengganti drill-down di dalam kartu "Pengeluaran per kategori" (Dashboard tetap drill-down).
 * Data dibawa dari Laporan lewat params, jadi periodenya sama dengan yang sedang dibuka di sana.
 * Tap subkategori → Transaksi (route stack, back kembali ke sini) berfilter kategori, subkategori,
 * dan rentang periode laporan; "Lihat detail" di kepala kartu = kategori saja.
 */
export default function ReportCategoryDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.REPORT_CATEGORY_DETAIL>) {
  const { t } = useTranslation();
  const { category, subtitle, dateFrom, dateTo } = route.params;
  const name = category.name ?? t('dashboard.otherSubCategory');
  const subSlices = category.subSlices ?? [];

  // Tanpa `sub` = seluruh kategori ("Lihat detail").
  const openTransactions = (sub?: CategorySlice) =>
    navigation.push(ROUTES.REPORT_TRANSACTIONS, {
      requestId: Date.now(),
      type: 'expense',
      idCategory: category.id,
      // "Lainnya" = transaksi tanpa subkategori: sembunyikan semua subkategori bernama.
      ...(!sub
        ? {}
        : sub.id === OTHER_SUB_CATEGORY_ID
        ? {
            excludeSubCategoryIds: subSlices
              .filter(item => item.id !== OTHER_SUB_CATEGORY_ID)
              .map(item => item.id),
          }
        : { idSubCategory: sub.id }),
      dateFrom,
      dateTo,
    });

  return (
    <MainLayout
      title={name}
      subtitle={subtitle}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
    >
      <Reveal delay={80}>
        <CategoryBreakdownChart
          slices={subSlices}
          title={t('reports.categoryDetail.bySubCategory')}
          periodLabel={t('reports.eyebrow.category')}
          actionLabel={t('reports.categoryDetail.seeDetail')}
          onAction={() => openTransactions()}
          centerCaption={t('dashboard.totalOfCategory', { category: name })}
          emptyTitle={t('reports.topSpending.empty')}
          emptyVariant="inset"
          onSelectCategory={openTransactions}
        />
      </Reveal>
    </MainLayout>
  );
}
