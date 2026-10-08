/** Envelope semua response tosm-fi-be: `{ message, data, isSuccess, status }`. */
export interface ApiResponse<T> {
  message: string;
  data: T;
  isSuccess: boolean;
  status: number;
}
