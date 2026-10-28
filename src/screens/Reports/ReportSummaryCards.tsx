import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  Minus,
  ReceiptText,
  Scale,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import type { ColorTokens } from '@/theme/colors';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { ReportMetricDelta, ReportSummary } from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { numberFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

/** Naiknya metrik ini kabar baik (hijau), buruk (merah), atau netral. */
type Polarity = 'upGood' | 'upBad' | 'neutral';
type DeltaTone = 'good' | 'bad' | 'neutral';

interface CardConfig {
  key: keyof ReportSummary;
  renderIcon: (color: string) => ReactNode;
  tone: (colors: ColorTokens) => { bg: string; fg: string };
  polarity: Polarity;
  isMoney: boolean;
}

const CARDS: CardConfig[] = [
  {
    key: 'totalIncome',
    renderIcon: color => <ArrowDownLeft size={13} color={color} />,
    tone: colors => ({ bg: colors.incomeSoft, fg: colors.incomeText }),
    polarity: 'upGood',
    isMoney: true,
  },
  {
    key: 'totalExpense',
    renderIcon: color => <ArrowUpRight size={13} color={color} />,
    tone: colors => ({ bg: colors.expenseSoft, fg: colors.expenseText }),
    polarity: 'upBad',
    isMoney: true,
  },
  {
    key: 'netCashFlow',
    renderIcon: color => <Scale size={13} color={color} />,
    tone: colors => ({ bg: colors.primarySoft, fg: colors.primaryText }),
    polarity: 'upGood',
    isMoney: true,
  },
  {
    key: 'transactionCount',
    renderIcon: color => <ReceiptText size={13} color={color} />,
    tone: colors => ({ bg: colors.investmentSoft, fg: colors.investmentText }),
    polarity: 'neutral',
    isMoney: false,
  },
];

const useStyles = makeStyles(({ colors }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '47%', flexGrow: 1 },
  card: { padding: 14, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tile: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  value: { fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  body: { gap: spacing.sm },
  skeletons: { gap: 10, paddingVertical: 2 },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  good: { backgroundColor: colors.incomeSoft },
  bad: { backgroundColor: colors.expenseSoft },
  neutral: { backgroundColor: colors.surface2 },
}));

function resolveTone(changePercent: number, polarity: Polarity): DeltaTone {
  if (changePercent === 0 || polarity === 'neutral') {
    return 'neutral';
  }
  return changePercent > 0 === (polarity === 'upGood') ? 'good' : 'bad';
}

function DeltaChip({
  delta,
  polarity,
}: {
  delta: ReportMetricDelta;
  polarity: Polarity;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const tone = resolveTone(delta.changePercent, polarity);
  const color =
    tone === 'good'
      ? colors.incomeText
      : tone === 'bad'
      ? colors.expenseText
      : colors.text2;
  const Icon =
    delta.changePercent > 0
      ? ArrowUp
      : delta.changePercent < 0
      ? ArrowDown
      : Minus;
  let percent = String(Math.abs(Math.round(delta.changePercent * 10) / 10));
  try {
    percent = numberFormat(toIntlLocale(language), {
      maximumFractionDigits: 1,
    }).format(Math.abs(delta.changePercent));
  } catch {
    // Intl tidak tersedia → pakai angka bulat di atas.
  }

  return (
    <View style={[styles.chip, styles[tone]]}>
      <Icon size={10} color={color} />
      <Typography variant="badge" tabular style={{ color }}>
        {percent}%
      </Typography>
    </View>
  );
}

export interface ReportSummaryCardsProps {
  summary: ReportSummary | null;
  isLoading: boolean;
  /** Chip perbandingan vs periode lalu khusus Pro. */
  showComparison?: boolean;
}

/** Grid 2 × 2: pemasukan, pengeluaran, saldo bersih, jumlah transaksi + perubahan vs periode lalu. */
export default function ReportSummaryCards({
  summary,
  isLoading,
  showComparison = true,
}: ReportSummaryCardsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatCompact } = useMoneyFormat();
  const showSkeleton = !summary || isLoading;

  return (
    <View style={styles.grid}>
      {CARDS.map((config, index) => {
        const tone = config.tone(colors);
        const delta = summary?.[config.key];
        return (
          <Reveal delay={index * 50} key={config.key} style={styles.cell}>
            <Card style={styles.card}>
              <View style={styles.head}>
                <View style={[styles.tile, { backgroundColor: tone.bg }]}>
                  {config.renderIcon(tone.fg)}
                </View>
                <Typography
                  variant="caption"
                  tone="muted"
                  numberOfLines={1}
                  style={styles.label}
                >
                  {t(`reports.summaryShort.${config.key}`)}
                </Typography>
              </View>
              {showSkeleton || !delta ? (
                <View style={styles.skeletons}>
                  <Skeleton width="75%" height={20} radius={8} />
                  <Skeleton width="45%" height={12} radius={6} />
                </View>
              ) : (
                <Reveal
                  variant="fade"
                  key={`${config.key}-${delta.value}`}
                  style={styles.body}
                >
                  <Typography
                    variant="amount"
                    tabular
                    numberOfLines={1}
                    style={styles.value}
                  >
                    {config.isMoney
                      ? formatCompact(delta.value)
                      : Math.round(delta.value)}
                  </Typography>
                  {showComparison && (
                    <DeltaChip delta={delta} polarity={config.polarity} />
                  )}
                </Reveal>
              )}
            </Card>
          </Reveal>
        );
      })}
    </View>
  );
}
