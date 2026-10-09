import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Info,
  RotateCcw,
  SquarePen,
} from 'lucide-react-native';
import { StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AiMark from '@/components/atoms/AiMark';
import IconButton from '@/components/atoms/IconButton';
import PressableScale from '@/components/atoms/PressableScale';
import Typography from '@/components/atoms/Typography';
import DateTimePickerSheet from '@/components/organisms/DateTimePickerSheet';
import { useAssistantChatContext } from '@/contexts/AssistantChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useLanguage } from '@/hooks/useLanguage';
import { ROUTES } from '@/navigation/paths';
import type { RootStackScreenProps } from '@/navigation/types';
import AssistantErrorBanner from '@/screens/QuickAdd/AssistantErrorBanner';
import AssistantPreviewCard from '@/screens/QuickAdd/AssistantPreviewCard';
import {
  AiBubble,
  AiRow,
  ChatEntry,
  TypingBubble,
  UserBubble,
} from '@/screens/QuickAdd/ChatBubble';
import ChatComposer from '@/screens/QuickAdd/ChatComposer';
import QuickReplyButton from '@/screens/QuickAdd/QuickReplyButton';
import { useAppSelector } from '@/store/hooks';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/metrics';
import type {
  AssistantDraft,
  AssistantMessage,
  AssistantQuickReply,
} from '@/types';
import { toIntlLocale } from '@/utils/locale';
import { transitions, withDelay } from '@/utils/motion';
import { dateTimeFormat } from '@/utils/intl';
import Reveal from '@/components/atoms/Reveal';

const EXAMPLE_KEYS = [
  'example1',
  'example2',
  'example3',
  'example4',
  'example5',
] as const;

/** Jarak dari dasar yang masih dianggap "di bawah" (ikuti pesan baru). */
const STICK_DISTANCE = 96;

const useStyles = makeStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titles: { flex: 1, minWidth: 0, marginLeft: 2 },
  headerTitle: { fontSize: 17, lineHeight: 22 },
  disabled: { opacity: 0.45 },
  flex: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  spacer: { flex: 1 },
  intro: { gap: spacing.md },
  examples: { alignItems: 'flex-start', gap: spacing.sm, paddingLeft: 36 },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface2,
  },
  infoText: { flex: 1, lineHeight: 18 },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualTexts: { flex: 1, minWidth: 0, gap: 1 },
  manualAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replies: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  previewEntry: { gap: spacing.md },
  success: {
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.surface2,
  },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
}));

/**
 * Catat cepat (AI), pen `E5vp0` dkk. (port panel CatatCepat web versi HP): chat → pratinjau →
 * Simpan/Batal. Percakapan disimpan di `AssistantChatProvider`, jadi bertahan saat layar ditutup.
 */
export default function QuickAddScreen({
  navigation,
}: RootStackScreenProps<typeof ROUTES.QUICK_ADD>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const chat = useAssistantChatContext();
  const { ensureData } = chat;
  const user = useAppSelector(state => state.auth.user);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const stickRef = useRef(true);
  const lastMessage = chat.messages[chat.messages.length - 1];
  const hasConversation = chat.messages.length > 0;

  useEffect(() => {
    ensureData();
  }, [ensureData]);

  // Pesan baru dari user → kembali mengikuti dasar percakapan.
  useEffect(() => {
    if (lastMessage?.role === 'user') {
      stickRef.current = true;
    }
  }, [lastMessage]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distance =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    stickRef.current = distance < STICK_DISTANCE;
  };

  const handleManualEntry = () => {
    // Ganti panel AI dengan form manual (setara openManualEntry web).
    navigation.dispatch(StackActions.replace(ROUTES.TRANSACTION_FORM));
  };

  const handleQuickReply = (reply: AssistantQuickReply) => {
    if (reply.icon === 'calendar') {
      setDatePickerOpen(true);
      return;
    }
    chat.send(reply.label, reply.value);
  };

  const firstName = user?.nameUser?.trim().split(/\s+/)[0] ?? '';
  const composerPadding =
    Platform.OS === 'android' && keyboardHeight > 0
      ? keyboardHeight + spacing.md
      : Math.max(insets.bottom, spacing.md) + spacing.xs;

  function renderMessage(message: AssistantMessage, index: number) {
    if (message.role === 'user') {
      return (
        <ChatEntry key={message.id}>
          <UserBubble text={message.text} failed={message.failed} />
        </ChatEntry>
      );
    }

    switch (message.kind) {
      case 'text': {
        const showReplies =
          message === lastMessage &&
          !chat.isThinking &&
          (message.quickReplies?.length ?? 0) > 0;
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <AiBubble text={message.text} />
              {showReplies && (
                <View style={styles.replies}>
                  {message.quickReplies?.map((reply, i) => (
                    <Reveal delay={80 + i * 50} key={reply.label}>
                      <QuickReplyButton
                        reply={reply}
                        onSelect={handleQuickReply}
                      />
                    </Reveal>
                  ))}
                </View>
              )}
            </AiRow>
          </ChatEntry>
        );
      }
      case 'preview': {
        let previousDrafts: AssistantDraft[] | undefined;
        if (message.revised) {
          for (let i = index - 1; i >= 0; i--) {
            const candidate = chat.messages[i];
            if (
              candidate.role === 'assistant' &&
              candidate.kind === 'preview'
            ) {
              previousDrafts = candidate.drafts;
              break;
            }
          }
        }
        return (
          <ChatEntry key={message.id}>
            <View style={styles.previewEntry}>
              {!!message.text && (
                <AiRow>
                  <AiBubble text={message.text} />
                </AiRow>
              )}
              <AssistantPreviewCard
                message={message}
                previousDrafts={previousDrafts}
                wallets={chat.wallets}
                categories={chat.categories}
                instruments={chat.instruments}
                onSave={() => chat.save()}
                onCancel={chat.cancel}
              />
            </View>
          </ChatEntry>
        );
      }
      case 'success':
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <View style={styles.success}>
                <View style={styles.successRow}>
                  <CircleCheck size={17} color={colors.incomeText} />
                  <Typography variant="label" tone="income">
                    {t('assistant.savedReply', { count: message.count })}
                  </Typography>
                </View>
                <PressableScale
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() =>
                    navigation.popTo(ROUTES.MAIN_TABS, {
                      screen: ROUTES.TRANSACTIONS,
                    })
                  }
                  style={styles.link}
                >
                  <Typography variant="fieldLabel" tone="primary">
                    {t('assistant.viewInTransactions')}
                  </Typography>
                  <ArrowRight size={14} color={colors.primaryText} />
                </PressableScale>
              </View>
            </AiRow>
          </ChatEntry>
        );
      case 'error':
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <AssistantErrorBanner
                error={message.error}
                onRetry={() => chat.retry(message.id)}
                onManualEntry={handleManualEntry}
                isBusy={chat.isThinking}
              />
            </AiRow>
          </ChatEntry>
        );
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <IconButton
            label={t('common.back')}
            size={44}
            onPress={navigation.goBack}
            renderIcon={(color, size) => (
              <ArrowLeft size={size} color={color} />
            )}
          />
          <AiMark size="sm" />
          <View style={styles.titles}>
            <Typography
              variant="cardTitle"
              numberOfLines={1}
              style={styles.headerTitle}
            >
              {t('assistant.title')}
            </Typography>
            <Typography variant="caption" tone="subtle" numberOfLines={1}>
              {t('assistant.subtitle')}
            </Typography>
          </View>
          <IconButton
            label={t('assistant.manualEntry')}
            size={44}
            onPress={handleManualEntry}
            renderIcon={(color, size) => (
              <SquarePen size={size} color={color} />
            )}
          />
          <IconButton
            label={t('assistant.newChat')}
            size={44}
            disabled={!hasConversation}
            onPress={chat.reset}
            style={!hasConversation && styles.disabled}
            renderIcon={(color, size) => (
              <RotateCcw size={size} color={color} />
            )}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          onContentSizeChange={() => {
            if (stickRef.current) {
              scrollRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          <AiRow>
            <AiBubble text={t('assistant.greeting', { name: firstName })} />
          </AiRow>

          <AnimatePresence>
            {!hasConversation && (
              <MotiView
                key="intro"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitions.fade}
                style={styles.intro}
              >
                <View style={styles.examples}>
                  <Typography variant="caption" tone="subtle">
                    {t('assistant.examplesLabel')}
                  </Typography>
                  {EXAMPLE_KEYS.map((key, i) => (
                    <MotiView
                      key={key}
                      from={{ opacity: 0, translateX: -6 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={withDelay(transitions.enter, 100 + i * 50)}
                    >
                      <QuickReplyButton
                        reply={{ label: t(`assistant.${key}`) }}
                        onSelect={reply => chat.send(reply.label)}
                      />
                    </MotiView>
                  ))}
                </View>
                <View style={styles.info}>
                  <Info size={15} color={colors.text3} />
                  <Typography
                    variant="meta"
                    tone="muted"
                    style={styles.infoText}
                  >
                    {t('assistant.capabilities')}
                  </Typography>
                </View>
                <PressableScale
                  accessibilityRole="button"
                  scaleTo={0.98}
                  onPress={handleManualEntry}
                  style={styles.manual}
                >
                  <SquarePen size={16} color={colors.text2} />
                  <View style={styles.manualTexts}>
                    <Typography variant="fieldLabel" numberOfLines={1}>
                      {t('assistant.manualTitle')}
                    </Typography>
                    <Typography
                      variant="caption"
                      tone="subtle"
                      numberOfLines={1}
                    >
                      {t('assistant.manualSubtitle')}
                    </Typography>
                  </View>
                  <View style={styles.manualAction}>
                    <Typography variant="fieldLabel" tone="primary">
                      {t('assistant.manualEntry')}
                    </Typography>
                    <ArrowRight size={14} color={colors.primaryText} />
                  </View>
                </PressableScale>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Percakapan menempel di bawah, gaya chat. */}
          {hasConversation && <View style={styles.spacer} />}

          {chat.messages.map(renderMessage)}
          {chat.isThinking && (
            <ChatEntry key="typing">
              <TypingBubble />
            </ChatEntry>
          )}
        </ScrollView>

        <ChatComposer
          onSend={text => chat.send(text)}
          disabled={chat.isThinking}
          bottomInset={composerPadding}
        />
      </KeyboardAvoidingView>

      <DateTimePickerSheet
        visible={datePickerOpen}
        value={new Date()}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={date => {
          setDatePickerOpen(false);
          let label = date.toDateString();
          try {
            label = dateTimeFormat(toIntlLocale(language), {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(date);
          } catch {
            // Intl tidak tersedia → label bawaan.
          }
          chat.pickDate(date, label);
        }}
      />
    </SafeAreaView>
  );
}
