import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService, type UserInput, type UserUpdateInput } from '@/services/userService';
import { extractErrorMessage } from '@/lib/axios';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserInput) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('تمت إضافة المستخدم بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذرت إضافة المستخدم')),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateInput }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('تم تحديث المستخدم بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تحديث المستخدم')),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('تم حذف المستخدم بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حذف المستخدم')),
  });
}
