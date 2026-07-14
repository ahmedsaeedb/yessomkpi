import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useUpsertKpiValue } from '@/hooks/useKpiValues';
import { calculateKpiMetrics } from '@/lib/calculations';
import { formatNumber, quarterLabel } from '@/lib/utils';
import type { Kpi, KpiValue, Quarter } from '@/types';

const schema = z.object({
  currentValue: z.coerce.number(),
  previousValue: z.coerce.number(),
  target: z.coerce.number(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface QuarterValueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi: Kpi | null;
  existingValue?: KpiValue | null;
  year: number;
  quarter: Quarter;
}

export function QuarterValueFormDialog({
  open,
  onOpenChange,
  kpi,
  existingValue,
  year,
  quarter,
}: QuarterValueFormDialogProps) {
  const upsertMutation = useUpsertKpiValue();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentValue: 0, previousValue: 0, target: 0, notes: '' },
  });

  useEffect(() => {
    if (open && kpi) {
      form.reset({
        currentValue: existingValue?.current_value ?? 0,
        previousValue: existingValue?.previous_value ?? 0,
        target: existingValue?.target ?? kpi.target,
        notes: existingValue?.notes ?? '',
      });
    }
  }, [open, kpi, existingValue, form]);

  const watched = form.watch();
  const metrics = useMemo(
    () => calculateKpiMetrics(Number(watched.currentValue) || 0, Number(watched.previousValue) || 0, Number(watched.target) || 0),
    [watched.currentValue, watched.previousValue, watched.target]
  );

  async function onSubmit(values: FormValues) {
    if (!kpi) return;
    await upsertMutation.mutateAsync({
      kpiId: kpi.id,
      year,
      quarter,
      currentValue: values.currentValue,
      previousValue: values.previousValue,
      target: values.target,
      notes: values.notes || null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{kpi?.name}</DialogTitle>
          <DialogDescription>
            بيانات {quarterLabel(quarter)} لعام {year}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة الحالية</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="previousValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة السابقة</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="ملاحظات حول أداء هذا الربع" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">نسبة النمو</p>
                <p className="text-sm font-bold tabular-nums">{formatNumber(metrics.growthPercent)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                <p className="text-sm font-bold tabular-nums">{formatNumber(metrics.achievementPercent)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الحالة</p>
                <div className="mt-1 flex justify-center">
                  <StatusBadge status={metrics.status} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ البيانات'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
