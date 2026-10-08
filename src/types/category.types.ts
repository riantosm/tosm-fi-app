export type CategoryType = 'income' | 'expense';

export interface SubCategory {
  idSubCategory: string;
  idCategory: string;
  nameSubCategory: string;
  icon: string;
  transactionCount: number;
}

export interface Category {
  idCategory: string;
  nameCategory: string;
  type: CategoryType;
  color: string;
  icon: string;
  transactionCount: number;
  subCategories: SubCategory[];
}

export interface CategoryInput {
  nameCategory: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface SubCategoryInput {
  nameSubCategory: string;
  icon: string;
}
