import { Scale, Tag } from 'lucide-react-native';
import TxRow from '@/components/molecules/TxRow';
import { resolveCategoryIcon } from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import type {
  Category,
  SubCategory,
  Transaction,
  WalletAccount,
} from '@/types';
import { MINUS } from '@/utils/money';

export interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  subCategory?: SubCategory;
  wallet?: WalletAccount;
  /** "IDR 45.000" sesuai pengaturan. */
  format: (value: number) => string;
  /** "08.42" */
  timeLabel: string;
  onPress?: () => void;
}

/** Baris pemasukan / pengeluaran / koreksi saldo. */
export default function TransactionRow({
  transaction,
  category,
  subCategory,
  wallet,
  format,
  timeLabel,
  onPress,
}: TransactionRowProps) {
  const { colors } = useTheme();
  const isCorrection = transaction.type === 'correction';
  const isPositive =
    transaction.type === 'income' || (isCorrection && transaction.amount >= 0);
  const Icon = category
    ? resolveCategoryIcon(category.icon)
    : isCorrection
    ? Scale
    : Tag;
  const title =
    transaction.title ||
    subCategory?.nameSubCategory ||
    category?.nameCategory ||
    '-';
  const meta = [
    subCategory
      ? `${category?.nameCategory ?? ''} › ${subCategory.nameSubCategory}`
      : category?.nameCategory,
    wallet?.nameWallet,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TxRow
      onPress={onPress}
      renderIcon={color => <Icon size={18} color={color} />}
      color={category?.color ?? (isCorrection ? colors.txNeutral : undefined)}
      title={title}
      meta={meta}
      amount={`${isPositive ? '+' : MINUS}${format(
        Math.abs(transaction.amount),
      )}`}
      amountTone={isPositive ? 'income' : 'expense'}
      caption={timeLabel}
    />
  );
}
