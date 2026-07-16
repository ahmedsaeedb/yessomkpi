import { z } from 'zod';

export const resultsConfigSchema = z.object({
  showStats: z.boolean(),
  quarterTrend: z.object({
    visible: z.boolean(),
    chartType: z.enum(['area', 'line', 'bar']),
  }),
  radialGauge: z.object({
    visible: z.boolean(),
  }),
  yearComparison: z.object({
    visible: z.boolean(),
    chartType: z.enum(['bar', 'line']),
  }),
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

export type ResultsConfig = z.infer<typeof resultsConfigSchema>;

export const DEFAULT_RESULTS_CONFIG: ResultsConfig = {
  showStats: true,
  quarterTrend: { visible: true, chartType: 'area' },
  radialGauge: { visible: true },
  yearComparison: { visible: true, chartType: 'bar' },
  topCategories: { visible: true, chartType: 'bar', mode: 'auto', categoryIds: [] },
  topKpis: { visible: true, mode: 'auto', kpiIds: [] },
};

export function parseResultsConfig(raw: string | null): ResultsConfig {
  if (!raw) return DEFAULT_RESULTS_CONFIG;
  try {
    const parsed = resultsConfigSchema.parse(JSON.parse(raw));
    return parsed;
  } catch {
    return DEFAULT_RESULTS_CONFIG;
  }
}
