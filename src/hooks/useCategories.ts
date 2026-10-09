import { useCallback, useEffect } from 'react';
import {
  createCategoryApi,
  createSubCategoryApi,
  deleteCategoryApi,
  deleteSubCategoryApi,
  getCategoriesApi,
  reorderCategoriesApi,
  reorderSubCategoriesApi,
  updateCategoryApi,
  updateSubCategoryApi,
} from '@/services/api/category.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addCategory,
  addSubCategory,
  removeCategory,
  removeSubCategory,
  setCategories,
  setCategoriesFailed,
  setCategoriesLoading,
  setSubCategoryOrder,
  updateCategory,
  updateSubCategory,
} from '@/store/slices/categorySlice';
import type { CategoryInput, SubCategoryInput } from '@/types';

/** Kategori + subkategori dari store. Memuat otomatis sekali saat status masih `idle`. */
export function useCategories({
  autoLoad = true,
}: { autoLoad?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(state => state.category.categories);
  const status = useAppSelector(state => state.category.status);

  const loadCategories = useCallback(async () => {
    dispatch(setCategoriesLoading());
    try {
      dispatch(setCategories(await getCategoriesApi()));
    } catch {
      dispatch(setCategoriesFailed());
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      loadCategories();
    }
  }, [autoLoad, status, loadCategories]);

  /** Mengembalikan kategori baru (dipakai pemilih kategori untuk langsung memilihnya). */
  const createCategory = useCallback(
    async (input: CategoryInput) => {
      const created = await createCategoryApi(input);
      dispatch(addCategory(created));
      return created;
    },
    [dispatch],
  );

  const editCategory = useCallback(
    async (idCategory: string, input: CategoryInput) => {
      dispatch(updateCategory(await updateCategoryApi(idCategory, input)));
    },
    [dispatch],
  );

  const deleteCategory = useCallback(
    async (idCategory: string) => {
      await deleteCategoryApi(idCategory);
      dispatch(removeCategory(idCategory));
    },
    [dispatch],
  );

  const reorderCategories = useCallback(
    async (orderedIds: string[]) => {
      dispatch(setCategories(await reorderCategoriesApi(orderedIds)));
    },
    [dispatch],
  );

  const createSubCategory = useCallback(
    async (idCategory: string, input: SubCategoryInput) => {
      const created = await createSubCategoryApi(idCategory, input);
      dispatch(addSubCategory({ idCategory, subCategory: created }));
      return created;
    },
    [dispatch],
  );

  const editSubCategory = useCallback(
    async (
      idCategory: string,
      idSubCategory: string,
      input: SubCategoryInput,
    ) => {
      const updated = await updateSubCategoryApi(
        idCategory,
        idSubCategory,
        input,
      );
      dispatch(updateSubCategory({ idCategory, subCategory: updated }));
    },
    [dispatch],
  );

  const deleteSubCategory = useCallback(
    async (idCategory: string, idSubCategory: string) => {
      await deleteSubCategoryApi(idCategory, idSubCategory);
      dispatch(removeSubCategory({ idCategory, idSubCategory }));
    },
    [dispatch],
  );

  const reorderSubCategories = useCallback(
    async (idCategory: string, orderedIds: string[]) => {
      const subCategories = await reorderSubCategoriesApi(
        idCategory,
        orderedIds,
      );
      dispatch(setSubCategoryOrder({ idCategory, subCategories }));
    },
    [dispatch],
  );

  return {
    categories,
    status,
    loadCategories,
    createCategory,
    editCategory,
    deleteCategory,
    reorderCategories,
    createSubCategory,
    editSubCategory,
    deleteSubCategory,
    reorderSubCategories,
  };
}
