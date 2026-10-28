import { ActivityIndicator, View } from 'react-native';
import {
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Lock,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import BottomSheet from '@/components/organisms/BottomSheet';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorTokens } from '@/theme/colors';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { ReportExportFormat } from '@/utils/reportExport';

const FORMATS: {
  format: ReportExportFormat;
  Icon: typeof FileText;
  tile: (colors: ColorTokens) => { bg: string; fg: string };
}[] = [
  {
    format: 'pdf',
    Icon: FileText,
    tile: c => ({ bg: c.expenseSoft, fg: c.expenseText }),
  },
  {
    format: 'excel',
    Icon: FileSpreadsheet,
    tile: c => ({ bg: c.incomeSoft, fg: c.incomeText }),
  },
  {
    format: 'csv',
    Icon: FileCode2,
    tile: c => ({ bg: c.primarySoft, fg: c.primaryText }),
  },
];

const useStyles = makeStyles(({ colors }) => ({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: 12,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
  },
  tile: {
    width: 38,
    height: 38,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
  disabled: { opacity: 0.6 },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
}));

export interface ReportExportSheetProps {
  visible: boolean;
  /** Format yang sedang dibuat (spinner di barisnya, baris lain nonaktif). */
  exportingFormat: ReportExportFormat | null;
  onExport: (format: ReportExportFormat) => void;
  onClose: () => void;
  /** Format di luar paket: diberi tag Pro, tetap bisa ditekan (layar membuka Upgrade). */
  lockedFormats?: ReportExportFormat[];
}

/** Export laporan (pen `MVyzc`, sama dengan menu Export web): PDF / Excel / CSV periode aktif. */
export default function ReportExportSheet({
  visible,
  exportingFormat,
  onExport,
  onClose,
  lockedFormats = [],
}: ReportExportSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isExporting = exportingFormat !== null;

  return (
    <BottomSheet
      visible={visible}
      title={t('reports.export.title')}
      closeLabel={t('common.close')}
      onClose={onClose}
      scroll={false}
    >
      <View style={styles.list}>
        {FORMATS.map(({ format, Icon, tile }) => {
          const { bg, fg } = tile(colors);
          return (
            <PressableScale
              key={format}
              accessibilityRole="button"
              accessibilityState={{
                disabled: isExporting,
                busy: exportingFormat === format,
              }}
              disabled={isExporting}
              scaleTo={0.98}
              onPress={() => onExport(format)}
              style={[
                styles.row,
                isExporting && exportingFormat !== format && styles.disabled,
              ]}
            >
              <View style={[styles.tile, { backgroundColor: bg }]}>
                <Icon size={18} color={fg} />
              </View>
              <View style={styles.text}>
                <Typography variant="label" numberOfLines={1}>
                  {t(`reports.export.${format}`)}
                </Typography>
                <Typography variant="meta" tone="subtle" numberOfLines={1}>
                  {t(`reports.export.${format}Description`)}
                </Typography>
              </View>
              {lockedFormats.includes(format) ? (
                <View style={styles.proTag}>
                  <Lock size={12} color={colors.primaryText} />
                  <Typography variant="badge" tone="primary">
                    {t('plan.proBadge')}
                  </Typography>
                </View>
              ) : exportingFormat === format ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Download size={18} color={colors.text3} />
              )}
            </PressableScale>
          );
        })}
      </View>
    </BottomSheet>
  );
}
