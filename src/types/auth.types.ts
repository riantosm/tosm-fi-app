export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterInput {
  nameUser: string;
  username: string;
  password: string;
}

export interface UpdateProfileInput {
  nameUser: string;
  username: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'active';

export interface AuthUser {
  idUser: string;
  nameUser: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  /** Akun demo bersama: backend menolak reset data dan ganti username. */
  isDemo?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
