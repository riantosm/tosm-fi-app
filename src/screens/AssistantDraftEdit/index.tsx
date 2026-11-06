import { useState } from 'react';
import { View } from 'react-native';
import {
  ArrowUpDown,
  CalendarClock,
  Check,
  ChevronDown,
  TrendingUp,
  Type,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import IconButton from '@/components/atoms/IconButton';
import Monogram from '@/components/atoms/Monogram';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import AmountCard from '@/components/molecules/AmountCard';
import CategoryPickerRow from '@/components/molecules/CategoryPickerRow';
import PickerField from '@/components/molecules/PickerField';
import SegmentedControl from '@/components/molecules/SegmentedControl';
import TextField from '@/components/molecules/TextField';
import WalletChipGroup from '@/components/molecules/WalletChipGroup';
import AmountCalculatorSheet from '@/components/organisms/AmountCalculatorSheet';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import InvestmentTargetSheet from '@/components/organisms/InvestmentTargetSheet';
import SelectCategorySheet from '@/components/organisms/SelectCategorySheet';
import SelectSubCategorySheet from '@/components/organisms/SelectSubCategorySheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useAssistantChatContext } from '@/contexts/AssistantChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  AssistantDraft,
  AssistantDraftKind,
  Category,
  SubCategory,
} from '@/types';
import { formatDateTimeLabel } from '@/utils/txTime';

type SwitchableKind = 'expense' | 'income' | 'transfer';

const SWITCHABLE: AssistantDraftKind[] = ['expense', 'income', 'transfer'];

type SheetName =
  | 'category'
  | 'sub'
  | 'amount'
  | 'date'
  | 'account'
  | 'accountTo'
  | null;

const useStyles = makeStyles(({ colors }) => ({
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  transfer: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swapRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  targetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  targetIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.investmentSoft,
  },
  targetLabel: { flex: 1 },
  hint: { marginTop: -spacing.sm },
  footerButton: { flex: 1 },
}));

/**
 * Ubah manual satu baris pratinjau Catat cepat (sheet transparan di atas QuickAdd). Tidak
 * menyimpan apa pun: draft hasil edit dikembalikan ke pratinjau, lalu Simpan menyimpan batch
 * seperti biasa. Setara AssistantDraftEditModal di web.
 */
export default function AssistantDraftEditScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.ASSISTANT_DRAFT_EDIT>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const { format } = useMoneyFormat();
  const chat = useAssistantChatContext();
  const { wallets, categories, instruments } = chat;
  const { previewId, draft } = route.params;
  const close = navigation.goBack;

  const [kind, setKind] = useState<AssistantDraftKind>(draft.kind);
  const [title, setTitle] = useState(draft.title);
  const [notes, setNotes] = useState(draft.notes);
  const [amount, setAmount] = useState(draft.amount);
  const [target, setTarget] = useState(draft.balanceAfter ?? 0);
  const [date, setDate] = useState(() => new Date(draft.date));
  const [idWallet, setIdWallet] = useState(draft.idWallet);
  const [idWalletFrom, setIdWalletFrom] = useState(draft.idWalletFrom);
  const [idWalletTo, setIdWalletTo] = useState(draft.idWalletTo);
  const [idCategory, setIdCategory] = useState(draft.idCategory);
  const [idSubCategory, setIdSubCategory] = useState(draft.idSubCategory);
  const [idInstrument, setIdInstrument] = useState(draft.idInstrument);
  const [idAccount, setIdAccount] = useState(draft.idInvestmentAccount);
  const [idInstrumentTo, setIdInstrumentTo] = useState(draft.idInstrumentTo);
  const [idAccountTo, setIdAccountTo] = useState(draft.idInvestmentAccountTo);
  const [sheet, setSheet] = useState<SheetName>(null);

  const isSwitchable = SWITCHABLE.includes(draft.kind);
  const isInvestment = kind.startsWith('investment');
  const hasTarget = kind === 'correction' || kind === 'investmentPl';
  /** Tipe kategori yang dibutuhkan transaksi dompet jenis ini (kalau ada). */
  const categoryType: 'income' | 'expense' | null =
    kind === 'income' || kind === 'expense'
      ? kind
      : kind === 'investmentIn'
      ? 'expense'
      : kind === 'investmentOut' && idWallet
      ? 'income'
      : null;

  const category = categories.find(c => c.idCategory === idCategory) ?? null;
  const subCategory =
    category?.subCategories.find(s => s.idSubCategory === idSubCategory) ??
    null;
  const wallet = wallets.find(w => w.idWallet === idWallet);
  const findAccount = (
    instrumentId: string | null,
    accountId: string | null,
  ) => {
    const instrument = instruments.find(i => i.idInstrument === instrumentId);
    const account = instrument?.investmentAccounts.find(
      a => a.idInvestmentAccount === accountId,
    );
    return instrument && account ? { instrument, account } : null;
  };
  const source = findAccount(idInstrument, idAccount);
  const destination = findAccount(idInstrumentTo, idAccountTo);

  const changeKind = (next: SwitchableKind) => {
    if (next === kind) {
      return;
    }
    setKind(next);
    // Kategori tipe lain tidak cocok lagi.
    if (category && category.type !== next) {
      setIdCategory(null);
      setIdSubCategory(null);
    }
    if (next === 'transfer') {
      setIdWalletFrom(from => from ?? idWallet);
    } else if (kind === 'transfer') {
      setIdWallet(current => current ?? idWalletFrom);
    }
  };

  const fail = (message: string) => {
    showToast(message, 'error');
    return null;
  };

  const build = (): AssistantDraft | null => {
    if (!hasTarget && amount <= 0) {
      return fail(t('transaction.amountRequiredError'));
    }
    if (isInvestment && !source) {
      return fail(t('investment.selectAccountRequiredError'));
    }

    const next: AssistantDraft = {
      ...draft,
      kind,
      title: title.trim(),
      notes: notes.trim(),
      amount,
      date: date.toISOString(),
      idWallet: null,
      idCategory: null,
      idSubCategory: null,
      idWalletFrom: null,
      idWalletTo: null,
      idInstrument: isInvestment ? idInstrument : null,
      idInvestmentAccount: isInvestment ? idAccount : null,
      idInstrumentTo: null,
      idInvestmentAccountTo: null,
      balanceBefore: undefined,
      balanceAfter: undefined,
      changed: undefined,
      error: undefined,
      missing: undefined,
    };
    const sourceValue = source?.account.currentValue ?? 0;

    switch (kind) {
      case 'transfer':
        if (!idWalletFrom || !idWalletTo) {
          return fail(t('transaction.transferWalletRequiredError'));
        }
        if (idWalletFrom === idWalletTo) {
          return fail(t('transaction.transferSameWalletError'));
        }
        next.idWalletFrom = idWalletFrom;
        next.idWalletTo = idWalletTo;
        break;
      case 'correction':
        if (!wallet) {
          return fail(t('transaction.walletRequiredError'));
        }
        if (target === wallet.balance) {
          return fail(
            t('assistant.editBalanceUnchanged', {
              amount: format(wallet.balance),
            }),
          );
        }
        next.idWallet = wallet.idWallet;
        next.balanceBefore = wallet.balance;
        next.balanceAfter = target;
        next.amount = Math.abs(target - wallet.balance);
        break;
      case 'investmentPl':
        if (target < 0) {
          return fail(t('assistant.editNegativeValue'));
        }
        if (target === sourceValue) {
          return fail(
            t('assistant.editValueUnchanged', { amount: format(sourceValue) }),
          );
        }
        next.balanceBefore = sourceValue;
        next.balanceAfter = target;
        next.amount = Math.abs(target - sourceValue);
        break;
      case 'investmentTransfer':
        if (!destination) {
          return fail(t('investment.selectAccountRequiredError'));
        }
        if (idAccountTo === idAccount) {
          return fail(t('assistant.editSameAccount'));
        }
        if (amount > sourceValue) {
          return fail(
            t('assistant.editOverAccount', { amount: format(sourceValue) }),
          );
        }
        next.idInstrumentTo = idInstrumentTo;
        next.idInvestmentAccountTo = idAccountTo;
        break;
      case 'investmentOut':
        if (amount > sourceValue) {
          return fail(
            t('assistant.editOverAccount', { amount: format(sourceValue) }),
          );
        }
        next.idWallet = idWallet;
        break;
      default:
        // income, expense, investmentIn: dompet wajib.
        if (!idWallet) {
          return fail(t('transaction.walletRequiredError'));
        }
        next.idWallet = idWallet;
    }

    if (categoryType) {
      if (!category || category.type !== categoryType) {
        return fail(t('transaction.categoryRequiredError'));
      }
      next.idCategory = category.idCategory;
      next.idSubCategory = subCategory?.idSubCategory ?? null;
    }
    return next;
  };

  const apply = () => {
    const next = build();
    if (!next) {
      return;
    }
    chat.updateDraft(previewId, next);
    close();
  };

  const accountButton = (
    label: string,
    picked: ReturnType<typeof findAccount>,
    onPress: () => void,
  ) => (
    <View style={styles.section}>
      <Typography variant="fieldLabel" tone="muted">
        {label}
      </Typography>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        scaleTo={0.98}
        onPress={onPress}
        style={styles.targetButton}
      >
        {picked ? (
          <Monogram
            name={picked.instrument.nameInstrument}
            color={picked.instrument.color}
            size={32}
          />
        ) : (
          <View style={styles.targetIcon}>
            <TrendingUp size={16} color={colors.investmentText} />
          </View>
        )}
        <Typography
          tone={picked ? 'default' : 'subtle'}
          numberOfLines={1}
          style={styles.targetLabel}
        >
          {picked
            ? `${picked.instrument.nameInstrument} · ${picked.account.nameInvestmentAccount}`
            : t('investment.selectAccountPlaceholder')}
        </Typography>
        <ChevronDown size={18} color={colors.text3} />
      </PressableScale>
    </View>
  );

  const currentHint =
    kind === 'correction' && wallet
      ? t('assistant.editCurrentBalance', { amount: format(wallet.balance) })
      : kind === 'investmentPl' && source
      ? t('assistant.editCurrentValue', {
          amount: format(source.account.currentValue),
        })
      : null;

  const typeColor = {
    expense: colors.expenseText,
    income: colors.incomeText,
    transfer: colors.primaryText,
  }[kind as SwitchableKind];

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t('assistant.editTitle')}
        subtitle={t('assistant.editSubtitle')}
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t('assistant.editApply')}
              renderIcon={color => <Check size={18} color={color} />}
              onPress={apply}
              style={styles.footerButton}
            />
          </>
        }
      >
        {isSwitchable && (
          <SegmentedControl<SwitchableKind>
            value={kind as SwitchableKind}
            onChange={changeKind}
            activeColor={typeColor}
            options={[
              { value: 'expense', label: t('transaction.expense') },
              { value: 'income', label: t('transaction.income') },
              { value: 'transfer', label: t('transaction.transfer') },
            ]}
          />
        )}

        {isInvestment &&
          accountButton(
            t(
              kind === 'investmentTransfer'
                ? 'assistant.editAccountFrom'
                : 'assistant.editAccount',
            ),
            source,
            () => setSheet('account'),
          )}

        {kind === 'investmentTransfer' &&
          accountButton(t('assistant.editAccountTo'), destination, () =>
            setSheet('accountTo'),
          )}

        <AmountCard
          amount={hasTarget ? target : amount}
          onPickAmount={() => setSheet('amount')}
          pickAmountLabel={t('transaction.amountTitle')}
          caption={
            kind === 'correction'
              ? t('assistant.editNewBalance')
              : kind === 'investmentPl'
              ? t('assistant.editNewValue')
              : undefined
          }
          header={
            categoryType && (
              <CategoryPickerRow
                category={category}
                subCategory={subCategory}
                placeholder={t('transaction.selectCategoryPlaceholder')}
                onPress={() => setSheet('category')}
              />
            )
          }
        />
        {!!currentHint && (
          <Typography variant="meta" tone="subtle" style={styles.hint}>
            {currentHint}
          </Typography>
        )}

        {kind === 'transfer' && (
          <View style={styles.transfer}>
            <WalletChipGroup
              label={t('transaction.transferFrom')}
              wallets={wallets}
              selectedId={idWalletFrom}
              disabledId={idWalletTo}
              onSelect={setIdWalletFrom}
            />
            <View style={styles.swapRow}>
              <View style={styles.line} />
              <IconButton
                size={32}
                label={t('transaction.swapWallets')}
                onPress={() => {
                  setIdWalletFrom(idWalletTo);
                  setIdWalletTo(idWalletFrom);
                }}
                renderIcon={(_, size) => (
                  <ArrowUpDown size={size - 2} color={colors.primaryText} />
                )}
                style={{ backgroundColor: colors.primarySoft }}
              />
              <View style={styles.line} />
            </View>
            <WalletChipGroup
              label={t('transaction.transferTo')}
              wallets={wallets}
              selectedId={idWalletTo}
              disabledId={idWalletFrom}
              onSelect={setIdWalletTo}
            />
          </View>
        )}

        {(kind === 'income' ||
          kind === 'expense' ||
          kind === 'correction' ||
          kind === 'investmentIn') && (
          <WalletChipGroup
            label={t(
              kind === 'investmentIn'
                ? 'assistant.editWalletFrom'
                : 'transaction.walletLabel',
            )}
            wallets={wallets}
            selectedId={idWallet}
            onSelect={setIdWallet}
          />
        )}

        {kind === 'investmentOut' && (
          <View style={styles.section}>
            <Typography variant="fieldLabel" tone="muted">
              {t('assistant.editWalletTo')}
            </Typography>
            <View style={styles.chips}>
              <Chip
                variant="outline"
                label={t('assistant.editNoWallet')}
                active={idWallet === null}
                onPress={() => {
                  setIdWallet(null);
                  setIdCategory(null);
                  setIdSubCategory(null);
                }}
              />
              {wallets.map(w => (
                <Chip
                  key={w.idWallet}
                  variant="outline"
                  dot={w.color}
                  label={w.nameWallet}
                  active={w.idWallet === idWallet}
                  onPress={() => setIdWallet(w.idWallet)}
                />
              ))}
            </View>
          </View>
        )}

        <TextField
          variant="filled"
          label={t('transaction.titleLabel')}
          value={title}
          onChangeText={setTitle}
          autoCapitalize="sentences"
          placeholder={t('transaction.titlePlaceholder')}
          renderLeadingIcon={color => <Type size={18} color={color} />}
        />

        <TextField
          variant="filled"
          label={t('transaction.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          autoCapitalize="sentences"
          placeholder={t('transaction.notesPlaceholder')}
          multiline
        />

        <PickerField
          label={t('transaction.dateTimeLabel')}
          value={formatDateTimeLabel(date, i18n.language, {
            today: t('transaction.today'),
            yesterday: t('transaction.yesterday'),
          })}
          renderIcon={color => <CalendarClock size={18} color={color} />}
          onPress={() => setSheet('date')}
        />
      </SheetLayout>

      {categoryType && (
        <>
          <SelectCategorySheet
            visible={sheet === 'category'}
            type={categoryType}
            categories={categories}
            selectedId={idCategory}
            onClose={() => setSheet(null)}
            onSelect={(selected: Category) => {
              setIdCategory(selected.idCategory);
              setIdSubCategory(null);
              setSheet(selected.subCategories.length > 0 ? 'sub' : null);
            }}
          />
          <SelectSubCategorySheet
            visible={sheet === 'sub'}
            category={category}
            selectedId={idSubCategory}
            onBack={() => setSheet('category')}
            onClose={() => setSheet(null)}
            onSelect={(selected: SubCategory | null) => {
              setIdSubCategory(selected?.idSubCategory ?? null);
              setSheet(null);
            }}
          />
        </>
      )}
      <AmountCalculatorSheet
        visible={sheet === 'amount'}
        amount={hasTarget ? target : amount}
        wallets={[]}
        selectedWalletId={null}
        onSelectWallet={() => {}}
        onClose={() => setSheet(null)}
        onConfirm={hasTarget ? setTarget : setAmount}
      />
      <DateTimePickerSheet
        visible={sheet === 'date'}
        value={date}
        onClose={() => setSheet(null)}
        onConfirm={setDate}
      />
      <InvestmentTargetSheet
        visible={sheet === 'account'}
        instruments={instruments}
        idInstrument={idInstrument}
        idInvestmentAccount={idAccount}
        excludeAccountId={
          kind === 'investmentTransfer' ? idAccountTo ?? undefined : undefined
        }
        onClose={() => setSheet(null)}
        onConfirm={(instrument, account) => {
          setIdInstrument(instrument.idInstrument);
          setIdAccount(account.idInvestmentAccount);
        }}
      />
      <InvestmentTargetSheet
        visible={sheet === 'accountTo'}
        instruments={instruments}
        idInstrument={idInstrumentTo}
        idInvestmentAccount={idAccountTo}
        excludeAccountId={idAccount ?? undefined}
        onClose={() => setSheet(null)}
        onConfirm={(instrument, account) => {
          setIdInstrumentTo(instrument.idInstrument);
          setIdAccountTo(account.idInvestmentAccount);
        }}
      />
    </>
  );
}
