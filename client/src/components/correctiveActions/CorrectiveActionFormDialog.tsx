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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateCorrectiveAction, useUpdateCorrectiveAction } from '@/hooks/useCorrectiveActions';
import { RISK_LEVEL_LABELS } from './RiskLevelBadge';
import type { CorrectiveAction, RiskLevel } from '@/types';

const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

const schema = z.object({
  riskType: z.string().min(1, 'نوع الخطر مطلوب'),
  probability: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  treatment: z.string().optional(),
  responsible: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CorrectiveActionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: CorrectiveAction | null;
}

export function CorrectiveActionFormDialog({ open, onOpenChange, action }: CorrectiveActionFormDialogProps) {
  const isEdit = !!action;
  const createMutation = useCreateCorrectiveAction();
  const updateMutation = useUpdateCorrectiveAction();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      riskType: '',
      probability: 'medium',
      impact: 'medium',
      riskLevel: 'medium',
      treatment: '',
      responsible: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        riskType: action?.risk_type ?? '',
        probability: action?.probability ?? 'medium',
        impact: action?.impact ?? 'medium',
        riskLevel: action?.risk_level ?? 'medium',
        treatment: action?.treatment ?? '',
        responsible: action?.responsible ?? '',
      });
    }
  }, [open, action, form]);

  async function onSubmit(values: FormValues) {
    const payload = {
      riskType: values.riskType,
      probability: values.probability,
      impact: values.impact,
      riskLevel: values.riskLevel,
      treatment: values.treatment || null,
      responsible: values.responsible || null,
    };

    if (isEdit && action) {
      await updateMutation.mutateAsync({ id: action.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل إجراء تصحيحي' : 'إضافة إجراء تصحيحي'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="riskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الخطر</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: تأخر تسليم الحملات" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاحتمالية</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {RISK_LEVEL_LABELS[l]}
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
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التأثير</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {RISK_LEVEL_LABELS[l]}
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
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مستوى الخطر</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {RISK_LEVEL_LABELS[l]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آلية المعالجة</FormLabel>
                  <FormControl>
                    <Input placeholder="كيف تتم معالجة هذا الخطر" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الجهة المسؤولة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: قسم التسويق الرقمي" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة الإجراء'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
