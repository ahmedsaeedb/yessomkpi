import { api } from '@/lib/axios';
import type { CorrectiveAction, RiskLevel } from '@/types';

export interface CorrectiveActionInput {
  riskType: string;
  probability: RiskLevel;
  impact: RiskLevel;
  riskLevel: RiskLevel;
  treatment?: string | null;
  responsible?: string | null;
  sortOrder?: number;
}

export const correctiveActionService = {
  list: () => api.get<CorrectiveAction[]>('/corrective-actions').then((r) => r.data),

  create: (data: CorrectiveActionInput) =>
    api.post<CorrectiveAction>('/corrective-actions', data).then((r) => r.data),

  update: (id: number, data: Partial<CorrectiveActionInput>) =>
    api.put<CorrectiveAction>(`/corrective-actions/${id}`, data).then((r) => r.data),

  remove: (id: number) => api.delete(`/corrective-actions/${id}`),
};
