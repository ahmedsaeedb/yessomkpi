import { useEffect, useState } from 'react';
import GridLayout, { WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Plus, Save, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { WidgetSettingsForm } from '@/components/widgets/WidgetSettingsForm';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useKpis } from '@/hooks/useKpis';
import { useDashboard } from '@/hooks/useDashboard';
import { DEFAULT_RESULTS_CONFIG, GRID_COLS, GRID_ROW_HEIGHT } from '@/lib/resultsConfig';
import type { Widget, WidgetType } from '@/types';

const ResponsiveGridLayout = WidthProvider(GridLayout);

const WIDGET_LABELS: Record<WidgetType, string> = {
  stat: 'بطاقة إحصائية',
  trend: 'رسم مقارنة زمنية',
  category: 'رسم أداء الفئات',
  kpi: 'عرض أداء المؤشرات',
  radial: 'مقياس دائري',
  updates: 'آخر التحديثات',
  text: 'عنوان / نص',
  costCenters: 'مراكز التكلفة',
};

const WIDGET_DEFAULT_SIZE: Record<WidgetType, { w: number; h: number }> = {
  stat: { w: 3, h: 2 },
  trend: { w: 6, h: 6 },
  category: { w: 6, h: 6 },
  kpi: { w: 12, h: 6 },
  radial: { w: 4, h: 6 },
  updates: { w: 4, h: 6 },
  text: { w: 12, h: 2 },
  costCenters: { w: 6, h: 6 },
};

function createWidget(type: WidgetType, widgets: Widget[]): Widget {
  const id = `w-${Date.now()}`;
  const size = WIDGET_DEFAULT_SIZE[type];
  const y = widgets.length ? Math.max(...widgets.map((w) => w.y + w.h)) : 0;
  const base = { id, x: 0, y, w: size.w, h: size.h, title: WIDGET_LABELS[type] };

  switch (type) {
    case 'stat':
      return { ...base, type: 'stat', metric: 'avgAchievement', color: '#0B2545', icon: 'BarChart3' };
    case 'trend':
      return { ...base, type: 'trend', timeframe: 'quarterly', chartType: 'area', metrics: ['achievement'], scope: 'all' };
    case 'category':
      return { ...base, type: 'category', chartType: 'bar', mode: 'autoTop', count: 5, metric: 'achievement' };
    case 'kpi':
      return { ...base, type: 'kpi', display: 'cards', mode: 'autoTop', count: 6 };
    case 'radial':
      return { ...base, type: 'radial', source: 'overall' };
    case 'updates':
      return { ...base, type: 'updates', count: 5 };
    case 'text':
      return { ...base, type: 'text', text: 'عنوان جديد', align: 'right', size: 'lg' };
    case 'costCenters':
      return { ...base, type: 'costCenters', display: 'table', scope: 'all', sortBy: 'date' };
  }
}

export default function DisplaySettings() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const { data: categories } = useCategories({ status: 'active' });
  const { data: kpis } = useKpis({ status: 'active' });
  const { data: dashboardData } = useDashboard();

  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_RESULTS_CONFIG.widgets);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  useEffect(() => {
    if (settings?.resultsConfig?.widgets) {
      setWidgets(settings.resultsConfig.widgets);
    }
  }, [settings]);

  function handleLayoutChange(layout: Layout[]) {
    setWidgets((prev) =>
      prev.map((w) => {
        const l = layout.find((item) => item.i === w.id);
        if (!l) return w;
        return { ...w, x: l.x, y: l.y, w: l.w, h: l.h };
      })
    );
  }

  function handleAddWidget(type: WidgetType) {
    setWidgets((prev) => [...prev, createWidget(type, prev)]);
  }

  function handleDeleteWidget(id: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }

  function handleSaveWidgetSettings(updated: Widget) {
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setEditingWidget(null);
  }

  async function handleSaveLayout() {
    await updateMutation.mutateAsync({ resultsConfig: { widgets } });
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const layout: Layout[] = widgets.map((w) => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 1 }));

  return (
    <div>
      <PageHeader
        title="تخصيص صفحة النتائج"
        description="صمّم صفحة النتائج بحرية كاملة — أضف العناصر، اسحبها وغيّر حجمها، واختر البيانات التي تعرضها"
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة عنصر
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.keys(WIDGET_LABELS) as WidgetType[]).map((type) => (
                  <DropdownMenuItem key={type} onClick={() => handleAddWidget(type)}>
                    {WIDGET_LABELS[type]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSaveLayout} disabled={updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التصميم'}
            </Button>
          </div>
        }
      />

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-20 text-center">
          <LayoutGrid className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">الصفحة فارغة</p>
          <p className="text-sm text-muted-foreground">ابدأ بإضافة عناصر من زر "إضافة عنصر" أعلاه</p>
        </div>
      ) : (
        <div dir="ltr">
          <ResponsiveGridLayout
            className="layout"
            style={{ position: 'relative' }}
            layout={layout}
            cols={GRID_COLS}
            rowHeight={GRID_ROW_HEIGHT}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".widget-drag-handle"
            compactType="vertical"
            margin={[12, 12]}
          >
            {widgets.map((w) => (
              <div key={w.id}>
                <div dir="rtl" className="h-full">
                  <WidgetShell
                    title={w.title}
                    editable
                    onEdit={() => setEditingWidget(w)}
                    onDelete={() => handleDeleteWidget(w.id)}
                  >
                    <WidgetRenderer widget={w} data={dashboardData} />
                  </WidgetShell>
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}

      <Dialog open={!!editingWidget} onOpenChange={(open) => !open && setEditingWidget(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>إعدادات العنصر</DialogTitle>
          </DialogHeader>
          {editingWidget && (
            <WidgetSettingsForm
              widget={editingWidget}
              categories={categories ?? []}
              kpis={kpis ?? []}
              onChange={setEditingWidget}
            />
          )}
          <DialogFooter>
            <Button onClick={() => editingWidget && handleSaveWidgetSettings(editingWidget)}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
