import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/hooks/useLanguage';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import type { useReports } from '@/hooks/useReports';
import { useWallets } from '@/hooks/useWallets';
import { queryTransactionsApi } from '@/services/api/transaction.service';
import { dateTimeFormat } from '@/utils/intl';
import { toIntlLocale } from '@/utils/locale';
import {
  reportFileBaseName,
  reportFileExtension,
  shareReport,
  type ExportDocument,
  type ReportExportFormat,
} from '@/utils/reportExport';

type ReportData = ReturnType<typeof useReports>;

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/**
 * Export Laporan (port `buildExportDocument` + `handleExport` ReportsPage web). Isi dokumen sama
 * dengan web: ringkasan, pengeluaran per kategori, dompet, top pengeluaran, daftar transaksi.
 * Daftar transaksi periode baru dimuat saat export (web memuatnya bersama halaman).
 */
export function useReportExport(report: ReportData, periodLabel: string) {
  const { t } = useTranslation();
  const showToast = useToast();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { format } = useMoneyFormat();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const [exportingFormat, setExportingFormat] =
    useState<ReportExportFormat | null>(null);

  const {
    resolvedPeriod,
    summary,
    categoryBreakdown,
    walletUsage,
    topSpending,
  } = report;

  const buildDocument = useCallback(async (): Promise<ExportDocument> => {
    const { transactions } = await queryTransactionsApi({
      dateFrom: resolvedPeriod.dateFrom,
      dateTo: resolvedPeriod.dateTo,
    });
    const formatDate = (iso: string) =>
      dateTimeFormat(locale, DATE_OPTIONS).format(new Date(iso));
    const percent = (value: number) => `${value.toFixed(0)}%`;

    return {
      title: t('nav.reports'),
      subtitle: `${periodLabel} (${resolvedPeriod.dateFrom} - ${resolvedPeriod.dateTo})`,
      sections: [
        {
          heading: t('reports.export.sections.summary'),
          columns: [
            t('reports.export.columns.metric'),
            t('reports.export.columns.value'),
            t('reports.export.columns.change'),
          ],
          rows: summary
            ? [
                [
                  t('reports.summary.totalIncome'),
                  format(summary.totalIncome.value),
                  percent(summary.totalIncome.changePercent),
                ],
                [
                  t('reports.summary.totalExpense'),
                  format(summary.totalExpense.value),
                  percent(summary.totalExpense.changePercent),
                ],
                [
                  t('reports.summary.netCashFlow'),
                  format(summary.netCashFlow.value),
                  percent(summary.netCashFlow.changePercent),
                ],
                [
                  t('reports.summary.transactionCount'),
                  summary.transactionCount.value,
                  percent(summary.transactionCount.changePercent),
                ],
              ]
            : [],
        },
        {
          heading: t('reports.expenseByCategory.title'),
          columns: [
            t('reports.export.columns.category'),
            t('reports.export.columns.total'),
            t('reports.export.columns.percentage'),
            t('reports.export.columns.transactions'),
          ],
          rows: categoryBreakdown.map(item => [
            item.nameCategory,
            format(item.amount),
            percent(item.percentage),
            item.transactionCount,
          ]),
        },
        {
          heading: t('reports.walletUsage.title'),
          columns: [
            t('reports.export.columns.wallet'),
            t('reports.export.columns.percentage'),
            t('reports.export.columns.transactions'),
          ],
          rows: walletUsage.map(item => [
            item.nameWallet,
            percent(item.percentage),
            item.transactionCount,
          ]),
        },
        {
          heading: t('reports.topSpending.title'),
          columns: [
            t('reports.export.columns.rank'),
            t('reports.export.columns.title'),
            t('reports.export.columns.category'),
            t('reports.export.columns.amount'),
            t('reports.export.columns.date'),
          ],
          rows: topSpending.map(item => [
            item.rank,
            item.title,
            item.subCategoryName
              ? `${item.categoryName} · ${item.subCategoryName}`
              : item.categoryName,
            format(item.amount),
            formatDate(item.date),
          ]),
        },
        {
          heading: t('reports.transactionList.title'),
          columns: [
            t('reports.export.columns.date'),
            t('reports.export.columns.title'),
            t('reports.export.columns.category'),
            t('reports.export.columns.wallet'),
            t('reports.export.columns.type'),
            t('reports.export.columns.amount'),
          ],
          rows: transactions
            .filter(item => item.type === 'income' || item.type === 'expense')
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map(item => {
              const category = categories.find(
                c => c.idCategory === item.idCategory,
              );
              const sub = category?.subCategories.find(
                s => s.idSubCategory === item.idSubCategory,
              );
              const wallet = wallets.find(w => w.idWallet === item.idWallet);
              return [
                formatDate(item.date),
                item.title || category?.nameCategory || '-',
                sub
                  ? `${category?.nameCategory ?? '-'} · ${sub.nameSubCategory}`
                  : category?.nameCategory ?? '-',
                wallet?.nameWallet ?? '-',
                item.type === 'income'
                  ? t('transaction.income')
                  : t('transaction.expense'),
                format(item.amount),
              ];
            }),
        },
      ],
    };
  }, [
    resolvedPeriod.dateFrom,
    resolvedPeriod.dateTo,
    periodLabel,
    summary,
    categoryBreakdown,
    walletUsage,
    topSpending,
    categories,
    wallets,
    format,
    locale,
    t,
  ]);

  const exportReport = useCallback(
    async (exportFormat: ReportExportFormat) => {
      setExportingFormat(exportFormat);
      try {
        const baseName = reportFileBaseName(
          resolvedPeriod.dateFrom,
          resolvedPeriod.dateTo,
        );
        const shared = await shareReport(
          exportFormat,
          baseName,
          await buildDocument(),
        );
        if (shared) {
          showToast(
            t('reports.export.success', {
              fileName: `${baseName}.${reportFileExtension(exportFormat)}`,
            }),
            'success',
          );
        }
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : t('reports.genericError'),
          'error',
        );
      } finally {
        setExportingFormat(null);
      }
    },
    [
      buildDocument,
      resolvedPeriod.dateFrom,
      resolvedPeriod.dateTo,
      showToast,
      t,
    ],
  );

  return { exportingFormat, exportReport };
}
