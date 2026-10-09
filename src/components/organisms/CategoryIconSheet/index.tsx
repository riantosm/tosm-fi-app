import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import EmptyState from '@/components/molecules/EmptyState';
import SearchField from '@/components/molecules/SearchField';
import BottomSheet from '@/components/organisms/BottomSheet';
import {
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICONS,
} from '@/constants/categoryIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';

export interface CategoryIconSheetProps {
  visible: boolean;
  value: string;
  /** Warna kategori untuk ikon terpilih. */
  color: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

const useStyles = makeStyles(({ colors }) => ({
  group: { gap: 10 },
  placeholder: { height: 420 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  cell: { width: '12.5%', padding: 3 },
  tile: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.transparent,
    backgroundColor: colors.surface2,
  },
}));

/** "Pilih ikon" (pen `o8mD9`): cari + grup ikon, grid 8 kolom. Sheet bertingkat (kembali). */
export default function CategoryIconSheet({
  visible,
  value,
  color,
  onSelect,
  onClose,
}: CategoryIconSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  // Grid ±80 ikon SVG dirender sesaat setelah sheet tampil supaya sheet langsung muncul.
  const [ready, setReady] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (!visible) {
      setReady(false);
    }
  }
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(timer);
  }, [visible]);

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return CATEGORY_ICON_GROUPS;
    }
    return CATEGORY_ICON_GROUPS.map(group => ({
      ...group,
      icons: group.icons.filter(option =>
        t(`category.iconNames.${option.labelKey}`)
          .toLowerCase()
          .includes(normalized),
      ),
    })).filter(group => group.icons.length > 0);
  }, [query, t]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('category.chooseIcon')}
      subtitle={t('category.iconCount', { count: CATEGORY_ICONS.length })}
      onBack={close}
      backLabel={t('common.back')}
      closeLabel={t('common.close')}
      onClose={close}
    >
      <SearchField
        variant="filled"
        value={query}
        onChangeText={setQuery}
        placeholder={t('category.searchIconPlaceholder')}
        clearLabel={t('common.close')}
      />
      {!ready ? (
        <View style={styles.placeholder} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<SearchX size={32} color={colors.primaryText} />}
          title={t('category.noIconResults')}
        />
      ) : (
        groups.map(group => (
          <View key={group.key} style={styles.group}>
            <Typography variant="eyebrow" tone="subtle">
              {t(group.titleKey)}
            </Typography>
            <View style={styles.grid}>
              {group.icons.map(option => {
                const selected = option.name === value;
                const Icon = option.icon;
                return (
                  <View key={option.name} style={styles.cell}>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={t(
                        `category.iconNames.${option.labelKey}`,
                      )}
                      accessibilityState={{ selected }}
                      scaleTo={0.9}
                      onPress={() => {
                        setQuery('');
                        onSelect(option.name);
                      }}
                      style={[
                        styles.tile,
                        selected && {
                          borderColor: color,
                          backgroundColor: `${color}26`,
                        },
                      ]}
                    >
                      <Icon size={20} color={selected ? color : colors.text2} />
                    </PressableScale>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </BottomSheet>
  );
}
