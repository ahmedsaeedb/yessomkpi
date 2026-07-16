import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useKpis } from '@/hooks/useKpis';
import { DEFAULT_RESULTS_CONFIG } from '@/lib/resultsConfig';
import type { ResultsConfig } from '@/types';

const schema = z.object({
  showStats: z.boolean(),
  quarterTrend: z.object({ visible: z.boolean(), chartType: z.enum(['area', 'line', 'bar']) }),
  radialGauge: z.object({ visible: z.boolean() }),
  yearComparison: z.object({ visible: z.boolean(), chartType: z.enum(['bar', 'line']) }),
  topCategories: z.object({
    visible: z.boolean(),
    chartType: z.enum(['bar', 'donut']),
    mode: z.enum(['auto', 'manual']),
    categoryIds: z.array(z.number()),
  }),
  topKpis: z.object({
    visible: z.boolean(),
    mode: z.enum(['auto', 'manual']),
    kpiIds: z.array(z.number()),
  }),
});

type FormValues = z.infer<typeof schema>;

function SectionCard({
  title,
  description,
  visible,
  onVisibleChange,
  children,
}: {
  title: string;
  description: string;
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Switch checked={visible} onCheckedChange={onVisibleChange} />
      </CardHeader>
      {children && visible && <CardContent className="space-y-4">{children}</CardContent>}
    </Card>
  );
}

export default function DisplaySettings() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const { data: categories } = useCategories({ status: 'active' });
  const { data: kpis } = useKpis({ status: 'active' });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_RESULTS_CONFIG,
  });

  useEffect(() => {
    if (settings?.resultsConfig) {
      form.reset(settings.resultsConfig);
    }
  }, [settings, form]);

  const values = form.watch();

  async function onSubmit(data: FormValues) {
    await updateMutation.mutateAsync({ resultsConfig: data as ResultsConfig });
  }

  function toggleCategory(id: number) {
    const current = form.getValues('topCategories.categoryIds');
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    form.setValue('topCategories.categoryIds', next, { shouldDirty: true });
  }

  function toggleKpi(id: number) {
    const current = form.getValues('topKpis.kpiIds');
    const next = current.includes(id) ? current.filter((k) => k !== id) : [...current, id];
    form.setValue('topKpis.kpiIds', next, { shouldDirty: true });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="تخصيص صفحة النتائج"
        description="تحكم بالأقسام والرسومات البيانية الظاهرة لمستخدمي العرض في صفحة النتائج"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SectionCard
            title="بطاقات الإحصائيات العلوية"
            description="عدد الفئات والمؤشرات ومتوسط الإنجاز والنمو"
            visible={values.showStats}
            onVisibleChange={(v) => form.setValue('showStats', v, { shouldDirty: true })}
          />

          <SectionCard
            title="مقارنة الأداء الفصلي"
            description="رسم بياني لأداء الأرباع الأربعة خلال السنة"
            visible={values.quarterTrend.visible}
            onVisibleChange={(v) => form.setValue('quarterTrend.visible', v, { shouldDirty: true })}
          >
            <FormField
              control={form.control}
              name="quarterTrend.chartType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الرسم البياني</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="area">مساحي (Area)</SelectItem>
                      <SelectItem value="line">خطي (Line)</SelectItem>
                      <SelectItem value="bar">أعمدة (Bar)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </SectionCard>

          <SectionCard
            title="مؤشر الأداء العام الدائري"
            description="نسبة الإنجاز الإجمالية بشكل مقياس دائري"
            visible={values.radialGauge.visible}
            onVisibleChange={(v) => form.setValue('radialGauge.visible', v, { shouldDirty: true })}
          />

          <SectionCard
            title="مقارنة الأداء السنوي"
            description="رسم بياني لمقارنة نسبة الإنجاز عبر السنوات"
            visible={values.yearComparison.visible}
            onVisibleChange={(v) => form.setValue('yearComparison.visible', v, { shouldDirty: true })}
          >
            <FormField
              control={form.control}
              name="yearComparison.chartType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الرسم البياني</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bar">أعمدة (Bar)</SelectItem>
                      <SelectItem value="line">خطي (Line)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </SectionCard>

          <SectionCard
            title="أفضل الفئات أداءً"
            description="عرض الفئات الأعلى إنجازًا مع إمكانية اختيار فئات محددة يدويًا"
            visible={values.topCategories.visible}
            onVisibleChange={(v) => form.setValue('topCategories.visible', v, { shouldDirty: true })}
          >
            <FormField
              control={form.control}
              name="topCategories.chartType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الرسم البياني</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bar">أعمدة (Bar)</SelectItem>
                      <SelectItem value="donut">دائري (Donut)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topCategories.mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة الاختيار</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">تلقائي (الأفضل أداءً)</SelectItem>
                      <SelectItem value="manual">يدوي (اختيار محدد)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {values.topCategories.mode === 'manual' && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">اختر الفئات التي تريد إظهارها:</p>
                <div className="flex flex-wrap gap-2">
                  {categories?.map((c) => {
                    const checked = values.topCategories.categoryIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCategory(c.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                  {categories?.length === 0 && <p className="text-xs text-muted-foreground">لا توجد فئات نشطة</p>}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="أفضل المؤشرات أداءً"
            description="عرض قائمة المؤشرات الأعلى إنجازًا مع إمكانية اختيار مؤشرات محددة يدويًا"
            visible={values.topKpis.visible}
            onVisibleChange={(v) => form.setValue('topKpis.visible', v, { shouldDirty: true })}
          >
            <FormField
              control={form.control}
              name="topKpis.mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة الاختيار</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">تلقائي (الأفضل أداءً)</SelectItem>
                      <SelectItem value="manual">يدوي (اختيار محدد)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {values.topKpis.mode === 'manual' && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">اختر المؤشرات التي تريد إظهارها:</p>
                <div className="flex flex-wrap gap-2">
                  {kpis?.map((k) => {
                    const checked = values.topKpis.kpiIds.includes(k.id);
                    return (
                      <button
                        type="button"
                        key={k.id}
                        onClick={() => toggleKpi(k.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                        }`}
                      >
                        {k.name}
                      </button>
                    );
                  })}
                  {kpis?.length === 0 && <p className="text-xs text-muted-foreground">لا توجد مؤشرات نشطة</p>}
                </div>
              </div>
            )}
          </SectionCard>

          <Separator />

          <div className="flex justify-start">
            <Button type="submit" size="lg" disabled={updateMutation.isPending} className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              {updateMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التخصيص'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
