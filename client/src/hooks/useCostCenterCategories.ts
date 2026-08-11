import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costCenterCategoryService, type CostCenterCategoryInput } from '@/services/costCenterCategoryService';
import { extractErrorMessage } from '@/lib/axios';

export function useCostCenterCategories() {
  return useQuery({
    queryKey: ['cost-center-categories'],
    queryFn: () => costCenterCategoryService.list(),
  });
}

export function useCreateCostCenterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CostCenterCategoryInput) => costCenterCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-categories'] });
      toast.success('تمت إضافة التصنيف بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة التصنيف')),
  });
}

export function useUpdateCostCenterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostCenterCategoryInput> }) =>
      costCenterCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-categories'] });
      toast.success('تم تحديث التصنيف بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث التصنيف')),
  });
}

export function useDeleteCostCenterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costCenterCategoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-categories'] });
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('تم حذف التصنيف بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف التصنيف')),
  });
}
