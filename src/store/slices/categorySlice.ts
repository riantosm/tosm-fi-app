import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { resetOnSignOut } from '@/store/slices/resetOnSignOut';
import type { Category, LoadStatus, SubCategory } from '@/types';

export interface CategoryState {
  categories: Category[];
  status: LoadStatus;
}

const initialState: CategoryState = { categories: [], status: 'idle' };

/** Kategori + subkategori (dipakai lintas layar). */
export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategoriesLoading: state => {
      state.status = 'loading';
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.status = 'loaded';
    },
    setCategoriesFailed: state => {
      state.status = 'loaded';
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        category => category.idCategory === action.payload.idCategory,
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        category => category.idCategory !== action.payload,
      );
    },
    addSubCategory: (
      state,
      action: PayloadAction<{ idCategory: string; subCategory: SubCategory }>,
    ) => {
      state.categories
        .find(item => item.idCategory === action.payload.idCategory)
        ?.subCategories.push(action.payload.subCategory);
    },
    updateSubCategory: (
      state,
      action: PayloadAction<{ idCategory: string; subCategory: SubCategory }>,
    ) => {
      const category = state.categories.find(
        item => item.idCategory === action.payload.idCategory,
      );
      const index =
        category?.subCategories.findIndex(
          sub => sub.idSubCategory === action.payload.subCategory.idSubCategory,
        ) ?? -1;
      if (category && index !== -1) {
        category.subCategories[index] = action.payload.subCategory;
      }
    },
    removeSubCategory: (
      state,
      action: PayloadAction<{ idCategory: string; idSubCategory: string }>,
    ) => {
      const category = state.categories.find(
        item => item.idCategory === action.payload.idCategory,
      );
      if (category) {
        category.subCategories = category.subCategories.filter(
          sub => sub.idSubCategory !== action.payload.idSubCategory,
        );
      }
    },
    setSubCategoryOrder: (
      state,
      action: PayloadAction<{
        idCategory: string;
        subCategories: SubCategory[];
      }>,
    ) => {
      const category = state.categories.find(
        item => item.idCategory === action.payload.idCategory,
      );
      if (category) {
        category.subCategories = action.payload.subCategories;
      }
    },
  },
  extraReducers: builder => resetOnSignOut(builder, initialState),
});

export const {
  setCategoriesLoading,
  setCategories,
  setCategoriesFailed,
  addCategory,
  updateCategory,
  removeCategory,
  addSubCategory,
  updateSubCategory,
  removeSubCategory,
  setSubCategoryOrder,
} = categorySlice.actions;

export default categorySlice.reducer;
