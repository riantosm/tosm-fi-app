import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import LockedBanner from '@/components/molecules/LockedBanner';
import LockedUnlockBar from '@/components/molecules/LockedUnlockBar';
import SectionHead from '@/components/molecules/SectionHead';
import TransactionList from '@/components/organisms/TransactionList';
import MainLayout from '@/components/templates/MainLayout';
import { useAppLock } from '@/hooks/useAppLock';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import SummaryBar from '@/screens/Transactions/SummaryBar';
import { useAppSelector } from '@/store/hooks';
import { makeStyles } from '@/theme/makeStyles';
import type { Transaction, TransactionSummary } from '@/types';
import { formatDayMonth, toIsoDate } from '@/utils/calendar';
import { toIntlLocale } from '@/utils/locale';
import Reveal from '@/components/atoms/Reveal';

/** Hari ini + 2 hari sebelumnya. */
const RECENT_DAYS = 3;

const useStyles = makeStyles(() => ({
  root: { flex: 1 },
  count: { fontSize: 13 },
}));

function recentRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (RECENT_DAYS - 1));
  return { from, to };
}

/**
 * Transaksi terakhir (pen "Pintasan · Transaksi terakhir"): pintasan tanpa kunci dari Beranda
 * kunci. Hanya lihat: ringkasan + daftar 3 hari terakhir per hari, tanpa filter/edit/tagihan.
 */
export default function RecentTransactionsScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.RECENT_TRANSACTIONS>) {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { startUnlock } = useAppLock();
  const biometricEnabled = useAppSelector(
    state => state.appLock.biometricEnabled,
  );
  const { categories, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { version, queryTransactions } = useTransactions();

  const [range, setRange] = useState(recentRange);
  const [items, setItems] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const dateFrom = toIsoDate(range.from);
  const dateTo = toIsoDate(range.to);

  const load = useCallback(
    () =>
      queryTransactions({ dateFrom, dateTo, sort: 'dateDesc' })
        .then(result => {
          setItems(result.transactions);
          setSummary(result.summary);
        })
        .catch(() => {})
        .finally(() => setLoading(false)),
    [dateFrom, dateTo, queryTransactions],
  );

  useEffect(() => {
    load();
  }, [load, version]);

  // Tarik untuk muat ulang juga menggeser rentang kalau tanggal sudah berganti.
  const handleRefresh = async () => {
    setRange(recentRange());
    await Promise.all([load(), loadWallets(), loadCategories()]);
  };

  return (
    <View style={styles.root}>
      <MainLayout
        title={t('appLock.recentTitle')}
        subtitle={t('appLock.recentSubtitle', {
          range: `${formatDayMonth(range.from, locale)} – ${formatDayMonth(
            range.to,
            locale,
          )}`,
        })}
        onBack={navigation.goBack}
        backLabel={t('common.back')}
        topBanner={
          <LockedBanner
            message={t('appLock.lockedBanner')}
            actionLabel={t('appLock.signIn')}
            onAction={startUnlock}
          />
        }
        withTabBar
        onRefresh={handleRefresh}
      >
        <Reveal>
          <SummaryBar
            expense={summary?.expense ?? 0}
            income={summary?.income ?? 0}
          />
        </Reveal>
        <Reveal delay={40}>
          <Card>
            <SectionHead
              title={t('appLock.recentListTitle')}
              right={
                loading ? undefined : (
                  <Typography
                    variant="secondary"
                    tone="subtle"
                    tabular
                    style={styles.count}
                  >
                    {items.length}
                  </Typography>
                )
              }
            />
            <TransactionList
              transactions={items}
              categories={categories}
              wallets={wallets}
              dayHeaderStyle="full"
              emptyMessage={t('appLock.recentEmpty')}
              isLoading={loading || walletsStatus !== 'loaded'}
            />
          </Card>
        </Reveal>
      </MainLayout>
      <LockedUnlockBar
        message={t('appLock.otherFeaturesLocked')}
        actionLabel={t('appLock.signIn')}
        biometric={biometricEnabled}
        onUnlock={startUnlock}
      />
    </View>
  );
}
