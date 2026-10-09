import { ArrowLeftRight } from 'lucide-react-native';
import TxRow from '@/components/molecules/TxRow';
import { useTheme } from '@/contexts/ThemeContext';
import type { Transaction, WalletAccount } from '@/types';

export interface TransferRowProps {
  transaction: Transaction;
  walletFrom?: WalletAccount;
  walletTo?: WalletAccount;
  format: (value: number) => string;
  timeLabel: string;
  onPress?: () => void;
}

/** Baris transfer antar dompet: nominal netral, meta "BCA → Jago". */
export default function TransferRow({
  transaction,
  walletFrom,
  walletTo,
  format,
  timeLabel,
  onPress,
}: TransferRowProps) {
  const { colors } = useTheme();
  const route = `${walletFrom?.nameWallet ?? '?'} → ${
    walletTo?.nameWallet ?? '?'
  }`;
  return (
    <TxRow
      onPress={onPress}
      renderIcon={color => <ArrowLeftRight size={18} color={color} />}
      color={colors.txNeutral}
      title={transaction.title || route}
      meta={route}
      amount={format(transaction.amount)}
      amountTone="muted"
      caption={timeLabel}
    />
  );
}
