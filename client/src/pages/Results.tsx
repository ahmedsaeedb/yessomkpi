import { PageHeader } from '@/components/shared/PageHeader';
import { CardGridSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { useDashboard } from '@/hooks/useDashboard';
import { useBrand } from '@/context/BrandContext';
import { DEFAULT_RESULTS_CONFIG, GRID_COLS, GRID_ROW_HEIGHT } from '@/lib/resultsConfig';

export default function Results() {
  const brand = useBrand();
  const { data, isLoading } = useDashboard();

  const widgets = brand?.resultsConfig?.widgets ?? DEFAULT_RESULTS_CONFIG.widgets;

  return (
    <div>
      <PageHeader title="النتائج" description="عرض تنفيذي لأداء مؤشرات قسم التسويق" />

      {isLoading && <CardGridSkeleton count={4} />}

      {data && widgets.length === 0 && <EmptyState title="لم يتم تصميم صفحة النتائج بعد" />}

      {data && widgets.length > 0 && (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridAutoRows: `${GRID_ROW_HEIGHT}px`,
          }}
        >
          {widgets.map((w) => (
            <div
              key={w.id}
              style={{
                gridColumn: `${w.x + 1} / span ${w.w}`,
                gridRow: `${w.y + 1} / span ${w.h}`,
              }}
            >
              {w.type === 'text' ? (
                <WidgetRenderer widget={w} data={data} />
              ) : (
                <WidgetShell title={w.title}>
                  <WidgetRenderer widget={w} data={data} />
                </WidgetShell>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
