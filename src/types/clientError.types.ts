export type ClientErrorEnvironment = 'development' | 'production';

export interface ClientError {
  idClientError: string;
  idUser: string | null;
  username: string | null;
  source: string;
  environment: ClientErrorEnvironment;
  message: string;
  stack?: string;
  path?: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface ClientErrorInput {
  source: string;
  environment: ClientErrorEnvironment;
  message: string;
  stack?: string;
  path?: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
}

export interface ClientErrorListParams {
  search?: string;
  environment?: ClientErrorEnvironment;
  source?: string;
}
