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

export type AssistantErrorKind = 'quota' | 'network';

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
}

/** Yang dibuat oleh `POST /assistant/commit`. */
export interface AssistantCommitResult {
  transactions: Transaction[];
  investmentTransactions: InvestmentTransaction[];
}
