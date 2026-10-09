import { useState } from 'react';
import { View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { ArrowUpRight, NotebookPen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import AmountField from '@/components/molecules/AmountField';
import CategoryPickerRow from '@/components/molecules/CategoryPickerRow';
import CheckboxRow from '@/components/molecules/CheckboxRow';
import InvestmentAccountSummary from '@/components/molecules/InvestmentAccountSummary';
import InvestmentDateTimeField from '@/components/organisms/InvestmentDateTimeField';
import TextField from '@/components/molecules/TextField';
import WalletChipGroup from '@/components/molecules/WalletChipGroup';
import SelectCategorySheet from '@/components/organisms/SelectCategorySheet';
import SelectSubCategorySheet from '@/components/organisms/SelectSubCategorySheet';
import SheetLayout from '@/components/templates/SheetLayout';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useInstruments } from '@/hooks/useInstruments';
import { useInvestmentTransactions } from '@/hooks/useInvestmentTransactions';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { Category, SubCategory } from '@/types';
import { transitions } from '@/utils/motion';
import { parseFormattedNumber } from '@/utils/numberInput';

const useStyles = makeStyles(({ colors }) => ({
  deposit: { gap: 14, paddingHorizontal: spacing.xs },
  field: { gap: spacing.sm },
  category: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  footerButton: { flex: 1 },
}));

/** Tarik dana (pen `p6ZH8`) — port WithdrawalFormModal web, opsional setor ke dompet. */
export default function InvestmentWithdrawScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof ROUTES.INVESTMENT_WITHDRAW>) {
  const styles = useStyles();
  const { t } = useTranslation();
  const showToast = useToast();
  const { formatNumber } = useMoneyFormat();
  const { instruments } = useInstruments({ autoLoad: false });
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const { createMoneyOut } = useInvestmentTransactions();
  const { createTransaction } = useTransactions();
  const close = navigation.goBack;
  const instrument = instruments.find(
    item => item.idInstrument === route.params.idInstrument,
  );
  const account = instrument?.investmentAccounts.find(
    item => item.idInvestmentAccount === route.params.idInvestmentAccount,
  );

  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  // Bisa bertanggal mundur; backend menghitung batas tarik dari nilai sejak tanggal itu.
  const [date, setDate] = useState(() => new Date());
  const [deposit, setDeposit] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'category' | 'sub' | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedWalletId =
    walletId ??
    (wallets.find(wallet => wallet.isPrimary) ?? wallets[0])?.idWallet ??
    null;
  const category =
    categories.find(item => item.idCategory === categoryId) ?? null;
  const subCategory =
    category?.subCategories.find(sub => sub.idSubCategory === subCategoryId) ??
    null;
  const amount = parseFormattedNumber(amountInput);
  const remaining = (account?.currentValue ?? 0) - amount;
  const overdrawn = amount > 0 && remaining < 0;

  const save = async () => {
    if (!instrument || !account) {
      return;
    }
    if (amount <= 0) {
      return showToast(t('transaction.amountRequiredError'), 'error');
    }
    if (deposit && (!selectedWalletId || !category)) {
      return showToast(t('investment.depositToWalletRequiredError'), 'error');
    }
    setSaving(true);
    try {
      let idTransaction: string | null = null;
      if (deposit && selectedWalletId && category) {
        const created = await createTransaction({
          type: 'income',
          idWallet: selectedWalletId,
          idCategory: category.idCategory,
          idSubCategory: subCategory?.idSubCategory ?? null,
          idWalletFrom: null,
          idWalletTo: null,
          title: t('investment.withdrawalTransactionTitle'),
          notes: note,
          amount,
          date: date.toISOString(),
        });
        idTransaction = created.idTransaction;
      }
      await createMoneyOut({
        idInstrument: instrument.idInstrument,
        idInvestmentAccount: account.idInvestmentAccount,
        amount,
        date: date.toISOString(),
        idTransaction,
        note: note || undefined,
      });
      showToast(t('investment.withdrawalSuccess'), 'success');
      close();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('investment.genericError'),
        'error',
      );
      setSaving(false);
    }
  };

  return (
    <>
      <SheetLayout
        onClose={close}
        closeLabel={t('common.close')}
        title={t('investment.withdrawalTitle')}
        subtitle={t('investment.withdrawalSubtitle')}
        footer={
          <>
            <Button
              variant="outline"
              label={t('common.cancel')}
              disabled={saving}
              onPress={close}
              style={styles.footerButton}
            />
            <Button
              label={t('investment.withdrawalTitle')}
              renderIcon={color => <ArrowUpRight size={18} color={color} />}
              loading={saving}
              disabled={!account}
              onPress={save}
              style={styles.footerButton}
            />
          </>
        }
      >
        {instrument && account && (
          <InvestmentAccountSummary
            title={account.nameInvestmentAccount}
            subtitle={instrument.nameInstrument}
            valueLabel={t('investment.valueShort')}
            value={formatNumber(account.currentValue)}
          />
        )}
        <AmountField
          label={t('investment.withdrawAmountLabel')}
          value={amountInput}
          onChange={setAmountInput}
          error={overdrawn ? t('investment.withdrawOverValue') : undefined}
          helper={
            amount > 0 && !overdrawn
              ? t('investment.remainingAfterWithdraw', {
                  amount: formatNumber(remaining),
                })
              : undefined
          }
        />
        <InvestmentDateTimeField value={date} onChange={setDate} />
        <TextField
          variant="filled"
          label={t('investment.noteLabel')}
          value={note}
          onChangeText={setNote}
          placeholder={t('investment.notePlaceholder')}
          autoCapitalize="sentences"
          renderLeadingIcon={color => <NotebookPen size={18} color={color} />}
        />
        <CheckboxRow
          checked={deposit}
          onChange={setDeposit}
          title={t('investment.depositToWalletLabel')}
          hint={t('investment.depositToWalletHint')}
        />
        <AnimatePresence>
          {deposit && (
            <MotiView
              key="deposit"
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -6 }}
              transition={transitions.fade}
              style={styles.deposit}
            >
              <WalletChipGroup
                label={t('investment.destinationWallet')}
                wallets={wallets}
                selectedId={selectedWalletId}
                onSelect={setWalletId}
              />
              <View style={styles.field}>
                <Typography variant="fieldLabel" tone="muted">
                  {t('investment.incomeCategory')}
                </Typography>
                <View style={styles.category}>
                  <CategoryPickerRow
                    category={category}
                    subCategory={subCategory}
                    placeholder={t('transaction.selectCategoryPlaceholder')}
                    onPress={() => setSheet('category')}
                  />
                </View>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </SheetLayout>

      <SelectCategorySheet
        visible={sheet === 'category'}
        type="income"
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
    </>
  );
}
