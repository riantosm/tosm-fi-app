export interface WalletAccount {
  idWallet: string;
  nameWallet: string;
  color: string;
  balance: number;
  transactionCount: number;
  isPrimary: boolean;
}

export interface WalletInput {
  nameWallet: string;
  color: string;
  balance?: number;
}
