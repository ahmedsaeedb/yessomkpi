import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roiService, type RoiEntryInput } from '@/services/roiService';
import { extractErrorMessage } from '@/lib/axios';

export function useRoiEntries(params?: { year?: number; quarter?: string }) {
  return useQuery({
    queryKey: ['roi', params],
    queryFn: () => roiService.list(params),
  });
}

export function useCreateRoiEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoiEntryInput) => roiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roi'] });
      toast.success('تمت إضافة البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة البند')),
  });
}

export function useUpdateRoiEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoiEntryInput> }) => roiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roi'] });
      toast.success('تم تحديث البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث البند')),
  });
}

export function useDeleteRoiEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roiService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roi'] });
      toast.success('تم حذف البند بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف البند')),
  });
}
