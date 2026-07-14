import { api } from '@/lib/axios';
import type { Kpi, Status } from '@/types';

export interface KpiInput {
  categoryId: number;
  name: string;
  description?: string | null;
  unit?: string;
  target?: number;
  color?: string;
  icon?: string;
  sortOrder?: number;
  status?: Status;
  notes?: string | null;
}

export const kpiService = {
  list: (params?: { search?: string; status?: string; categoryId?: number | string }) =>
    api.get<Kpi[]>('/kpis', { params }).then((r) => r.data),

  get: (id: number) => api.get<Kpi>(`/kpis/${id}`).then((r) => r.data),

  create: (data: KpiInput) => api.post<Kpi>('/kpis', data).then((r) => r.data),

  update: (id: number, data: Partial<KpiInput>) => api.put<Kpi>(`/kpis/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/kpis/${id}`),
};
