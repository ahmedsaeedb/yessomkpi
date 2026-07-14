import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { kpiService, type KpiInput } from '@/services/kpiService';
import { extractErrorMessage } from '@/lib/axios';

export function useKpis(params?: { search?: string; status?: string; categoryId?: number | string }) {
  return useQuery({
    queryKey: ['kpis', params],
    queryFn: () => kpiService.list(params),
  });
}

export function useCreateKpi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KpiInput) => kpiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تمت إضافة المؤشر بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة المؤشر')),
  });
}

export function useUpdateKpi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<KpiInput> }) => kpiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('تم تحديث المؤشر بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث المؤشر')),
  });
}

export function useDeleteKpi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => kpiService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم حذف المؤشر بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف المؤشر')),
  });
}
