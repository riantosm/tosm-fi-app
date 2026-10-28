import type { InvestmentTransaction } from './investmentTransaction.types';
import type { Transaction, TransactionType } from './transaction.types';

/**
 * Satu transaksi pratinjau yang diusulkan asisten: 4 tipe transaksi dompet + 4 operasi
 * ledger investasi. Kontrak sama dengan `IAssistantDraft` di tosm-fi-be.
 */
export type AssistantDraftKind =
  | TransactionType
  | 'investmentIn'
  | 'investmentOut'
  | 'investmentTransfer'
  | 'investmentPl';

export interface AssistantDraft {
  idDraft: string;
  kind: AssistantDraftKind;
  title: string;
  /** Selalu positif; tanda berasal dari `kind` (atau balanceBefore → balanceAfter). */
  amount: number;
  /** ISO datetime. */
  date: string;
  notes: string;
  idWallet: string | null;
  idCategory: string | null;
  idSubCategory: string | null;
  idWalletFrom: string | null;
  idWalletTo: string | null;
  /** Jenis investasi: akun asal / tujuan top up, atau yang dinilai (P/L). */
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  /** Hanya investmentTransfer: akun tujuan. */
  idInstrumentTo: string | null;
  idInvestmentAccountTo: string | null;
  /** correction: saldo dompet sebelum → sesudah. investmentPl: nilai akun sebelum → sesudah. */
  balanceBefore?: number;
  balanceAfter?: number;
  /** Field yang diubah oleh revisi terakhir. */
  changed?: string[];
  /** Pesan validasi server (baris ditandai merah, Simpan dinonaktifkan). */
  error?: string;
  /** Field yang belum diberikan user (mis. "date"); dikirim balik agar asisten terus bertanya. */
  missing?: string[];
}

export type AssistantIntent = 'ask' | 'preview' | 'save' | 'cancel' | 'unknown';

export interface AssistantQuickReply {
  label: string;
  /** Teks yang dikirim saat ditekan (default: label). */
  value?: string;
  dot?: string;
  icon?: 'calendar';
}

export interface AssistantReply {
  intent: AssistantIntent;
  reply: string;
  drafts: AssistantDraft[];
  quickReplies?: AssistantQuickReply[];
}

/** quota = AI sibuk (429); plan = kuota pesan Catat Cepat bulan ini habis (403 PLAN_LIMIT). */
export type AssistantErrorKind = 'quota' | 'plan' | 'network';

/** Foto (struk) untuk asisten: JPEG base64 tanpa awalan `data:`. */
export interface AssistantImage {
  mimeType: 'image/jpeg';
  data: string;
}

export interface AssistantRequest {
  history: { role: 'user' | 'assistant'; text: string }[];
  /** Draft yang sedang pending (ditanyakan atau dipratinjau), sesuai respons terakhir. */
  drafts: AssistantDraft[];
  /** `Date.prototype.getTimezoneOffset()`, konvensi sama dengan setiap GET berbasis tanggal. */
  tzOffsetMinutes: number;
  /** Kode bahasa app ("id" | "en" | "jp"); asisten membalas dalam bahasa ini. */
  language: string;
  /** True selama draft tampil sebagai pratinjau yang menunggu Simpan/Batal. */
  hasPreview: boolean;
  /** Hanya dikirim bersama pesan pemiliknya; riwayat percakapan tetap teks saja. */
  image?: AssistantImage;
}

/** Yang dibuat oleh `POST /assistant/commit`. */
export interface AssistantCommitResult {
  transactions: Transaction[];
  investmentTransactions: InvestmentTransaction[];
}

/** Satu entri percakapan Catat cepat (state lokal app, tidak dikirim apa adanya ke server). */
export type AssistantMessage =
  | {
      id: string;
      role: 'user';
      /** Yang tampil di bubble. */
      text: string;
      /** Yang dikirim ke asisten kalau beda dari `text` (mis. tanggal terpilih). */
      payload?: string;
      failed?: boolean;
      /** Foto struk: `uri` untuk thumbnail di bubble, `image` untuk dikirim (juga saat Coba lagi). */
      photo?: { uri: string; image: AssistantImage };
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'text';
      text: string;
      quickReplies?: AssistantQuickReply[];
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'preview';
      text: string;
      drafts: AssistantDraft[];
      status: 'pending' | 'saving' | 'saved' | 'cancelled' | 'replaced';
      revised?: boolean;
      savedAt?: string;
    }
  | { id: string; role: 'assistant'; kind: 'success'; count: number }
  | {
      id: string;
      role: 'assistant';
      kind: 'error';
      error: AssistantErrorKind;
      retryText: string;
    };
