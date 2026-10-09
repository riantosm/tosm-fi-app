import { Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Pencil,
  Scale,
  Tag,
  TrendingUpDown,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import TxRow, { type TxAmountTone } from '@/components/molecules/TxRow';
import { useInvestmentLabels } from '@/components/organisms/InvestmentTransactionList';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Tone } from '@/theme/tones';
import type {
  AssistantDraft,
  AssistantMessage,
  Category,
  Instrument,
  WalletAccount,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { MINUS } from '@/utils/money';
import { formatTxTime } from '@/utils/txTime';
import { dateTimeFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

type PreviewMessage = Extract<AssistantMessage, { kind: 'preview' }>;

const useStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    alignSelf: 'stretch',
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  cardError: { borderColor: colors.expense },
  replaced: { opacity: 0.7 },
  head: { gap: 2 },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.field,
    backgroundColor: colors.expenseSoft,
  },
  alertTexts: { flex: 1, gap: 2 },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 2,
  },
  rows: { gap: spacing.xs },
  row: { borderRadius: radius.control },
  rowChanged: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: colors.primarySoft,
  },
  rowError: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: colors.expense,
    backgroundColor: colors.expenseSoft,
  },
  indent: { paddingLeft: 56 },
  note: { paddingLeft: 56, paddingBottom: 6 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 56,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  rowErrorText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 56,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: { flex: 1 },
  totalValue: { fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.control,
  },
  statusSaved: { backgroundColor: colors.incomeSoft },
  statusMuted: { backgroundColor: colors.surface2 },
}));

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Efek bertanda draft ke dompet user (total "netto dompet"). Transfer hanya memindahkan uang;
 * gerakan investasi dihitung dari sisi dompetnya saja; update nilai tidak menyentuh dompet.
 */
function signedAmount(draft: AssistantDraft): number {
  switch (draft.kind) {
    case 'income':
      return draft.amount;
    case 'investmentOut':
      return draft.idWallet ? draft.amount : 0;
    case 'expense':
    case 'investmentIn':
      return -draft.amount;
    case 'correction':
      return (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0);
    default:
      return 0;
  }
}

/** Nominal yang tampil di baris: sudut pandang ledger untuk baris investasi (top up +, tarik −). */
function rowAmount(draft: AssistantDraft): number | null {
  switch (draft.kind) {
    case 'investmentIn':
      return draft.amount;
    case 'investmentOut':
      return -draft.amount;
    case 'investmentPl':
      return (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0);
    case 'transfer':
    case 'investmentTransfer':
      return null;
    default:
      return signedAmount(draft);
  }
}

function formatDay(iso: string, locale: string): string {
  try {
    return dateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toDateString();
  }
}

export interface AssistantPreviewCardProps {
  message: PreviewMessage;
  /** Draft pratinjau sebelumnya (yang direvisi), untuk chip "lama → baru". */
  previousDrafts?: AssistantDraft[];
  wallets: WalletAccount[];
  categories: Category[];
  instruments: Instrument[];
  onSave: () => void;
  onCancel: () => void;
}

/** Pratinjau Catat cepat (pen V2/PreviewCard): draft per hari, total, Simpan/Batal + status akhirnya. */
export default function AssistantPreviewCard({
  message,
  previousDrafts,
  wallets,
  categories,
  instruments,
  onSave,
  onCancel,
}: AssistantPreviewCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  // Pen menampilkan angka tanpa simbol mata uang di kartu pratinjau ("−12.000").
  const { formatNumber: format } = useMoneyFormat();
  const resolveLabels = useInvestmentLabels(instruments);
  const locale = toIntlLocale(language);

  const walletOf = (id: string | null) =>
    wallets.find(wallet => wallet.idWallet === id);
  const walletName = (id: string | null) => walletOf(id)?.nameWallet ?? '-';
  const categoryOf = (id: string | null) =>
    categories.find(category => category.idCategory === id);
  const categoryLabel = (draft: AssistantDraft) => {
    const category = categoryOf(draft.idCategory);
    const sub = category?.subCategories.find(
      item => item.idSubCategory === draft.idSubCategory,
    );
    return sub
      ? `${category?.nameCategory} › ${sub.nameSubCategory}`
      : category?.nameCategory;
  };
  const accountOf = (idInstrument: string | null, idAccount: string | null) =>
    idInstrument
      ? resolveLabels(idInstrument, idAccount)
      : { instrumentName: '-', accountName: null };
  const signed = (value: number) =>
    `${value > 0 ? '+' : value < 0 ? MINUS : ''}${format(Math.abs(value))}`;
  const toneOf = (value: number): TxAmountTone =>
    value > 0 ? 'income' : value < 0 ? 'expense' : 'neutral';

  const { drafts, status } = message;
  const errorCount = drafts.filter(draft => draft.error).length;
  const isPending = status === 'pending' || status === 'saving';

  const now = new Date();
  const today = dayKey(now.toISOString());
  now.setDate(now.getDate() - 1);
  const yesterday = dayKey(now.toISOString());
  const groups: { key: string; label: string; items: AssistantDraft[] }[] = [];
  for (const draft of [...drafts].sort((a, b) =>
    b.date.localeCompare(a.date),
  )) {
    const key = dayKey(draft.date);
    let group = groups.find(item => item.key === key);
    if (!group) {
      const label =
        key === today
          ? t('assistant.today')
          : key === yesterday
          ? t('assistant.yesterday')
          : formatDay(draft.date, locale);
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(draft);
  }

  const total = drafts.reduce((sum, draft) => sum + signedAmount(draft), 0);
  const kinds = new Set(drafts.map(draft => draft.kind));
  const totalLabel =
    kinds.size > 1
      ? t('assistant.netWallet', { count: drafts.length })
      : t('assistant.transactionCount', { count: drafts.length });

  function changeChips(draft: AssistantDraft): string[] {
    const before = previousDrafts?.find(item => item.idDraft === draft.idDraft);
    if (!before || !draft.changed?.length) {
      return [];
    }
    const chips: string[] = [];
    const changed = (field: string) => draft.changed?.includes(field);
    if (changed('amount')) {
      // Koreksi / update nilai direvisi lewat targetnya, bukan selisihnya.
      const hasTarget =
        draft.kind === 'correction' || draft.kind === 'investmentPl';
      const from = hasTarget ? before.balanceAfter ?? 0 : before.amount;
      const to = hasTarget ? draft.balanceAfter ?? 0 : draft.amount;
      chips.push(`${format(from)} → ${format(to)}`);
    }
    if (changed('wallet')) {
      const legs = (d: AssistantDraft) =>
        d.kind === 'transfer'
          ? `${walletName(d.idWalletFrom)} → ${walletName(d.idWalletTo)}`
          : walletName(d.idWallet);
      chips.push(`${legs(before)} → ${legs(draft)}`);
    }
    if (changed('category')) {
      chips.push(
        `${categoryLabel(before) ?? '-'} → ${categoryLabel(draft) ?? '-'}`,
      );
    }
    if (changed('account')) {
      const name = (d: AssistantDraft) =>
        accountOf(d.idInstrument, d.idInvestmentAccount).accountName ?? '-';
      chips.push(`${name(before)} → ${name(draft)}`);
    }
    if (changed('date')) {
      const day = (iso: string) => {
        try {
          return dateTimeFormat(locale, {
            day: 'numeric',
            month: 'short',
          }).format(new Date(iso));
        } catch {
          return iso.slice(0, 10);
        }
      };
      chips.push(`${day(before.date)} → ${day(draft.date)}`);
    }
    return chips;
  }

  function renderRow(draft: AssistantDraft) {
    const wallet = walletOf(draft.idWallet);
    const source = accountOf(draft.idInstrument, draft.idInvestmentAccount);
    const sourceLabel = [source.instrumentName, source.accountName]
      .filter(Boolean)
      .join(' · ');
    const shown = rowAmount(draft);
    let title = draft.title;
    let renderIcon: (color: string) => ReactNode;
    let color: string | undefined;
    let tone: Tone = 'neutral';
    let meta = '';
    let amountText = shown === null ? format(draft.amount) : signed(shown);
    let amountTone: TxAmountTone = shown === null ? 'neutral' : toneOf(shown);

    // Tampilan sama dengan daftar Transaksi dan ledger investasi.
    switch (draft.kind) {
      case 'income':
      case 'expense': {
        const category = categoryOf(draft.idCategory);
        const Icon = category ? resolveCategoryIcon(category.icon) : Tag;
        renderIcon = iconColor => <Icon size={18} color={iconColor} />;
        color = category?.color;
        tone = draft.kind;
        meta = [categoryLabel(draft), wallet?.nameWallet]
          .filter(Boolean)
          .join(' · ');
        break;
      }
      case 'transfer':
        renderIcon = iconColor => (
          <ArrowLeftRight size={18} color={iconColor} />
        );
        color = colors.txNeutral;
        meta = `${walletName(draft.idWalletFrom)} → ${walletName(
          draft.idWalletTo,
        )}`;
        break;
      case 'correction':
        renderIcon = iconColor => <Scale size={18} color={iconColor} />;
        tone = 'primary';
        meta = `${wallet?.nameWallet ?? '-'} · ${format(
          draft.balanceBefore ?? 0,
        )} → ${format(draft.balanceAfter ?? 0)}`;
        break;
      case 'investmentIn':
        renderIcon = iconColor => <ArrowDownLeft size={18} color={iconColor} />;
        tone = 'income';
        title = source.accountName
          ? t('investment.row.topUp', { account: source.accountName })
          : draft.title;
        meta = `${wallet?.nameWallet ?? '-'} → ${sourceLabel}`;
        break;
      case 'investmentOut':
        renderIcon = iconColor => <ArrowUpRight size={18} color={iconColor} />;
        tone = 'expense';
        title = wallet
          ? t('assistant.withdrawTo', { wallet: wallet.nameWallet })
          : source.accountName
          ? t('investment.row.withdraw', { account: source.accountName })
          : draft.title;
        meta = wallet ? `${sourceLabel} → ${wallet.nameWallet}` : sourceLabel;
        break;
      case 'investmentTransfer': {
        const destination = accountOf(
          draft.idInstrumentTo,
          draft.idInvestmentAccountTo,
        );
        renderIcon = iconColor => (
          <ArrowLeftRight size={18} color={iconColor} />
        );
        tone = 'primary';
        title = destination.accountName
          ? t('investment.row.transferTo', {
              account: destination.accountName,
            })
          : draft.title;
        meta = `${sourceLabel} → ${destination.accountName ?? '-'}`;
        amountText = format(draft.amount);
        amountTone = 'neutral';
        break;
      }
      case 'investmentPl':
      default:
        renderIcon = iconColor => (
          <TrendingUpDown size={18} color={iconColor} />
        );
        tone = 'investment';
        title = source.accountName
          ? t('investment.row.update', { account: source.accountName })
          : draft.title;
        meta = `${source.instrumentName} · ${format(
          draft.balanceBefore ?? 0,
        )} → ${format(draft.balanceAfter ?? 0)}`;
        break;
    }

    const chips = changeChips(draft);
    return (
      <View
        key={draft.idDraft}
        style={[
          styles.row,
          draft.error
            ? styles.rowError
            : chips.length > 0
            ? styles.rowChanged
            : undefined,
        ]}
      >
        <TxRow
          renderIcon={renderIcon}
          color={color}
          tone={tone}
          title={title}
          meta={meta}
          amount={amountText}
          amountTone={amountTone}
          caption={formatTxTime(draft.date, language)}
        />
        {!!draft.notes && (
          <Typography
            variant="meta"
            tone="muted"
            numberOfLines={1}
            style={styles.note}
          >
            {t('assistant.noteLabel', { note: draft.notes })}
          </Typography>
        )}
        {chips.length > 0 && (
          <View style={styles.chips}>
            {chips.map(chip => (
              <View key={chip} style={styles.chip}>
                <Pencil size={11} color={colors.primaryText} />
                <Typography variant="badge" tone="primary" tabular>
                  {chip}
                </Typography>
              </View>
            ))}
          </View>
        )}
        {!!draft.error && (
          <View style={styles.rowErrorText}>
            <CircleAlert size={14} color={colors.expenseText} />
            <Typography
              variant="captionStrong"
              tone="expense"
              style={styles.totalLabel}
            >
              {draft.error}
            </Typography>
          </View>
        )}
      </View>
    );
  }

  const showErrors = errorCount > 0 && isPending;

  return (
    <View
      style={[
        styles.card,
        showErrors && styles.cardError,
        status === 'replaced' && styles.replaced,
      ]}
    >
      <View style={styles.head}>
        <Typography variant="eyebrow" tone="subtle">
          {t('assistant.previewEyebrow')}
        </Typography>
        <Typography variant="cardTitle">
          {t('assistant.previewTitle')}
        </Typography>
      </View>

      {showErrors && (
        <View style={styles.alert}>
          <CircleAlert size={16} color={colors.expenseText} />
          <View style={styles.alertTexts}>
            <Typography variant="label" tone="expense">
              {t('assistant.validationTitle')}
            </Typography>
            <Typography variant="secondary" tone="muted">
              {t('assistant.validationBody', { count: errorCount })}
            </Typography>
          </View>
        </View>
      )}

      {groups.map(group => {
        const dayTotal = group.items.reduce(
          (sum, draft) => sum + signedAmount(draft),
          0,
        );
        return (
          <Fragment key={group.key}>
            <View style={styles.dayHead}>
              <Typography variant="eyebrow" tone="subtle">
                {group.label}
              </Typography>
              <Typography variant="caption" tone="subtle" tabular>
                {signed(dayTotal)}
              </Typography>
            </View>
            <View style={styles.rows}>{group.items.map(renderRow)}</View>
          </Fragment>
        );
      })}

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Typography
            variant="secondary"
            tone="muted"
            numberOfLines={1}
            style={styles.totalLabel}
          >
            {totalLabel}
          </Typography>
          <Typography
            variant="num"
            tabular
            tone={
              toneOf(total) === 'income'
                ? 'income'
                : toneOf(total) === 'expense'
                ? 'expense'
                : 'default'
            }
            style={styles.totalValue}
          >
            {signed(total)}
          </Typography>
        </View>

        {isPending && (
          <>
            <View style={styles.actions}>
              <Button
                variant="outline"
                size="md"
                label={t('assistant.cancel')}
                disabled={status === 'saving'}
                onPress={onCancel}
                style={styles.action}
                renderIcon={iconColor => <X size={16} color={iconColor} />}
              />
              <Button
                size="md"
                label={
                  status === 'saving'
                    ? t('assistant.saving')
                    : t('assistant.save')
                }
                loading={status === 'saving'}
                disabled={errorCount > 0}
                onPress={onSave}
                style={styles.action}
                renderIcon={iconColor => <Check size={16} color={iconColor} />}
              />
            </View>
            <Typography variant="caption" tone="subtle" align="center">
              {errorCount > 0
                ? t('assistant.validationHint')
                : t('assistant.typeToSave')}
            </Typography>
          </>
        )}

        {status === 'saved' && (
          <StatusPill
            style={styles.statusSaved}
            color={colors.incomeText}
            renderIcon={iconColor => (
              <CircleCheck size={16} color={iconColor} />
            )}
            label={t('assistant.saved', {
              time: formatTxTime(
                message.savedAt ?? new Date().toISOString(),
                language,
              ),
            })}
          />
        )}
        {status === 'cancelled' && (
          <StatusPill
            style={styles.statusMuted}
            color={colors.text3}
            renderIcon={iconColor => <CircleX size={16} color={iconColor} />}
            label={t('assistant.cancelledStatus')}
          />
        )}
        {status === 'replaced' && (
          <StatusPill
            style={styles.statusMuted}
            color={colors.text3}
            renderIcon={iconColor => <ArrowDown size={16} color={iconColor} />}
            label={t('assistant.previewReplaced')}
          />
        )}
      </View>
    </View>
  );
}

function StatusPill({
  label,
  color,
  renderIcon,
  style,
}: {
  label: string;
  color: string;
  renderIcon: (color: string) => ReactNode;
  style: object;
}) {
  const styles = useStyles();
  return (
    <Reveal variant="fade" style={[styles.status, style]}>
      {renderIcon(color)}
      <Typography variant="fieldLabel" style={{ color }}>
        {label}
      </Typography>
    </Reveal>
  );
}
