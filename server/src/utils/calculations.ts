export interface KpiCalculations {
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  status: 'excellent' | 'on-track' | 'at-risk' | 'behind';
}

/**
 * growth% = (current - previous) / previous * 100
 * achievement% = current / target * 100
 * difference = current - target
 */
export function calculateKpiMetrics(
  currentValue: number,
  previousValue: number,
  target: number
): KpiCalculations {
  const growthPercent =
    previousValue !== 0 ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 : 0;

  const achievementPercent = target !== 0 ? (currentValue / target) * 100 : 0;

  const difference = currentValue - target;

  let status: KpiCalculations['status'];
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

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export function currentYear(): number {
  return new Date().getFullYear();
}

export function currentQuarter(): (typeof QUARTERS)[number] {
  const month = new Date().getMonth();
  return QUARTERS[Math.floor(month / 3)];
}
