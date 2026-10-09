import { ScrollView, View } from 'react-native';
import Chip from '@/components/atoms/Chip';
import Typography from '@/components/atoms/Typography';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/metrics';
import type { WalletAccount } from '@/types';

export interface WalletChipGroupProps {
  label: string;
  wallets: WalletAccount[];
  selectedId: string | null;
  /** Dompet yang tidak boleh dipilih (sisi lain transfer). */
  disabledId?: string | null;
  onSelect: (id: string) => void;
}

const useStyles = makeStyles(() => ({
  wrapper: { gap: spacing.sm },
  row: { gap: spacing.sm },
}));

/** Label + deret chip outline dompet (pilih satu), scroll horizontal. */
export default function WalletChipGroup({
  label,
  wallets,
  selectedId,
  disabledId,
  onSelect,
}: WalletChipGroupProps) {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <Typography variant="fieldLabel" tone="muted">
        {label}
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {wallets.map(wallet => (
          <Chip
            key={wallet.idWallet}
            variant="outline"
            label={wallet.nameWallet}
            dot={wallet.color}
            active={wallet.idWallet === selectedId}
            disabled={wallet.idWallet === disabledId}
            onPress={() => onSelect(wallet.idWallet)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
