import { api } from '@/lib/axios';
import type { DashboardSummary } from '@/types';

export interface TrendPoint {
  label: string;
  achievementPercent: number;
  growthPercent: number;
}

export const dashboardService = {
  summary: (params?: { year?: number; quarter?: string }) =>
    api.get<DashboardSummary>('/dashboard/summary', { params }).then((r) => r.data),

  trend: (params: { timeframe: 'quarterly' | 'yearly'; scope: 'all' | 'category' | 'kpi'; id?: number; year?: number }) =>
    api.get<{ series: TrendPoint[] }>('/dashboard/trend', { params }).then((r) => r.data.series),
};
