import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/lib/utils';
import type { KpiStatus, Status } from '@/types';

const VARIANT_MAP: Record<string, 'success' | 'warning' | 'destructive' | 'muted' | 'secondary'> = {
  excellent: 'success',
  'on-track': 'secondary',
  'at-risk': 'warning',
  behind: 'destructive',
  active: 'success',
  inactive: 'muted',
};

export function StatusBadge({ status }: { status: KpiStatus | Status | string }) {
  return <Badge variant={VARIANT_MAP[status] ?? 'muted'}>{statusLabel(status)}</Badge>;
}
