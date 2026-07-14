import { api } from '@/lib/axios';
import type { Category, Status } from '@/types';

export interface CategoryInput {
  name: string;
  description?: string | null;
  status?: Status;
  sortOrder?: number;
}

export const categoryService = {
  list: (params?: { search?: string; status?: string }) =>
    api.get<Category[]>('/categories', { params }).then((r) => r.data),

  get: (id: number) => api.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (data: CategoryInput) => api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: number, data: Partial<CategoryInput>) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/categories/${id}`),
};
