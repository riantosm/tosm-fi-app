import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View, type TextStyle } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Bug, ChevronDown, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Chip from '@/components/atoms/Chip';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Skeleton from '@/components/atoms/Skeleton';
import Typography from '@/components/atoms/Typography';
import Card from '@/components/molecules/Card';
import EmptyState from '@/components/molecules/EmptyState';
import SearchField from '@/components/molecules/SearchField';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import MainLayout from '@/components/templates/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import type { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import {
  deleteClientErrorApi,
  getClientErrorsApi,
} from '@/services/api/clientError.service';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type { ClientError, ClientErrorListParams } from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { transitions } from '@/utils/motion';
import { dateTimeFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

const SEARCH_DEBOUNCE_MS = 400;
const ENVIRONMENT_FILTERS = ['all', 'development', 'production'] as const;
type EnvironmentFilter = (typeof ENVIRONMENT_FILTERS)[number];

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });
// Pesan error = mono 600 (web). Font mono sistem tanpa file berat: iOS punya Menlo-Bold,
// Android butuh fontWeight (satu-satunya pengecualian aturan tanpa fontWeight).
const MONO_STRONG = Platform.select<TextStyle>({
  ios: { fontFamily: 'Menlo-Bold' },
  default: { fontFamily: 'monospace', fontWeight: '600' },
});

const useStyles = makeStyles(({ colors }) => ({
  chipsScroll: { flexGrow: 0 },
  chips: { alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  list: { gap: spacing.md },
  card: { gap: spacing.md },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  badges: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  envBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  envDot: { width: 6, height: 6, borderRadius: radius.pill },
  message: {
    ...MONO_STRONG,
    fontSize: 13,
    lineHeight: 20,
    color: colors.expenseText,
  },
  stackWrap: { overflow: 'hidden' },
  stack: {
    maxHeight: 256,
    borderRadius: 16,
    backgroundColor: colors.codeBg,
  },
  stackText: {
    padding: spacing.lg,
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: 19,
    color: colors.codeFg,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  dim: { opacity: 0.6 },
}));

function ErrorLogCard({
  item,
  defaultExpanded,
  deleting,
  onDelete,
}: {
  item: ClientError;
  defaultExpanded: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [stackOpen, setStackOpen] = useState(defaultExpanded);
  const isProduction = item.environment === 'production';
  const envColor = isProduction ? colors.expenseText : colors.investmentText;

  let date = item.createdAt;
  try {
    date = dateTimeFormat(toIntlLocale(language), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(item.createdAt));
  } catch {
    // Intl tidak tersedia → ISO mentah.
  }
  const meta = [
    item.source,
    item.path,
    item.username ? `@${item.username}` : null,
    date,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card style={[styles.card, deleting && styles.dim]}>
      <View style={styles.head}>
        <View style={styles.badges}>
          {!item.isRead && (
            <View style={styles.newBadge}>
              <Typography variant="badge" style={{ color: colors.primaryFg }}>
                {t('errorLog.newBadge')}
              </Typography>
            </View>
          )}
          <View
            style={[
              styles.envBadge,
              {
                backgroundColor: isProduction
                  ? colors.expenseSoft
                  : colors.investmentSoft,
              },
            ]}
          >
            <View style={[styles.envDot, { backgroundColor: envColor }]} />
            <Typography variant="badge" style={{ color: envColor }}>
              {t(`errorLog.environment.${item.environment}`)}
            </Typography>
          </View>
        </View>
        <IconButton
          label={t('errorLog.deleteButton')}
          size={32}
          disabled={deleting}
          onPress={onDelete}
          renderIcon={() => <Trash2 size={14} color={colors.expenseText} />}
        />
      </View>

      <Typography style={styles.message}>{item.message}</Typography>
      <Typography variant="meta" tone="subtle" numberOfLines={1}>
        {meta}
      </Typography>

      {!!item.stack && (
        <>
          <AnimatePresence>
            {stackOpen && (
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0 }}
                transition={transitions.fade}
                style={styles.stackWrap}
              >
                <ScrollView style={styles.stack} nestedScrollEnabled>
                  <Typography style={styles.stackText} selectable>
                    {item.stack}
                  </Typography>
                </ScrollView>
              </MotiView>
            )}
          </AnimatePresence>
          <PressableScale
            accessibilityRole="button"
            accessibilityState={{ expanded: stackOpen }}
            hitSlop={8}
            onPress={() => setStackOpen(open => !open)}
            style={styles.toggle}
          >
            <MotiView
              animate={{ rotate: stackOpen ? '180deg' : '0deg' }}
              transition={transitions.fade}
            >
              <ChevronDown size={16} color={colors.primaryText} />
            </MotiView>
            <Typography variant="fieldLabel" tone="primary">
              {stackOpen ? t('errorLog.hideStack') : t('errorLog.showStack')}
            </Typography>
          </PressableScale>
        </>
      )}
    </Card>
  );
}

/**
 * Log Error (pen `IMPbc`, port SettingsErrorLogPage web): cari (debounce), filter environment,
 * kartu error (badge Baru/environment, pesan mono, meta, stack trace bisa dibuka), hapus dengan
 * konfirmasi. GET /errors menandai error sudah dibaca di server, jadi kueri yang sama tidak
 * diulang dua kali berturut-turut.
 */
export default function SettingsErrorLogScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.SETTINGS_ERROR_LOG>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showToast = useToast();
  const [errors, setErrors] = useState<ClientError[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [environment, setEnvironment] = useState<EnvironmentFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (params: ClientErrorListParams) => {
      setLoading(true);
      try {
        setErrors(await getClientErrorsApi(params));
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : t('errorLog.genericError'),
          'error',
        );
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    },
    [showToast, t],
  );

  const params: ClientErrorListParams = {
    search: debouncedSearch || undefined,
    environment: environment !== 'all' ? environment : undefined,
  };
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (requestedKeyRef.current === paramsKey) {
      return;
    }
    requestedKeyRef.current = paramsKey;
    load(JSON.parse(paramsKey));
  }, [paramsKey, load]);

  const handleDelete = async () => {
    const id = deleteTarget;
    if (!id) {
      return;
    }
    setDeleteTarget(null);
    setDeletingId(id);
    try {
      await deleteClientErrorApi(id);
      setErrors(list => list.filter(item => item.idClientError !== id));
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('errorLog.genericError'),
        'error',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveFilter = environment !== 'all' || !!debouncedSearch;
  const initialLoading = !loaded && errors.length === 0;

  return (
    <MainLayout
      title={t('errorLog.title')}
      subtitle={t('errorLog.subtitle')}
      onBack={navigation.goBack}
      backLabel={t('common.back')}
      withTabBar
      onRefresh={() => load(JSON.parse(paramsKey))}
    >
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('errorLog.searchPlaceholder')}
        clearLabel={t('common.close')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {ENVIRONMENT_FILTERS.map(filter => (
          <Chip
            key={filter}
            label={
              filter === 'all'
                ? t('common.all')
                : t(`errorLog.environment.${filter}`)
            }
            active={environment === filter}
            onPress={() => setEnvironment(filter)}
          />
        ))}
      </ScrollView>

      {initialLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map(index => (
            <Skeleton key={index} height={132} radius={radius.card} />
          ))}
        </View>
      ) : errors.length === 0 ? (
        <EmptyState
          icon={<Bug size={32} color={colors.primaryText} />}
          title={
            hasActiveFilter ? t('errorLog.emptyFiltered') : t('errorLog.empty')
          }
        />
      ) : (
        <View style={[styles.list, loading && styles.dim]}>
          {errors.map((item, index) => (
            <Reveal delay={Math.min(index, 6) * 30} key={item.idClientError}>
              <ErrorLogCard
                item={item}
                defaultExpanded={index === 0}
                deleting={deletingId === item.idClientError}
                onDelete={() => setDeleteTarget(item.idClientError)}
              />
            </Reveal>
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        tone="danger"
        renderIcon={color => <Trash2 size={24} color={color} />}
        title={t('errorLog.deleteConfirmTitle')}
        message={t('errorLog.deleteConfirmDescription')}
        confirmLabel={t('errorLog.deleteConfirmAction')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </MainLayout>
  );
}
