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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreatePlanItem, useUpdatePlanItem } from '@/hooks/usePlanItems';
import type { PlanItem, PlanSection } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'عنوان البند مطلوب'),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PlanItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: PlanSection;
  item?: PlanItem | null;
}

export function PlanItemFormDialog({ open, onOpenChange, section, item }: PlanItemFormDialogProps) {
  const isEdit = !!item;
  const createMutation = useCreatePlanItem(section);
  const updateMutation = useUpdatePlanItem(section);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', details: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: item?.title ?? '', details: item?.details ?? '' });
    }
  }, [open, item, form]);

  async function onSubmit(values: FormValues) {
    if (isEdit && item) {
      await updateMutation.mutateAsync({ id: item.id, data: { title: values.title, details: values.details || null } });
    } else {
      await createMutation.mutateAsync({ section, title: values.title, details: values.details || null });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل البند' : 'إضافة بند جديد'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان البند</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: الرؤية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تفاصيل البند</FormLabel>
                  <FormControl>
                    <Textarea placeholder="نص تفاصيل البند" rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة البند'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
