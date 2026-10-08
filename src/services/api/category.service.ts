import i18n from '@/i18n';
import {
  axiosInstance,
  getApiErrorMessage,
} from '@/services/api/axiosInstance';
import type {
  ApiResponse,
  Category,
  CategoryInput,
  SubCategory,
  SubCategoryInput,
} from '@/types';

export async function getCategoriesApi(): Promise<Category[]> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<Category[]>>(
      '/categories',
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function createCategoryApi(
  input: CategoryInput,
): Promise<Category> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<Category>>(
      '/categories',
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function updateCategoryApi(
  idCategory: string,
  input: CategoryInput,
): Promise<Category> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Category>>(
      `/categories/${idCategory}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function deleteCategoryApi(idCategory: string): Promise<void> {
  try {
    await axiosInstance.delete(`/categories/${idCategory}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function reorderCategoriesApi(
  orderedIds: string[],
): Promise<Category[]> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<Category[]>>(
      '/categories/reorder',
      { orderedIds },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function createSubCategoryApi(
  idCategory: string,
  input: SubCategoryInput,
): Promise<SubCategory> {
  try {
    const { data } = await axiosInstance.post<ApiResponse<SubCategory>>(
      `/categories/${idCategory}/subcategories`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function updateSubCategoryApi(
  idCategory: string,
  idSubCategory: string,
  input: SubCategoryInput,
): Promise<SubCategory> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<SubCategory>>(
      `/categories/${idCategory}/subcategories/${idSubCategory}`,
      input,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function deleteSubCategoryApi(
  idCategory: string,
  idSubCategory: string,
): Promise<void> {
  try {
    await axiosInstance.delete(
      `/categories/${idCategory}/subcategories/${idSubCategory}`,
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}

export async function reorderSubCategoriesApi(
  idCategory: string,
  orderedIds: string[],
): Promise<SubCategory[]> {
  try {
    const { data } = await axiosInstance.patch<ApiResponse<SubCategory[]>>(
      `/categories/${idCategory}/subcategories/reorder`,
      { orderedIds },
    );
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, i18n.t('category.genericError')),
      { cause: error },
    );
  }
}
