import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { kpiValueService, type KpiValueInput } from '@/services/kpiValueService';
import { extractErrorMessage } from '@/lib/axios';

export function useKpiValues(params?: { kpiId?: number; year?: number; quarter?: string; categoryId?: number }) {
  return useQuery({
    queryKey: ['kpi-values', params],
    queryFn: () => kpiValueService.list(params),
  });
}

export function useUpsertKpiValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KpiValueInput) => kpiValueService.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-values'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم حفظ البيانات الفصلية بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حفظ البيانات')),
  });
}

export function useDeleteKpiValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => kpiValueService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-values'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('تم حذف البيانات بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف البيانات')),
  });
}
