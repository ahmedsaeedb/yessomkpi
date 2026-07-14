import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryService, type CategoryInput } from '@/services/categoryService';
import { extractErrorMessage } from '@/lib/axios';

export function useCategories(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.list(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تمت إضافة الفئة بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة الفئة')),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryInput> }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم تحديث الفئة بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث الفئة')),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم حذف الفئة بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف الفئة')),
  });
}
