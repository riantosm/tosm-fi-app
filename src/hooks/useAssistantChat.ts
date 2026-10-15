import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { useInstruments } from '@/hooks/useInstruments';
import { useLanguage } from '@/hooks/useLanguage';
import { useWallets } from '@/hooks/useWallets';
import {
  AssistantCommitError,
  AssistantError,
  commitAssistantApi,
  sendAssistantChatApi,
} from '@/services/api/assistant.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  bumpInvestmentVersion,
  bumpTransactionsVersion,
} from '@/store/slices/transactionSlice';
import type {
  AssistantDraft,
  AssistantImage,
  AssistantMessage,
  AssistantReply,
  AssistantRequest,
} from '@/types';

type PreviewMessage = Extract<AssistantMessage, { kind: 'preview' }>;

let messageSeq = 0;
const newMessageId = () =>
  `m${Date.now().toString(36)}${(messageSeq++).toString(36)}`;

/** Jawaban pemilih tanggal, sebagai jam lokal yang dipakai asisten. */
function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toHistory(messages: AssistantMessage[]): AssistantRequest['history'] {
  const history: AssistantRequest['history'] = [];
  for (const message of messages) {
    if (message.role === 'user') {
      if (!message.failed) {
        history.push({ role: 'user', text: message.payload ?? message.text });
      }
    } else if (
      (message.kind === 'text' || message.kind === 'preview') &&
      message.text
    ) {
      history.push({ role: 'assistant', text: message.text });
    }
  }
  return history;
}

function findPendingPreview(
  list: AssistantMessage[],
): PreviewMessage | undefined {
  return [...list]
    .reverse()
    .find(
      (m): m is PreviewMessage =>
        m.role === 'assistant' &&
        m.kind === 'preview' &&
        m.status === 'pending',
    );
}

/**
 * State percakapan Catat cepat (port `use-assistant-chat` web). `sendAssistantChatApi` mengubah
 * percakapan jadi draft; pratinjau yang dikonfirmasi disimpan sekaligus oleh `commitAssistantApi`
 * (satu transaksi database), lalu sinyal mutasi + sinkron dompet/kategori/instrumen sama seperti
 * input manual. Dipakai sekali lewat `AssistantChatProvider` supaya chat bertahan saat layar
 * ditutup dan dibuka lagi sampai "Mulai baru" atau logout.
 */
export function useAssistantChat() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { language } = useLanguage();
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const {
    wallets,
    status: walletStatus,
    loadWallets,
  } = useWallets({ autoLoad: false });
  const {
    categories,
    status: categoryStatus,
    loadCategories,
  } = useCategories({ autoLoad: false });
  const {
    instruments,
    status: instrumentStatus,
    loadInstruments,
  } = useInstruments({ autoLoad: false });

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [drafts, setDrafts] = useState<AssistantDraft[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Nilai terbaru untuk callback async (balasan bisa datang setelah reset).
  const messagesRef = useRef(messages);
  const draftsRef = useRef(drafts);
  const sessionRef = useRef(0);
  useEffect(() => {
    messagesRef.current = messages;
    draftsRef.current = drafts;
  }, [messages, drafts]);

  /** Pratinjau menampilkan nama dari data ini walau belum ada layar yang memuatnya. */
  const ensureData = useCallback(() => {
    if (walletStatus === 'idle') {
      loadWallets().catch(() => {});
    }
    if (categoryStatus === 'idle') {
      loadCategories().catch(() => {});
    }
    if (instrumentStatus === 'idle') {
      loadInstruments().catch(() => {});
    }
  }, [
    walletStatus,
    categoryStatus,
    instrumentStatus,
    loadWallets,
    loadCategories,
    loadInstruments,
  ]);

  const setPreviewStatus = useCallback(
    (
      id: string,
      status: PreviewMessage['status'],
      extra?: Partial<PreviewMessage>,
    ) => {
      setMessages(list =>
        list.map(m =>
          m.id === id && m.role === 'assistant' && m.kind === 'preview'
            ? { ...m, status, ...extra }
            : m,
        ),
      );
    },
    [],
  );

  const save = useCallback(async () => {
    const preview = findPendingPreview(messagesRef.current);
    if (!preview || preview.drafts.some(d => d.error)) {
      return;
    }
    const session = sessionRef.current;
    setPreviewStatus(preview.id, 'saving');

    try {
      const result = await commitAssistantApi(preview.drafts, language);
      if (result.transactions.length > 0) {
        dispatch(bumpTransactionsVersion());
      }
      if (result.investmentTransactions.length > 0) {
        dispatch(bumpInvestmentVersion());
      }
      // Saldo, jumlah transaksi, dan nilai akun berubah di server: sinkronkan di latar.
      Promise.all([
        loadWallets(),
        loadCategories(),
        result.investmentTransactions.length > 0 ? loadInstruments() : null,
      ]).catch(() => {});

      if (session !== sessionRef.current) {
        return;
      }
      const count = preview.drafts.length;
      setPreviewStatus(preview.id, 'saved', {
        savedAt: new Date().toISOString(),
      });
      setMessages(list => [
        ...list,
        { id: newMessageId(), role: 'assistant', kind: 'success', count },
      ]);
      setDrafts([]);
      showToast(t('assistant.savedToast', { count }), 'success');
    } catch (error) {
      if (session !== sessionRef.current) {
        return;
      }
      // Satu batch = satu transaksi database, jadi tidak ada yang tersimpan: pratinjau tetap,
      // baris yang ditolak backend (kalau disebut) ditandai merah.
      const message =
        error instanceof Error ? error.message : t('transaction.genericError');
      const idDraft =
        error instanceof AssistantCommitError ? error.idDraft : null;
      const marked = preview.drafts.map(d =>
        d.idDraft === idDraft ? { ...d, error: message } : d,
      );
      setPreviewStatus(preview.id, 'pending', { drafts: marked });
      setDrafts(marked);
      showToast(message, 'error');
    }
  }, [
    setPreviewStatus,
    language,
    dispatch,
    loadWallets,
    loadCategories,
    loadInstruments,
    showToast,
    t,
  ]);

  const cancel = useCallback(() => {
    const preview = findPendingPreview(messagesRef.current);
    if (preview) {
      setPreviewStatus(preview.id, 'cancelled');
    }
    setDrafts([]);
    setMessages(list => [
      ...list,
      {
        id: newMessageId(),
        role: 'assistant',
        kind: 'text',
        text: t('assistant.cancelledReply'),
      },
    ]);
  }, [setPreviewStatus, t]);

  const applyReply = useCallback(
    (reply: AssistantReply) => {
      switch (reply.intent) {
        case 'save':
          save();
          return;
        case 'cancel':
          cancel();
          return;
        case 'preview': {
          const previous = findPendingPreview(messagesRef.current);
          setMessages(list => [
            ...list.map(m =>
              previous && m.id === previous.id
                ? { ...previous, status: 'replaced' as const }
                : m,
            ),
            {
              id: newMessageId(),
              role: 'assistant',
              kind: 'preview',
              text: reply.reply,
              drafts: reply.drafts,
              status: 'pending',
              revised: reply.drafts.some(d => d.changed?.length),
            },
          ]);
          setDrafts(reply.drafts);
          return;
        }
        default: {
          // Pertanyaan tentang draft berarti pratinjau di layar akan berubah: pensiunkan
          // Simpan-nya supaya batch lama tidak bisa tersimpan.
          const stale =
            reply.intent === 'ask'
              ? findPendingPreview(messagesRef.current)
              : undefined;
          setMessages(list => [
            ...list.map(m =>
              stale && m.id === stale.id
                ? { ...stale, status: 'replaced' as const }
                : m,
            ),
            {
              id: newMessageId(),
              role: 'assistant',
              kind: 'text',
              text: reply.reply,
              quickReplies: reply.quickReplies,
            },
          ]);
          setDrafts(reply.drafts);
        }
      }
    },
    [save, cancel],
  );

  const request = useCallback(
    async (history: AssistantMessage[], userMessageId: string) => {
      const session = sessionRef.current;
      setIsThinking(true);
      const owner = history.find(m => m.id === userMessageId);
      try {
        const reply = await sendAssistantChatApi({
          history: toHistory(history),
          drafts: draftsRef.current,
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          language,
          hasPreview: Boolean(findPendingPreview(history)),
          image: owner?.role === 'user' ? owner.photo?.image : undefined,
        });
        if (session !== sessionRef.current) {
          return;
        }
        applyReply(reply);
      } catch (error) {
        if (session !== sessionRef.current) {
          return;
        }
        const kind = error instanceof AssistantError ? error.kind : 'network';
        const userMessage = history.find(m => m.id === userMessageId);
        const retryText =
          userMessage?.role === 'user'
            ? userMessage.payload ?? userMessage.text
            : '';
        setMessages(list => [
          ...list.map(m =>
            kind === 'network' && m.id === userMessageId
              ? { ...m, failed: true }
              : m,
          ),
          {
            id: newMessageId(),
            role: 'assistant',
            kind: 'error',
            error: kind,
            retryText,
          },
        ]);
      } finally {
        if (session === sessionRef.current) {
          setIsThinking(false);
        }
      }
    },
    [language, applyReply],
  );

  const send = useCallback(
    (
      text: string,
      payload?: string,
      photo?: { uri: string; image: AssistantImage },
    ) => {
      const clean = text.trim();
      if (!clean || isThinking) {
        return;
      }
      const userMessage: AssistantMessage = {
        id: newMessageId(),
        role: 'user',
        text: clean,
        payload,
        photo,
      };
      // Banner error bersifat sementara: pesan baru menggantikannya.
      const next = [
        ...messagesRef.current.filter(
          m => !(m.role === 'assistant' && m.kind === 'error'),
        ),
        userMessage,
      ];
      messagesRef.current = next;
      setMessages(next);
      request(next, userMessage.id);
    },
    [isThinking, request],
  );

  /** Kirim ulang pesan di balik banner error. */
  const retry = useCallback(
    (errorId: string) => {
      if (isThinking) {
        return;
      }
      const list = messagesRef.current;
      const errorIndex = list.findIndex(m => m.id === errorId);
      if (errorIndex === -1) {
        return;
      }
      const before = list
        .slice(0, errorIndex)
        .map(m =>
          m.role === 'user' && m.failed ? { ...m, failed: false } : m,
        );
      const lastUser = [...before].reverse().find(m => m.role === 'user');
      messagesRef.current = before;
      setMessages(before);
      if (lastUser) {
        request(before, lastUser.id);
      }
    },
    [isThinking, request],
  );

  /** Foto struk dari layar Scan struk: dikirim sebagai pesan user dengan thumbnail. */
  const sendPhoto = useCallback(
    (text: string, photo: { uri: string; image: AssistantImage }) =>
      send(text, undefined, photo),
    [send],
  );

  /** Jawaban "Apakah transaksi ini hari ini?" lewat pemilih tanggal. */
  const pickDate = useCallback(
    (date: Date, label: string) => send(label, toLocalDateTime(date)),
    [send],
  );

  const reset = useCallback(() => {
    sessionRef.current += 1;
    messagesRef.current = [];
    draftsRef.current = [];
    setMessages([]);
    setDrafts([]);
    setIsThinking(false);
  }, []);

  // Logout → percakapan (berisi data akun) tidak boleh terbawa ke akun berikutnya.
  useEffect(() => {
    if (!isLogin) {
      reset();
    }
  }, [isLogin, reset]);

  return {
    messages,
    drafts,
    isThinking,
    wallets,
    categories,
    instruments,
    ensureData,
    send,
    sendPhoto,
    retry,
    pickDate,
    save,
    cancel,
    reset,
  };
}

export type AssistantChat = ReturnType<typeof useAssistantChat>;
