import { api } from '@/lib/axios';
import type { CostCenter, Quarter } from '@/types';

export interface CostCenterInput {
  item: string;
  amount: number;
  date: string;
  year: number;
  quarter: Quarter;
  notes?: string | null;
}

export const costCenterService = {
  list: (params?: { year?: number; quarter?: string }) =>
    api.get<CostCenter[]>('/cost-centers', { params }).then((r) => r.data),

  create: (data: CostCenterInput) => api.post<CostCenter>('/cost-centers', data).then((r) => r.data),

  update: (id: number, data: Partial<CostCenterInput>) =>
    api.put<CostCenter>(`/cost-centers/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/cost-centers/${id}`),
};
