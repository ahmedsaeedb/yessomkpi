import { api } from '@/lib/axios';
import type { DashboardSummary } from '@/types';

export const dashboardService = {
  summary: (params?: { year?: number; quarter?: string }) =>
    api.get<DashboardSummary>('/dashboard/summary', { params }).then((r) => r.data),
};
