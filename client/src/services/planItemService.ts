import { api } from '@/lib/axios';
import type { PlanItem, PlanSection } from '@/types';

export interface PlanItemInput {
  section: PlanSection;
  title: string;
  details?: string | null;
  sortOrder?: number;
}

export const planItemService = {
  list: (section: PlanSection) =>
    api.get<PlanItem[]>('/plan-items', { params: { section } }).then((r) => r.data),

  create: (data: PlanItemInput) => api.post<PlanItem>('/plan-items', data).then((r) => r.data),

  update: (id: number, data: Partial<PlanItemInput>) =>
    api.put<PlanItem>(`/plan-items/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/plan-items/${id}`),
};
