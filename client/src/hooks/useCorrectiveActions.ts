import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { correctiveActionService, type CorrectiveActionInput } from '@/services/correctiveActionService';
import { extractErrorMessage } from '@/lib/axios';

export function useCorrectiveActions() {
  return useQuery({
    queryKey: ['corrective-actions'],
    queryFn: () => correctiveActionService.list(),
  });
}

export function useCreateCorrectiveAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CorrectiveActionInput) => correctiveActionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions'] });
      toast.success('تمت إضافة البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة البند')),
  });
}

export function useUpdateCorrectiveAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CorrectiveActionInput> }) =>
      correctiveActionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions'] });
      toast.success('تم تحديث البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث البند')),
  });
}

export function useDeleteCorrectiveAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => correctiveActionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions'] });
      toast.success('تم حذف البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف البند')),
  });
}
