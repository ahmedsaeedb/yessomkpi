import { TrendSeriesChart } from '@/components/charts/TrendSeriesChart';
import { CategoryAchievementChart } from '@/components/charts/CategoryAchievementChart';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTrendData } from '@/hooks/useDashboard';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import { categoryMetricValue, radialValue, selectCategories, selectKpis, statValue } from './widgetHelpers';
import type { DashboardSummary, Widget } from '@/types';

const COLUMN_LABELS: Record<string, string> = {
  name: 'المؤشر',
  category: 'الفئة',
  current: 'القيمة الحالية',
  target: 'المستهدف',
  achievement: 'الإنجاز',
  growth: 'النمو',
  status: 'الحالة',
  updatedAt: 'آخر تحديث',
};

export function WidgetRenderer({ widget, data }: { widget: Widget; data: DashboardSummary }) {
  const isTrend = widget.type === 'trend';
  const trendScoped = isTrend && widget.scope !== 'all';
  const trendId = isTrend ? (widget.scope === 'category' ? widget.categoryId : widget.scope === 'kpi' ? widget.kpiId : undefined) : undefined;
  const trendQuery = useTrendData({
    timeframe: isTrend ? widget.timeframe : 'quarterly',
    scope: isTrend ? widget.scope : 'all',
    id: trendId,
    year: data.year,
    enabled: trendScoped && !!trendId,
  });

  switch (widget.type) {
    case 'stat': {
      const { value, suffix, trend } = statValue(widget, data);
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <div
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${widget.color ?? '#0B2545'}1A`, color: widget.color ?? '#0B2545' }}
          >
            <DynamicIcon name={widget.icon ?? 'BarChart3'} className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {formatNumber(value)}
            {suffix && <span className="text-sm text-muted-foreground"> {suffix}</span>}
          </p>
          {trend !== undefined && (
            <p className={cn('text-xs font-medium', trend >= 0 ? 'text-success' : 'text-destructive')}>
              {trend >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(trend))}%
            </p>
          )}
        </div>
      );
    }

    case 'trend': {
      const series = trendScoped
        ? trendQuery.data ?? []
        : widget.timeframe === 'quarterly'
          ? data.quarterComparison.map((q) => ({ label: q.quarter, achievementPercent: q.achievementPercent, growthPercent: q.growthPercent }))
          : data.yearComparison.map((y) => ({ label: String(y.year), achievementPercent: y.achievementPercent, growthPercent: 0 }));

      if (trendScoped && !trendId) {
        return <EmptyState title="اختر فئة أو مؤشرًا لهذا العنصر" />;
      }
      return <TrendSeriesChart data={series} chartType={widget.chartType} metrics={widget.metrics} height={220} />;
    }

    case 'category': {
      const selected = selectCategories(data.topCategories, widget);
      if (selected.length === 0) return <EmptyState title="لا توجد بيانات كافية" />;
      const chartData = selected.map((c) => ({ name: c.name, achievementPercent: categoryMetricValue(c, widget.metric) }));
      return <CategoryAchievementChart data={chartData} chartType={widget.chartType} />;
    }

    case 'kpi': {
      const selected = selectKpis(data.topKpis, widget);
      if (selected.length === 0) return <EmptyState title="لا توجد بيانات كافية" />;

      if (widget.display === 'table') {
        const columns = widget.columns?.length ? widget.columns : (['name', 'category', 'achievement', 'status'] as const);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c}>{COLUMN_LABELS[c]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected.map((k) => (
                <TableRow key={k.id}>
                  {columns.map((c) => (
                    <TableCell key={c}>
                      {c === 'name' && k.name}
                      {c === 'category' && k.categoryName}
                      {c === 'current' && `${formatNumber(k.currentValue)} ${k.unit}`}
                      {c === 'target' && `${formatNumber(k.target)} ${k.unit}`}
                      {c === 'achievement' && `${formatNumber(k.achievementPercent)}%`}
                      {c === 'growth' && `${formatNumber(k.growthPercent)}%`}
                      {c === 'status' && <StatusBadge status={k.status} />}
                      {c === 'updatedAt' && '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }

      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {selected.map((kpi) => (
            <div key={kpi.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}
              >
                <DynamicIcon name={kpi.icon} className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{kpi.name}</p>
                <p className="truncate text-xs text-muted-foreground">{kpi.categoryName}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold tabular-nums">{formatNumber(kpi.achievementPercent)}%</p>
                <StatusBadge status={kpi.status} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'radial': {
      const value = radialValue(widget, data);
      return <RadialGauge value={value} label="نسبة الإنجاز" color={widget.color ?? '#0B2545'} />;
    }

    case 'updates': {
      const filtered = widget.categoryId
        ? data.latestUpdates.filter((u) => u.categoryId === widget.categoryId)
        : data.latestUpdates;
      const list = filtered.slice(0, widget.count);
      if (list.length === 0) return <EmptyState title="لا توجد تحديثات بعد" />;
      return (
        <div className="space-y-2">
          {list.map((u) => (
            <div key={`${u.kpiId}-${u.year}-${u.quarter}`} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.kpiName}</p>
                <p className="truncate text-xs text-muted-foreground">{u.categoryName}</p>
              </div>
              <div className="shrink-0 text-left">
                <p className="font-semibold tabular-nums">{formatNumber(u.currentValue)} {u.unit}</p>
                <p className="text-xs text-muted-foreground">{formatDate(u.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'text': {
      const sizeClass = { sm: 'text-sm', md: 'text-base', lg: 'text-xl', xl: 'text-2xl' }[widget.size];
      const alignClass = { right: 'text-right', center: 'text-center', left: 'text-left' }[widget.align];
      return (
        <div className={cn('flex h-full items-center font-bold', sizeClass, alignClass)} style={{ justifyContent: widget.align === 'center' ? 'center' : widget.align === 'left' ? 'flex-start' : 'flex-end' }}>
          {widget.text}
        </div>
      );
    }

    default:
      return null;
  }
}
