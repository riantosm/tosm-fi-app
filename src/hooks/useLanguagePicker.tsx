import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguagePill from '@/components/molecules/LanguagePill';
import LanguageSheet from '@/components/organisms/LanguageSheet';
import { useLanguage } from '@/hooks/useLanguage';
import type { LanguageCode } from '@/types';

/** Pemilih bahasa untuk layar auth: `trigger` (pill) + `sheet` (render keduanya). */
export function useLanguagePicker() {
  const { t } = useTranslation();
  const { language, setLanguage, options } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.code === language) ?? options[0];

  const trigger = (
    <LanguagePill
      label={current.nativeLabel}
      accessibilityLabel={t('nav.language')}
      onPress={() => setOpen(true)}
    />
  );

  const sheet = (
    <LanguageSheet<LanguageCode>
      visible={open}
      title={t('nav.language')}
      closeLabel={t('common.close')}
      value={language}
      options={options.map(o => ({ value: o.code, label: o.nativeLabel }))}
      onSelect={code => {
        setLanguage(code);
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );

  return { trigger, sheet };
}
