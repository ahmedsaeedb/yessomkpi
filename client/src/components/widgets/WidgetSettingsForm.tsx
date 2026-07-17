import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPickerInput } from '@/components/shared/ColorPickerInput';
import { IconPicker } from '@/components/shared/IconPicker';
import type { Category, Kpi, Widget } from '@/types';
import { cn } from '@/lib/utils';

interface WidgetSettingsFormProps {
  widget: Widget;
  categories: Category[];
  kpis: Kpi[];
  onChange: (widget: Widget) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ChipPicker<T extends { id: number; name: string }>({
  items,
  selected,
  onToggle,
}: {
  items: T[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border p-2 scrollbar-thin">
      {items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
            )}
          >
            {item.name}
          </button>
        );
      })}
      {items.length === 0 && <p className="text-xs text-muted-foreground">لا توجد عناصر</p>}
    </div>
  );
}

export function WidgetSettingsForm({ widget, categories, kpis, onChange }: WidgetSettingsFormProps) {
  function update<K extends keyof Widget>(patch: Partial<Widget>) {
    onChange({ ...widget, ...patch } as Widget);
  }

  return (
    <div className="space-y-4">
      <Field label="عنوان العنصر">
        <Input value={widget.title ?? ''} onChange={(e) => update({ title: e.target.value })} />
      </Field>

      {widget.type === 'stat' && (
        <>
          <Field label="مصدر القيمة">
            <Select value={widget.metric} onValueChange={(v) => update({ metric: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="categoriesCount">عدد الفئات النشطة</SelectItem>
                <SelectItem value="kpisCount">عدد المؤشرات النشطة</SelectItem>
                <SelectItem value="avgAchievement">متوسط نسبة الإنجاز العام</SelectItem>
                <SelectItem value="avgGrowth">متوسط نسبة النمو العام</SelectItem>
                <SelectItem value="categoryValue">فئة محددة - نسبة الإنجاز</SelectItem>
                <SelectItem value="kpiValue">مؤشر محدد</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {widget.metric === 'categoryValue' && (
            <Field label="اختر الفئة">
              <Select value={String(widget.categoryId ?? '')} onValueChange={(v) => update({ categoryId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {widget.metric === 'kpiValue' && (
            <>
              <Field label="اختر المؤشر">
                <Select value={String(widget.kpiId ?? '')} onValueChange={(v) => update({ kpiId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مؤشرًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {kpis.map((k) => (
                      <SelectItem key={k.id} value={String(k.id)}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="نوع القيمة المعروضة">
                <Select value={widget.kpiField ?? 'achievement'} onValueChange={(v) => update({ kpiField: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">القيمة الحالية</SelectItem>
                    <SelectItem value="target">المستهدف</SelectItem>
                    <SelectItem value="achievement">نسبة الإنجاز</SelectItem>
                    <SelectItem value="growth">نسبة النمو</SelectItem>
                    <SelectItem value="difference">الفرق عن المستهدف</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          <Field label="اللون">
            <ColorPickerInput value={widget.color ?? '#0B2545'} onChange={(v) => update({ color: v })} />
          </Field>
          <Field label="الأيقونة">
            <IconPicker value={widget.icon ?? 'BarChart3'} onChange={(v) => update({ icon: v })} color={widget.color} />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">إظهار نسبة التغيير</Label>
            <Switch checked={!!widget.showTrend} onCheckedChange={(v) => update({ showTrend: v })} />
          </div>
        </>
      )}

      {widget.type === 'trend' && (
        <>
          <Field label="المحور الزمني">
            <Select value={widget.timeframe} onValueChange={(v) => update({ timeframe: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">مقارنة الأرباع (سنة واحدة)</SelectItem>
                <SelectItem value="yearly">مقارنة السنوات (آخر 4 سنوات)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="نوع الرسم">
            <Select value={widget.chartType} onValueChange={(v) => update({ chartType: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">مساحي (Area)</SelectItem>
                <SelectItem value="line">خطي (Line)</SelectItem>
                <SelectItem value="bar">أعمدة (Bar)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="المقاييس المعروضة">
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={widget.metrics.includes('achievement')}
                  onChange={(e) =>
                    update({
                      metrics: e.target.checked
                        ? [...widget.metrics, 'achievement']
                        : widget.metrics.filter((m) => m !== 'achievement'),
                    })
                  }
                />
                نسبة الإنجاز
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={widget.metrics.includes('growth')}
                  onChange={(e) =>
                    update({
                      metrics: e.target.checked ? [...widget.metrics, 'growth'] : widget.metrics.filter((m) => m !== 'growth'),
                    })
                  }
                />
                نسبة النمو
              </label>
            </div>
          </Field>
          <Field label="نطاق البيانات">
            <Select value={widget.scope} onValueChange={(v) => update({ scope: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المؤشرات (متوسط عام)</SelectItem>
                <SelectItem value="category">فئة محددة</SelectItem>
                <SelectItem value="kpi">مؤشر محدد</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {widget.scope === 'category' && (
            <Field label="اختر الفئة">
              <Select value={String(widget.categoryId ?? '')} onValueChange={(v) => update({ categoryId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {widget.scope === 'kpi' && (
            <Field label="اختر المؤشر">
              <Select value={String(widget.kpiId ?? '')} onValueChange={(v) => update({ kpiId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مؤشرًا" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </>
      )}

      {widget.type === 'category' && (
        <>
          <Field label="نوع الرسم">
            <Select value={widget.chartType} onValueChange={(v) => update({ chartType: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">أعمدة (Bar)</SelectItem>
                <SelectItem value="donut">دائري (Donut)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="المقياس المعروض">
            <Select value={widget.metric} onValueChange={(v) => update({ metric: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="achievement">نسبة الإنجاز</SelectItem>
                <SelectItem value="growth">نسبة النمو</SelectItem>
                <SelectItem value="kpiCount">عدد المؤشرات</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="طريقة الاختيار">
            <Select value={widget.mode} onValueChange={(v) => update({ mode: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autoTop">تلقائي (الأفضل أداءً)</SelectItem>
                <SelectItem value="autoBottom">تلقائي (الأضعف أداءً)</SelectItem>
                <SelectItem value="manual">يدوي (تحديد فئات)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {widget.mode !== 'manual' && (
            <Field label="عدد الفئات المعروضة">
              <Input type="number" min={1} max={20} value={widget.count ?? 5} onChange={(e) => update({ count: Number(e.target.value) })} />
            </Field>
          )}
          {widget.mode === 'manual' && (
            <Field label="اختر الفئات">
              <ChipPicker
                items={categories}
                selected={widget.categoryIds ?? []}
                onToggle={(id) =>
                  update({
                    categoryIds: (widget.categoryIds ?? []).includes(id)
                      ? widget.categoryIds!.filter((c) => c !== id)
                      : [...(widget.categoryIds ?? []), id],
                  })
                }
              />
            </Field>
          )}
        </>
      )}

      {widget.type === 'kpi' && (
        <>
          <Field label="نمط العرض">
            <Select value={widget.display} onValueChange={(v) => update({ display: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">بطاقات</SelectItem>
                <SelectItem value="table">جدول</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="طريقة الاختيار">
            <Select value={widget.mode} onValueChange={(v) => update({ mode: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autoTop">تلقائي (الأفضل أداءً)</SelectItem>
                <SelectItem value="autoBottom">تلقائي (الأضعف أداءً)</SelectItem>
                <SelectItem value="manual">يدوي (تحديد مؤشرات)</SelectItem>
                <SelectItem value="byCategory">كل مؤشرات فئة معينة</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {(widget.mode === 'autoTop' || widget.mode === 'autoBottom') && (
            <Field label="عدد المؤشرات المعروضة">
              <Input type="number" min={1} max={20} value={widget.count ?? 6} onChange={(e) => update({ count: Number(e.target.value) })} />
            </Field>
          )}
          {widget.mode === 'manual' && (
            <Field label="اختر المؤشرات">
              <ChipPicker
                items={kpis}
                selected={widget.kpiIds ?? []}
                onToggle={(id) =>
                  update({
                    kpiIds: (widget.kpiIds ?? []).includes(id) ? widget.kpiIds!.filter((k) => k !== id) : [...(widget.kpiIds ?? []), id],
                  })
                }
              />
            </Field>
          )}
          {widget.mode === 'byCategory' && (
            <Field label="اختر الفئة">
              <Select value={String(widget.categoryId ?? '')} onValueChange={(v) => update({ categoryId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {widget.display === 'table' && (
            <Field label="الأعمدة الظاهرة">
              <div className="flex flex-wrap gap-3">
                {(['name', 'category', 'current', 'target', 'achievement', 'growth', 'status'] as const).map((col) => (
                  <label key={col} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={(widget.columns ?? ['name', 'category', 'achievement', 'status']).includes(col)}
                      onChange={(e) => {
                        const current = widget.columns ?? ['name', 'category', 'achievement', 'status'];
                        update({ columns: e.target.checked ? [...current, col] : current.filter((c) => c !== col) });
                      }}
                    />
                    {{ name: 'الاسم', category: 'الفئة', current: 'الحالية', target: 'المستهدف', achievement: 'الإنجاز', growth: 'النمو', status: 'الحالة' }[col]}
                  </label>
                ))}
              </div>
            </Field>
          )}
        </>
      )}

      {widget.type === 'radial' && (
        <>
          <Field label="مصدر القيمة">
            <Select value={widget.source} onValueChange={(v) => update({ source: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">الأداء العام</SelectItem>
                <SelectItem value="category">فئة محددة</SelectItem>
                <SelectItem value="kpi">مؤشر محدد</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {widget.source === 'category' && (
            <Field label="اختر الفئة">
              <Select value={String(widget.categoryId ?? '')} onValueChange={(v) => update({ categoryId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {widget.source === 'kpi' && (
            <Field label="اختر المؤشر">
              <Select value={String(widget.kpiId ?? '')} onValueChange={(v) => update({ kpiId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مؤشرًا" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="اللون">
            <ColorPickerInput value={widget.color ?? '#0B2545'} onChange={(v) => update({ color: v })} />
          </Field>
        </>
      )}

      {widget.type === 'updates' && (
        <>
          <Field label="عدد العناصر المعروضة">
            <Input type="number" min={1} max={30} value={widget.count} onChange={(e) => update({ count: Number(e.target.value) })} />
          </Field>
          <Field label="تصفية حسب فئة (اختياري)">
            <Select value={widget.categoryId ? String(widget.categoryId) : 'none'} onValueChange={(v) => update({ categoryId: v === 'none' ? undefined : Number(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">كل الفئات</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      {widget.type === 'text' && (
        <>
          <Field label="النص">
            <Input value={widget.text} onChange={(e) => update({ text: e.target.value })} />
          </Field>
          <Field label="المحاذاة">
            <Select value={widget.align} onValueChange={(v) => update({ align: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">يمين</SelectItem>
                <SelectItem value="center">وسط</SelectItem>
                <SelectItem value="left">يسار</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="الحجم">
            <Select value={widget.size} onValueChange={(v) => update({ size: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">صغير</SelectItem>
                <SelectItem value="md">متوسط</SelectItem>
                <SelectItem value="lg">كبير</SelectItem>
                <SelectItem value="xl">كبير جدًا</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      )}
    </div>
  );
}
