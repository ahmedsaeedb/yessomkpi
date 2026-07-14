import { api } from '@/lib/axios';
import type { KpiValue, Quarter } from '@/types';

export interface KpiValueInput {
  kpiId: number;
  year: number;
  quarter: Quarter;
  currentValue: number;
  previousValue: number;
  target: number;
  notes?: string | null;
}

export const kpiValueService = {
  list: (params?: { kpiId?: number; year?: number; quarter?: string; categoryId?: number }) =>
    api.get<KpiValue[]>('/kpi-values', { params }).then((r) => r.data),

  get: (id: number) => api.get<KpiValue>(`/kpi-values/${id}`).then((r) => r.data),

  upsert: (data: KpiValueInput) => api.post<KpiValue>('/kpi-values', data).then((r) => r.data),

  remove: (id: number) => api.delete(`/kpi-values/${id}`),
};
