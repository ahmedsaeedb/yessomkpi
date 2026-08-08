import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planItemService, type PlanItemInput } from '@/services/planItemService';
import { extractErrorMessage } from '@/lib/axios';
import type { PlanSection } from '@/types';

export function usePlanItems(section: PlanSection) {
  return useQuery({
    queryKey: ['plan-items', section],
    queryFn: () => planItemService.list(section),
  });
}

export function useCreatePlanItem(section: PlanSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanItemInput) => planItemService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', section] });
      toast.success('تمت إضافة البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة البند')),
  });
}

export function useUpdatePlanItem(section: PlanSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlanItemInput> }) =>
      planItemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', section] });
      toast.success('تم تحديث البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث البند')),
  });
}

export function useDeletePlanItem(section: PlanSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => planItemService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-items', section] });
      toast.success('تم حذف البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف البند')),
  });
}
