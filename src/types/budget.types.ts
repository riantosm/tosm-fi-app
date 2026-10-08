export interface BudgetChildLimit {
  idCategory: string;
  /** `null` = limit level kategori itu sendiri (hanya pada budget "semua kategori"). */
  idSubCategory: string | null;
  limitAmount: number;
}

export interface Budget {
  idBudget: string;
  name: string;
  color: string;
  /** Array kosong = mencakup semua kategori pengeluaran; isi = dibatasi ke kategori tersebut. */
  idCategories: string[];
  limitAmount: number;
  childLimits: BudgetChildLimit[];
  /** Tampil di widget budget Dashboard jika true. */
  isPinned: boolean;
}

export type BudgetInput = Omit<Budget, 'idBudget'>;
