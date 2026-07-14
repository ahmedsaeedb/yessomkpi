import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: LucideIcon;
  trend?: number;
  color?: string;
  index?: number;
}

export function StatCard({ label, value, suffix, icon: Icon, trend, color, index = 0 }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums">
                {typeof value === 'number' ? formatNumber(value) : value}
              </span>
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span>{formatNumber(Math.abs(trend))}%</span>
                <span className="text-muted-foreground">مقارنة بالفترة السابقة</span>
              </div>
            )}
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color ?? '#0B2545'}1A`, color: color ?? '#0B2545' }}
          >
            <Icon className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
