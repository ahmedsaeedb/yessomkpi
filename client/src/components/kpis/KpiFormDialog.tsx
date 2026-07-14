import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ColorPickerInput } from '@/components/shared/ColorPickerInput';
import { IconPicker } from '@/components/shared/IconPicker';
import { useCreateKpi, useUpdateKpi } from '@/hooks/useKpis';
import { useCategories } from '@/hooks/useCategories';
import type { Kpi } from '@/types';

const schema = z.object({
  categoryId: z.coerce.number().int().min(1, 'الفئة مطلوبة'),
  name: z.string().min(1, 'اسم المؤشر مطلوب'),
  description: z.string().optional(),
  unit: z.string().min(1, 'وحدة القياس مطلوبة'),
  target: z.coerce.number().default(0),
  color: z.string().min(1),
  icon: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
  status: z.boolean().default(true),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface KpiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi?: Kpi | null;
  defaultCategoryId?: number;
}

export function KpiFormDialog({ open, onOpenChange, kpi, defaultCategoryId }: KpiFormDialogProps) {
  const isEdit = !!kpi;
  const { data: categories } = useCategories();
  const createMutation = useCreateKpi();
  const updateMutation = useUpdateKpi();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: defaultCategoryId ?? 0,
      name: '',
      description: '',
      unit: 'رقم',
      target: 0,
      color: '#0B2545',
      icon: 'TrendingUp',
      sortOrder: 0,
      status: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        categoryId: kpi?.category_id ?? defaultCategoryId ?? 0,
        name: kpi?.name ?? '',
        description: kpi?.description ?? '',
        unit: kpi?.unit ?? 'رقم',
        target: kpi?.target ?? 0,
        color: kpi?.color ?? '#0B2545',
        icon: kpi?.icon ?? 'TrendingUp',
        sortOrder: kpi?.sort_order ?? 0,
        status: kpi ? kpi.status === 'active' : true,
        notes: kpi?.notes ?? '',
      });
    }
  }, [open, kpi, defaultCategoryId, form]);

  async function onSubmit(values: FormValues) {
    const payload = {
      categoryId: values.categoryId,
      name: values.name,
      description: values.description || null,
      unit: values.unit,
      target: values.target,
      color: values.color,
      icon: values.icon,
      sortOrder: values.sortOrder,
      status: (values.status ? 'active' : 'inactive') as 'active' | 'inactive',
      notes: values.notes || null,
    };

    if (isEdit && kpi) {
      await updateMutation.mutateAsync({ id: kpi.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المؤشر' : 'إضافة مؤشر جديد'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>الفئة</FormLabel>
                  <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>اسم المؤشر</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: عدد الزيارات للموقع" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="وصف مختصر للمؤشر" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وحدة القياس</FormLabel>
                  <FormControl>
                    <Input placeholder="زيارة، %، ريال..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المستهدف</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اللون</FormLabel>
                  <FormControl>
                    <ColorPickerInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الأيقونة</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} color={form.watch('color')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ترتيب العرض</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="ملاحظات إضافية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
                  <FormLabel className="cursor-pointer">تفعيل المؤشر</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المؤشر'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
