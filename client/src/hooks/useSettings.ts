import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsService, type SettingsInput } from '@/services/settingsService';
import { extractErrorMessage } from '@/lib/axios';

export function useSettings(enabled = true) {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
    enabled,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: settingsService.getPublic,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsInput) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر حفظ الإعدادات')),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => settingsService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم رفع الشعار بنجاح');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر رفع الشعار')),
  });
}
