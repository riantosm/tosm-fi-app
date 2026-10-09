/** Envelope semua response tosm-fi-be: `{ message, data, isSuccess, status }`. */
export interface ApiResponse<T> {
  message: string;
  data: T;
  isSuccess: boolean;
  status: number;
}

/** Status muat data slice: `idle` = belum pernah dimuat. */
export type LoadStatus = 'idle' | 'loading' | 'loaded';
