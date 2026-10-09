import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  ArrowUpDown,
  CalendarClock,
  Check,
  ChevronDown,
  Copy,
  Trash2,
  TrendingUp,
  Type,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
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
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import InvestmentTargetSheet from '@/components/organisms/InvestmentTargetSheet';
import SelectCategorySheet from '@/components/organisms/SelectCategorySheet';
import SelectSubCategorySheet from '@/components/organisms/SelectSubCategorySheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  Category,
  SubCategory,
  Transaction,
  TransactionInput,
} from '@/types';
import { transitions } from '@/utils/motion';
import { formatDateTimeLabel } from '@/utils/txTime';

type FormType = 'income' | 'expense' | 'transfer';

const toFormType = (type?: Transaction['type']): FormType =>
  type === 'transfer' ? 'transfer' : type === 'income' ? 'income' : 'expense';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const useStyles = makeStyles(({ colors }) => ({
  section: { gap: spacing.sm },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  transfer: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swapRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  investRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  investRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  investTexts: { flex: 1, gap: 1 },
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
  footerButton: { flex: 1 },
}));

/**
 * Catat / edit transaksi (pen `C4Bk35`, transfer `DcLW7`, edit `z5FDD`) sebagai route modal
 * transparan. Perilaku = AddTransactionModal web.
 */
export default function TransactionFormScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.TRANSACTION_FORM>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const showToast = useToast();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const { instruments } = useInstruments();
  const { createMoneyIn } = useInvestmentTransactions();
  const { createTransaction, editTransaction, deleteTransaction } =
    useTransactions();
  const transaction = route.params?.transaction ?? null;
  const close = navigation.goBack;

  const [type, setType] = useState<FormType>(toFormType(transaction?.type));
  const [categoryId, setCategoryId] = useState(transaction?.idCategory ?? null);
  const [subCategoryId, setSubCategoryId] = useState(
    transaction?.idSubCategory ?? null,
  );
  const [amount, setAmount] = useState(transaction?.amount ?? 0);
  const [walletId, setWalletId] = useState(transaction?.idWallet ?? null);
  const [walletFromId, setWalletFromId] = useState(
    transaction?.idWalletFrom ?? null,
  );
  const [walletToId, setWalletToId] = useState(transaction?.idWalletTo ?? null);
  const [title, setTitle] = useState(transaction?.title ?? '');
  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [date, setDate] = useState(() =>
    transaction ? new Date(transaction.date) : new Date(),
  );
  const [busy, setBusy] = useState<'save' | 'duplicate' | 'delete' | null>(
    null,
  );
  const [isInvestment, setIsInvestment] = useState(false);
  const [instrumentId, setInstrumentId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<
    'category' | 'sub' | 'amount' | 'date' | 'investment' | 'delete' | null
  >(null);

  const selectedWalletId =
    walletId ??
    (wallets.find(w => w.isPrimary) ?? wallets[0])?.idWallet ??
    null;
  const category = categoryId
    ? categories.find(c => c.idCategory === categoryId) ?? null
    : null;
  const subCategory = subCategoryId
    ? category?.subCategories.find(s => s.idSubCategory === subCategoryId) ??
      null
    : null;
  const isTransfer = type === 'transfer';
  const fromWallet = wallets.find(w => w.idWallet === walletFromId);
  const toWallet = wallets.find(w => w.idWallet === walletToId);
  const instrument = instruments.find(i => i.idInstrument === instrumentId);
  const account = instrument?.investmentAccounts.find(
    a => a.idInvestmentAccount === accountId,
  );

  // Pilihan cepat: subkategori kategori terpilih, atau 6 acak dari tipe ini.
  const quickPicks = useMemo(() => {
    if (type === 'transfer') {
      return [];
    }
    if (category) {
      return category.subCategories.map(sub => ({ sub, parent: category }));
    }
    return shuffle(
      categories
        .filter(c => c.type === type)
        .flatMap(c => c.subCategories.map(sub => ({ sub, parent: c }))),
    ).slice(0, 6);
  }, [categories, type, category]);

  const changeType = (next: FormType) => {
    if (next === type) {
      return;
    }
    setType(next);
    setCategoryId(null);
    setSubCategoryId(null);
    setWalletFromId(null);
    setWalletToId(null);
    setIsInvestment(false);
    setInstrumentId(null);
    setAccountId(null);
  };

  const fail = (key: string) => {
    showToast(t(key), 'error');
    return null;
  };

  const buildInput = (): TransactionInput | null => {
    if (amount <= 0) {
      return fail('transaction.amountRequiredError');
    }
    if (isTransfer) {
      if (!walletFromId || !walletToId) {
        return fail('transaction.transferWalletRequiredError');
      }
      if (walletFromId === walletToId) {
        return fail('transaction.transferSameWalletError');
      }
      return {
        type: 'transfer',
        idWallet: null,
        idCategory: null,
        idSubCategory: null,
        idWalletFrom: walletFromId,
        idWalletTo: walletToId,
        title:
          title.trim() ||
          (fromWallet && toWallet
            ? t('transaction.transferTitleTemplate', {
                from: fromWallet.nameWallet,
                to: toWallet.nameWallet,
              })
            : t('transaction.transfer')),
        notes: notes.trim(),
        amount,
        date: date.toISOString(),
      };
    }
    if (!category) {
      return fail('transaction.categoryRequiredError');
    }
    if (!selectedWalletId) {
      return fail('transaction.walletRequiredError');
    }
    if (type === 'expense' && !transaction && isInvestment && !account) {
      return fail('investment.selectAccountRequiredError');
    }
    return {
      type,
      idWallet: selectedWalletId,
      idCategory: category.idCategory,
      idSubCategory: subCategory?.idSubCategory ?? null,
      idWalletFrom: null,
      idWalletTo: null,
      title: title.trim(),
      notes: notes.trim(),
      amount,
      date: date.toISOString(),
    };
  };

  const errorMessage = (error: unknown, key: string) =>
    error instanceof Error ? error.message : t(key);

  const save = async () => {
    const input = buildInput();
    if (!input) {
      return;
    }
    setBusy('save');
    try {
      if (transaction) {
        await editTransaction(transaction.idTransaction, input);
        showToast(t('transaction.updateSuccess'), 'success');
      } else {
        const created = await createTransaction(input);
        showToast(t('transaction.createSuccess'), 'success');
        if (type === 'expense' && isInvestment && instrument && account) {
          try {
            await createMoneyIn({
              idInstrument: instrument.idInstrument,
              idInvestmentAccount: account.idInvestmentAccount,
              amount: input.amount,
              date: input.date,
              idTransaction: created.idTransaction,
            });
          } catch (error) {
            showToast(
              errorMessage(
                error,
                'investment.moneyInFailedButTransactionSaved',
              ),
              'error',
            );
          }
        }
      }
      close();
    } catch (error) {
      showToast(errorMessage(error, 'transaction.genericError'), 'error');
      setBusy(null);
    }
  };

  const duplicate = async () => {
    const input = buildInput();
    if (!input) {
      return;
    }
    setBusy('duplicate');
    try {
      await createTransaction(input);
      showToast(t('transaction.duplicateSuccess'), 'success');
      close();
    } catch (error) {
      showToast(errorMessage(error, 'transaction.genericError'), 'error');
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!transaction) {
      return;
    }
    setBusy('delete');
    try {
      await deleteTransaction(transaction.idTransaction);
      showToast(t('transaction.deleteSuccess'), 'success');
      setSheet(null);
      close();
    } catch (error) {
      showToast(errorMessage(error, 'transaction.genericError'), 'error');
      setBusy(null);
      setSheet(null);
    }
  };

  const typeColor = {
    expense: colors.expenseText,
    income: colors.incomeText,
    transfer: colors.primaryText,
  }[type];

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t(
          transaction
            ? 'transaction.editTransaction'
            : 'transaction.addTransaction',
        )}
        subtitle={
          transaction
            ? t('transaction.recordedAt', {
                date: formatDateTimeLabel(
                  new Date(transaction.date),
                  i18n.language,
                ),
              })
            : undefined
        }
        headerActions={
          transaction && (
            <>
              <IconButton
                label={t('transaction.duplicateButton')}
                disabled={!!busy}
                onPress={duplicate}
                renderIcon={(color, size) => <Copy size={size} color={color} />}
              />
              <IconButton
                label={t('transaction.deleteButton')}
                disabled={!!busy}
                onPress={() => setSheet('delete')}
                renderIcon={(_, size) => (
                  <Trash2 size={size} color={colors.expenseText} />
                )}
              />
            </>
          )
        }
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={!!busy}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={
                transaction
                  ? t('transaction.saveChanges')
                  : isTransfer
                  ? t('transaction.saveTransfer')
                  : t('transaction.save')
              }
              renderIcon={color => <Check size={18} color={color} />}
              loading={busy === 'save'}
              disabled={!!busy}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        <SegmentedControl<FormType>
          value={type}
          onChange={changeType}
          activeColor={typeColor}
          options={[
            { value: 'expense', label: t('transaction.expense') },
            { value: 'income', label: t('transaction.income') },
            { value: 'transfer', label: t('transaction.transfer') },
          ]}
        />

        <AmountCard
          amount={amount}
          onPickAmount={() => setSheet('amount')}
          pickAmountLabel={t('transaction.amountTitle')}
          header={
            !isTransfer && (
              <CategoryPickerRow
                category={category}
                subCategory={subCategory}
                placeholder={t('transaction.selectCategoryPlaceholder')}
                onPress={() => setSheet('category')}
              />
            )
          }
        />

        <AnimatePresence exitBeforeEnter>
          {isTransfer ? (
            <MotiView
              key="transfer"
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0 }}
              transition={transitions.enter}
              style={styles.transfer}
            >
              <WalletChipGroup
                label={t('transaction.transferFrom')}
                wallets={wallets}
                selectedId={walletFromId}
                disabledId={walletToId}
                onSelect={setWalletFromId}
              />
              <View style={styles.swapRow}>
                <View style={styles.line} />
                <IconButton
                  size={32}
                  label={t('transaction.swapWallets')}
                  onPress={() => {
                    setWalletFromId(walletToId);
                    setWalletToId(walletFromId);
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
                selectedId={walletToId}
                disabledId={walletFromId}
                onSelect={setWalletToId}
              />
            </MotiView>
          ) : (
            quickPicks.length > 0 && (
              <MotiView
                key={`quick-${type}-${categoryId ?? 'all'}`}
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0 }}
                transition={transitions.enter}
                style={styles.section}
              >
                <Typography variant="fieldLabel" tone="muted">
                  {t('transaction.quickSubLabel')}
                </Typography>
                <View style={styles.quick}>
                  {quickPicks.map(({ sub, parent }) => (
                    <Chip
                      key={sub.idSubCategory}
                      label={sub.nameSubCategory}
                      suffix={category ? undefined : parent.nameCategory}
                      active={sub.idSubCategory === subCategoryId}
                      onPress={() => {
                        setCategoryId(parent.idCategory);
                        setSubCategoryId(sub.idSubCategory);
                      }}
                    />
                  ))}
                </View>
              </MotiView>
            )
          )}
        </AnimatePresence>

        <TextField
          variant="filled"
          label={t(
            isTransfer
              ? 'transaction.titleLabel'
              : 'transaction.titleLabelOptional',
          )}
          value={title}
          onChangeText={setTitle}
          autoCapitalize="sentences"
          placeholder={
            isTransfer && fromWallet && toWallet
              ? `${fromWallet.nameWallet} → ${toWallet.nameWallet}`
              : t('transaction.titlePlaceholder')
          }
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

        {!isTransfer && (
          <WalletChipGroup
            label={t('transaction.walletLabel')}
            wallets={wallets}
            selectedId={selectedWalletId}
            onSelect={setWalletId}
          />
        )}

        {type === 'expense' && !transaction && (
          <View style={styles.section}>
            <PressableScale
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isInvestment }}
              scaleTo={0.98}
              onPress={() => setIsInvestment(value => !value)}
              style={[styles.investRow, isInvestment && styles.investRowActive]}
            >
              <Checkbox checked={isInvestment} />
              <View style={styles.investTexts}>
                <Typography variant="label" numberOfLines={1}>
                  {t('transaction.markAsInvestment')}
                </Typography>
                <Typography variant="meta" tone="subtle" numberOfLines={1}>
                  {t('transaction.markAsInvestmentHint')}
                </Typography>
              </View>
              <TrendingUp size={18} color={colors.investmentText} />
            </PressableScale>
            {isInvestment && (
              <PressableScale
                accessibilityRole="button"
                scaleTo={0.98}
                onPress={() => setSheet('investment')}
                style={styles.targetButton}
              >
                {instrument && account ? (
                  <Monogram
                    name={instrument.nameInstrument}
                    color={instrument.color}
                    size={32}
                  />
                ) : (
                  <View style={styles.targetIcon}>
                    <TrendingUp size={16} color={colors.investmentText} />
                  </View>
                )}
                <Typography
                  tone={account ? 'default' : 'subtle'}
                  numberOfLines={1}
                  style={styles.targetLabel}
                >
                  {instrument && account
                    ? `${instrument.nameInstrument} · ${account.nameInvestmentAccount}`
                    : t('investment.selectAccountPlaceholder')}
                </Typography>
                <ChevronDown size={18} color={colors.text3} />
              </PressableScale>
            )}
          </View>
        )}
      </SheetLayout>

      <SelectCategorySheet
        visible={sheet === 'category'}
        type={isTransfer ? 'expense' : type}
        categories={categories}
        selectedId={categoryId}
        onClose={() => setSheet(null)}
        onSelect={(selected: Category) => {
          setCategoryId(selected.idCategory);
          setSubCategoryId(null);
          setSheet(selected.subCategories.length > 0 ? 'sub' : null);
        }}
      />
      <SelectSubCategorySheet
        visible={sheet === 'sub'}
        category={category}
        selectedId={subCategoryId}
        onBack={() => setSheet('category')}
        onClose={() => setSheet(null)}
        onSelect={(selected: SubCategory | null) => {
          setSubCategoryId(selected?.idSubCategory ?? null);
          setSheet(null);
        }}
      />
      <AmountCalculatorSheet
        visible={sheet === 'amount'}
        amount={amount}
        wallets={isTransfer ? [] : wallets}
        selectedWalletId={isTransfer ? null : selectedWalletId}
        onSelectWallet={setWalletId}
        onClose={() => setSheet(null)}
        onConfirm={setAmount}
      />
      <DateTimePickerSheet
        visible={sheet === 'date'}
        value={date}
        onClose={() => setSheet(null)}
        onConfirm={setDate}
      />
      <InvestmentTargetSheet
        visible={sheet === 'investment'}
        instruments={instruments}
        idInstrument={instrumentId}
        idInvestmentAccount={accountId}
        onClose={() => setSheet(null)}
        onConfirm={(pickedInstrument, pickedAccount) => {
          setInstrumentId(pickedInstrument.idInstrument);
          setAccountId(pickedAccount.idInvestmentAccount);
        }}
      />
      <ConfirmDialog
        visible={sheet === 'delete'}
        tone="danger"
        renderIcon={color => <Trash2 size={24} color={color} />}
        title={t('transaction.deleteConfirmTitle')}
        message={t('transaction.deleteConfirmDescription')}
        confirmLabel={t('transaction.deleteConfirmAction')}
        cancelLabel={t('common.cancel')}
        loading={busy === 'delete'}
        onConfirm={remove}
        onCancel={() => setSheet(null)}
      />
    </>
  );
}
