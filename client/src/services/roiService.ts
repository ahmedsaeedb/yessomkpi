import { api } from '@/lib/axios';
import type { RoiEntry, Quarter } from '@/types';

export interface RoiEntryInput {
  date: string;
  year: number;
  quarter: Quarter;
  channel: string;
  amount: number;
  spend: number;
  notes?: string | null;
}

export const roiService = {
  list: (params?: { year?: number; quarter?: string }) =>
    api.get<RoiEntry[]>('/roi', { params }).then((r) => r.data),

  create: (data: RoiEntryInput) => api.post<RoiEntry>('/roi', data).then((r) => r.data),

  update: (id: number, data: Partial<RoiEntryInput>) =>
    api.put<RoiEntry>(`/roi/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/roi/${id}`),
};
