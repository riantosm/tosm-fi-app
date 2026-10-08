export interface InvestmentAccount {
  idInvestmentAccount: string;
  idInstrument: string;
  nameInvestmentAccount: string;
  investedAmount: number;
  currentValue: number;
  /** Soft-delete (tetap disimpan untuk label riwayat transaksi investasi), disembunyikan dari daftar akun aktif. */
  isDeleted: boolean;
}

export interface Instrument {
  idInstrument: string;
  nameInstrument: string;
  color: string;
  investmentAccounts: InvestmentAccount[];
}

export interface InstrumentInput {
  nameInstrument: string;
  color: string;
}

export interface InvestmentAccountInput {
  nameInvestmentAccount: string;
}
