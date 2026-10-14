import { View } from 'react-native';
import { Landmark, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Monogram from '@/components/atoms/Monogram';
import Typography from '@/components/atoms/Typography';
import TextField from '@/components/molecules/TextField';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import type { Instrument } from '@/types';

const useStyles = makeStyles(({ colors }) => ({
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  lockedName: { flex: 1 },
}));

export interface InvestmentAccountFieldsProps {
  /** Instrumen pemilik akun (terkunci, tidak bisa diganti). */
  instrument?: Instrument | null;
  name: string;
  onNameChange: (name: string) => void;
}

/** Isi form akun investasi — dipakai InvestmentAccountForm dan "Akun baru" di InvestmentTargetSheet. */
export default function InvestmentAccountFields({
  instrument,
  name,
  onNameChange,
}: InvestmentAccountFieldsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {instrument && (
        <View style={styles.locked}>
          <Monogram
            name={instrument.nameInstrument}
            color={instrument.color}
            variant="solid"
            shape="square"
            size={28}
          />
          <Typography
            variant="label"
            numberOfLines={1}
            style={styles.lockedName}
          >
            {instrument.nameInstrument}
          </Typography>
          <Lock
            size={16}
            color={colors.text3}
            accessibilityLabel={t('investment.instrumentLocked')}
          />
        </View>
      )}
      <TextField
        variant="filled"
        label={t('investment.accountNameLabel')}
        helper={t('investment.accountNameHelper')}
        value={name}
        onChangeText={onNameChange}
        placeholder={t('investment.accountNamePlaceholder')}
        autoCapitalize="words"
        renderLeadingIcon={iconColor => (
          <Landmark size={18} color={iconColor} />
        )}
      />
    </>
  );
}
