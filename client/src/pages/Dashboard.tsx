import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Gauge, TrendingUp, Target, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { CardGridSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { QuarterTrendChart } from '@/components/charts/QuarterTrendChart';
import { YearComparisonChart } from '@/components/charts/YearComparisonChart';
import { CategoryAchievementChart } from '@/components/charts/CategoryAchievementChart';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDate, formatNumber, quarterLabel } from '@/lib/utils';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

export default function Dashboard() {
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = useDashboard({ year, quarter });

  return (
    <div>
      <PageHeader
        title="لوحة التحكم التنفيذية"
        description="نظرة شاملة على أداء مؤشرات قسم التسويق"
        actions={
          <div className="flex gap-2">
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={quarter ?? 'current'} onValueChange={(v) => setQuarter(v === 'current' ? undefined : v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">الربع الحالي</SelectItem>
                {QUARTERS.map((q) => (
                  <SelectItem key={q} value={q}>
                    {quarterLabel(q)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-6">
          <CardGridSkeleton count={4} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        </div>
      )}

      {isError && (
        <EmptyState title="تعذر تحميل بيانات لوحة التحكم" description="يرجى المحاولة مرة أخرى لاحقًا" />
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="عدد الفئات النشطة" value={data.totals.categories} icon={FolderKanban} color="#0B2545" index={0} />
            <StatCard label="عدد المؤشرات النشطة" value={data.totals.kpis} icon={Gauge} color="#C9A24B" index={1} />
            <StatCard
              label="متوسط نسبة الإنجاز"
              value={data.totals.achievementPercent}
              suffix="%"
              icon={Target}
              color="#15803D"
              index={2}
            />
            <StatCard
              label="متوسط نسبة النمو"
              value={data.totals.growthPercent}
              suffix="%"
              icon={TrendingUp}
              trend={data.totals.growthPercent}
              color="#D97706"
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>مقارنة الأداء الفصلي {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuarterTrendChart data={data.quarterComparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأداء العام - {quarter ? quarterLabel(quarter) : quarterLabel(data.quarter)}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadialGauge value={data.totals.achievementPercent} label="نسبة الإنجاز" color="#0B2545" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء السنوي</CardTitle>
              </CardHeader>
              <CardContent>
                <YearComparisonChart data={data.yearComparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل الفئات أداءً</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topCategories.length > 0 ? (
                  <CategoryAchievementChart data={data.topCategories} />
                ) : (
                  <EmptyState title="لا توجد بيانات كافية" description="أضف بيانات فصلية لعرض أفضل الفئات" />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المؤشرات أداءً</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topKpis.length === 0 && (
                  <EmptyState title="لا توجد مؤشرات بعد" description="ابدأ بإضافة فئات ومؤشرات وبيانات فصلية" />
                )}
                {data.topKpis.map((kpi, i) => (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}
                    >
                      <DynamicIcon name={kpi.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{kpi.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{kpi.categoryName}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold tabular-nums">{formatNumber(kpi.achievementPercent)}%</p>
                      <StatusBadge status={kpi.status} />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  آخر التحديثات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.latestUpdates.length === 0 && (
                  <EmptyState title="لا توجد تحديثات بعد" description="ستظهر هنا آخر التحديثات على البيانات الفصلية" />
                )}
                {data.latestUpdates.map((update, i) => (
                  <motion.div
                    key={`${update.kpiId}-${update.year}-${update.quarter}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{update.kpiName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {update.categoryName} · {quarterLabel(update.quarter)} {update.year}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold tabular-nums">
                        {formatNumber(update.currentValue)} {update.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(update.updatedAt)}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
