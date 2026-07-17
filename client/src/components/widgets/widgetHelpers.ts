import type { CategoryWidget, DashboardSummary, KpiWidget, RadialWidget, StatWidget } from '@/types';

type CategoryRow = DashboardSummary['topCategories'][number];
type KpiRow = DashboardSummary['topKpis'][number];

export function selectCategories(all: CategoryRow[], w: CategoryWidget): CategoryRow[] {
  if (w.mode === 'manual') {
    if (!w.categoryIds?.length) return all.slice(0, w.count ?? 5);
    const order = new Map(w.categoryIds.map((id, i) => [id, i]));
    return all.filter((c) => order.has(c.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }
  const sorted =
    w.mode === 'autoBottom' ? [...all].sort((a, b) => a.achievementPercent - b.achievementPercent) : all;
  return sorted.slice(0, w.count ?? 5);
}

export function categoryMetricValue(c: CategoryRow, metric: CategoryWidget['metric']): number {
  if (metric === 'growth') return c.growthPercent;
  if (metric === 'kpiCount') return c.kpiCount;
  return c.achievementPercent;
}

export function selectKpis(all: KpiRow[], w: KpiWidget): KpiRow[] {
  if (w.mode === 'byCategory' && w.categoryId) {
    return all.filter((k) => k.categoryId === w.categoryId);
  }
  if (w.mode === 'manual') {
    if (!w.kpiIds?.length) return all.slice(0, w.count ?? 6);
    const order = new Map(w.kpiIds.map((id, i) => [id, i]));
    return all.filter((k) => order.has(k.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }
  const sorted = w.mode === 'autoBottom' ? [...all].sort((a, b) => a.achievementPercent - b.achievementPercent) : all;
  return sorted.slice(0, w.count ?? 6);
}

export function statValue(
  widget: StatWidget,
  data: DashboardSummary
): { value: number; suffix: string; trend?: number } {
  switch (widget.metric) {
    case 'categoriesCount':
      return { value: data.totals.categories, suffix: '' };
    case 'kpisCount':
      return { value: data.totals.kpis, suffix: '' };
    case 'avgAchievement':
      return { value: data.totals.achievementPercent, suffix: '%', trend: widget.showTrend ? data.totals.achievementPercent : undefined };
    case 'avgGrowth':
      return { value: data.totals.growthPercent, suffix: '%', trend: widget.showTrend ? data.totals.growthPercent : undefined };
    case 'categoryValue': {
      const cat = data.topCategories.find((c) => c.id === widget.categoryId);
      return { value: cat?.achievementPercent ?? 0, suffix: '%' };
    }
    case 'kpiValue': {
      const kpi = data.topKpis.find((k) => k.id === widget.kpiId);
      if (!kpi) return { value: 0, suffix: '' };
      switch (widget.kpiField) {
        case 'current':
          return { value: kpi.currentValue, suffix: kpi.unit };
        case 'target':
          return { value: kpi.target, suffix: kpi.unit };
        case 'growth':
          return { value: kpi.growthPercent, suffix: '%' };
        case 'difference':
          return { value: kpi.difference, suffix: kpi.unit };
        default:
          return { value: kpi.achievementPercent, suffix: '%' };
      }
    }
    default:
      return { value: 0, suffix: '' };
  }
}

export function radialValue(widget: RadialWidget, data: DashboardSummary): number {
  if (widget.source === 'category') {
    return data.topCategories.find((c) => c.id === widget.categoryId)?.achievementPercent ?? 0;
  }
  if (widget.source === 'kpi') {
    return data.topKpis.find((k) => k.id === widget.kpiId)?.achievementPercent ?? 0;
  }
  return data.totals.achievementPercent;
}
