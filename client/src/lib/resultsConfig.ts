import type { ResultsConfig } from '@/types';

export const DEFAULT_RESULTS_CONFIG: ResultsConfig = {
  showStats: true,
  quarterTrend: { visible: true, chartType: 'area' },
  radialGauge: { visible: true },
  yearComparison: { visible: true, chartType: 'bar' },
  topCategories: { visible: true, chartType: 'bar', mode: 'auto', categoryIds: [] },
  topKpis: { visible: true, mode: 'auto', kpiIds: [] },
};
