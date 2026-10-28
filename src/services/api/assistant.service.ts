import axios from 'axios';
import { PLAN_LIMIT_CODE } from '@/constants/plans';
import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  AssistantCommitResult,
  AssistantDraft,
  AssistantErrorKind,
  AssistantReply,
  AssistantRequest,
} from '@/types';

/**
 * Catat Cepat (AI). `POST /assistant/chat` (tosm-fi-be, Gemini di belakangnya) mengubah
 * percakapan jadi draft; `POST /assistant/commit` menyimpan batch pratinjau dalam satu
 * transaksi database.
 */
export class AssistantError extends Error {
  kind: AssistantErrorKind;

  constructor(
    kind: AssistantErrorKind,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.kind = kind;
  }
}

/** Commit yang ditolak backend; `idDraft` = baris pratinjau penyebabnya. */
export class AssistantCommitError extends Error {
  idDraft: string | null;

  constructor(message: string, idDraft: string | null, options?: ErrorOptions) {
    super(message, options);
    this.idDraft = idDraft;
  }
}

export async function sendAssistantChatApi(
  request: AssistantRequest,
): Promise<AssistantReply> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<AssistantReply>>(
      '/assistant/chat',
      request,
    );
    return data.data;
  } catch (error) {
    // 429 = kuota AI gratis habis / model sedang penuh ("AI lagi sibuk").
    // 403 PLAN_LIMIT = kuota pesan Catat Cepat user bulan ini habis.
    const response = axios.isAxiosError(error) ? error.response : undefined;
    const kind: AssistantErrorKind =
      response?.status === 429
        ? 'quota'
        : response?.status === 403 &&
          response.data?.data?.code === PLAN_LIMIT_CODE
        ? 'plan'
        : 'network';
    throw new AssistantError(
      kind,
      getApiErrorMessage(error, i18n.t('assistant.networkBody')),
      { cause: error },
    );
  }
}

export async function commitAssistantApi(
  drafts: AssistantDraft[],
  language: string,
): Promise<AssistantCommitResult> {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<AssistantCommitResult>
    >('/assistant/commit', {
      drafts,
      language,
      tzOffsetMinutes: new Date().getTimezoneOffset(),
    });
    return data.data;
  } catch (error) {
    const idDraft: string | null = axios.isAxiosError(error)
      ? error.response?.data?.data?.idDraft ?? null
      : null;
    throw new AssistantCommitError(
      getApiErrorMessage(error, i18n.t('transaction.genericError')),
      idDraft,
      { cause: error },
    );
  }
}
