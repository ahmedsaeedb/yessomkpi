import { Badge } from '@/components/ui/badge';
import type { RiskLevel } from '@/types';

const LABELS: Record<RiskLevel, string> = { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' };
const VARIANTS: Record<RiskLevel, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return <Badge variant={VARIANTS[level]}>{LABELS[level]}</Badge>;
}

export const RISK_LEVEL_LABELS = LABELS;
