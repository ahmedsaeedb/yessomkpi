import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard(params?: { year?: number; quarter?: string }) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => dashboardService.summary(params),
    refetchInterval: 60_000,
  });
}
