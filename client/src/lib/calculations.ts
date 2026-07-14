import type { KpiStatus } from '@/types';

export interface KpiCalculations {
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  status: KpiStatus;
}

export function calculateKpiMetrics(currentValue: number, previousValue: number, target: number): KpiCalculations {
  const growthPercent = previousValue !== 0 ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 : 0;
  const achievementPercent = target !== 0 ? (currentValue / target) * 100 : 0;
  const difference = currentValue - target;

  let status: KpiStatus;
  if (achievementPercent >= 100) status = 'excellent';
  else if (achievementPercent >= 80) status = 'on-track';
  else if (achievementPercent >= 50) status = 'at-risk';
  else status = 'behind';

  return {
    growthPercent: Number(growthPercent.toFixed(2)),
    achievementPercent: Number(achievementPercent.toFixed(2)),
    difference: Number(difference.toFixed(2)),
    status,
  };
}
