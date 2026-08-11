import { api } from '@/lib/axios';
import type { CostCenterCategory } from '@/types';

export interface CostCenterCategoryInput {
  name: string;
  sortOrder?: number;
}

export const costCenterCategoryService = {
  list: () => api.get<CostCenterCategory[]>('/cost-center-categories').then((r) => r.data),

  create: (data: CostCenterCategoryInput) =>
    api.post<CostCenterCategory>('/cost-center-categories', data).then((r) => r.data),

  update: (id: number, data: Partial<CostCenterCategoryInput>) =>
    api.put<CostCenterCategory>(`/cost-center-categories/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/cost-center-categories/${id}`),
};
