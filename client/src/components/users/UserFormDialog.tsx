import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import type { ManagedUser } from '@/types';

const createSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'أحرف إنجليزية وأرقام فقط'),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'),
  role: z.enum(['admin', 'viewer']),
});

const editSchema = z.object({
  username: z.string().optional(),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل').optional().or(z.literal('')),
  role: z.enum(['admin', 'viewer']),
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ManagedUser | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = !!user;
  const schema = isEdit ? editSchema : createSchema;
  type FormValues = z.infer<typeof createSchema>;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', fullName: '', password: '', role: 'viewer' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: user?.username ?? '',
        fullName: user?.full_name ?? '',
        password: '',
        role: user?.role ?? 'viewer',
      });
    }
  }, [open, user, form]);

  async function onSubmit(values: FormValues) {
    if (isEdit && user) {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          fullName: values.fullName,
          role: values.role,
          password: values.password ? values.password : undefined,
        },
      });
    } else {
      await createMutation.mutateAsync({
        username: values.username,
        fullName: values.fullName,
        password: values.password,
        role: values.role,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'تعديل بيانات المستخدم وصلاحيته'
              : 'حساب admin يملك وصولًا كاملًا للنظام، وحساب viewer يشاهد صفحة النتائج فقط'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستخدم</FormLabel>
                  <FormControl>
                    <Input placeholder="username" dir="ltr" disabled={isEdit} {...field} />
                  </FormControl>
                  {isEdit && <FormDescription>لا يمكن تغيير اسم المستخدم بعد الإنشاء</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أحمد سعيد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصلاحية</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">مدير (وصول كامل للنظام)</SelectItem>
                      <SelectItem value="viewer">مستخدم عرض (صفحة النتائج فقط)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}</FormLabel>
                  <FormControl>
                    <Input type="password" dir="ltr" placeholder="••••••••" {...field} />
                  </FormControl>
                  {isEdit && <FormDescription>اتركها فارغة للإبقاء على كلمة المرور الحالية</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المستخدم'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
