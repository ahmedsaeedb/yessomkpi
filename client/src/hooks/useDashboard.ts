import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard(params?: { year?: number; quarter?: string }) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => dashboardService.summary(params),
    refetchInterval: 60_000,
  });
}

export function useTrendData(params: {
  timeframe: 'quarterly' | 'yearly';
  scope: 'all' | 'category' | 'kpi';
  id?: number;
  year?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: ['dashboard-trend', query],
    queryFn: () => dashboardService.trend(query),
    enabled,
  });
}
