import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costCenterService, type CostCenterInput } from '@/services/costCenterService';
import { extractErrorMessage } from '@/lib/axios';

export function useCostCenters(params?: { year?: number; quarter?: string }) {
  return useQuery({
    queryKey: ['cost-centers', params],
    queryFn: () => costCenterService.list(params),
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CostCenterInput) => costCenterService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تمت إضافة البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة البند')),
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostCenterInput> }) =>
      costCenterService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم تحديث البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث البند')),
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costCenterService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم حذف البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف البند')),
  });
}
