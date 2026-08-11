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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateRoiEntry, useUpdateRoiEntry } from '@/hooks/useRoi';
import { quarterLabel } from '@/lib/utils';
import type { RoiEntry, Quarter } from '@/types';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);

const schema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  year: z.coerce.number().int(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  channel: z.string().min(1, 'قناة الاستثمار مطلوبة'),
  amount: z.coerce.number().default(0),
  spend: z.coerce.number().default(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RoiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: RoiEntry | null;
}

export function RoiFormDialog({ open, onOpenChange, entry }: RoiFormDialogProps) {
  const isEdit = !!entry;
  const createMutation = useCreateRoiEntry();
  const updateMutation = useUpdateRoiEntry();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      year: CURRENT_YEAR,
      quarter: 'Q1',
      channel: '',
      amount: 0,
      spend: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        date: entry?.date ?? new Date().toISOString().slice(0, 10),
        year: entry?.year ?? CURRENT_YEAR,
        quarter: entry?.quarter ?? 'Q1',
        channel: entry?.channel ?? '',
        amount: entry?.amount ?? 0,
        spend: entry?.spend ?? 0,
        notes: entry?.notes ?? '',
      });
    }
  }, [open, entry, form]);

  const amount = form.watch('amount');
  const spend = form.watch('spend');
  const roiPercent = spend ? ((amount - spend) / spend) * 100 : null;

  async function onSubmit(values: FormValues) {
    const payload = {
      date: values.date,
      year: values.year,
      quarter: values.quarter,
      channel: values.channel,
      amount: values.amount,
      spend: values.spend,
      notes: values.notes || null,
    };

    if (isEdit && entry) {
      await updateMutation.mutateAsync({ id: entry.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل بند العائد على الاستثمار' : 'إضافة بند عائد على الاستثمار'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قناة الاستثمار</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: إعلانات قوقل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العائد (المبلغ)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المدفوع على القناة</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {roiPercent !== null && (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                نسبة العائد على الاستثمار:{' '}
                <span className={`font-bold tabular-nums ${roiPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {roiPercent.toFixed(2)}%
                </span>
              </p>
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السنة</FormLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
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
                name="quarter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الربع</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUARTERS.map((q) => (
                          <SelectItem key={q} value={q}>
                            {quarterLabel(q)}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية" rows={2} {...field} />
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
