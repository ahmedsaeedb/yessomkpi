import { LogOut, Moon, Scale, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { CardGridSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QuarterTrendChart } from '@/components/charts/QuarterTrendChart';
import { YearComparisonChart } from '@/components/charts/YearComparisonChart';
import { CategoryAchievementChart } from '@/components/charts/CategoryAchievementChart';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { useDashboard } from '@/hooks/useDashboard';
import { useBrand } from '@/context/BrandContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { formatNumber } from '@/lib/utils';

export default function Results() {
  const brand = useBrand();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { data, isLoading } = useDashboard();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.companyName} className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold">{brand?.companyName}</p>
            <p className="text-xs text-muted-foreground">{brand?.systemName} · صفحة النتائج</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.fullName}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="تبديل المظهر">
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="تسجيل الخروج">
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {isLoading && <CardGridSkeleton count={4} />}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="عدد الفئات النشطة" value={data.totals.categories} icon={Scale} color="#0B2545" index={0} />
              <StatCard label="عدد المؤشرات النشطة" value={data.totals.kpis} icon={Scale} color="#C9A24B" index={1} />
              <StatCard label="متوسط نسبة الإنجاز" value={data.totals.achievementPercent} suffix="%" icon={Scale} color="#15803D" index={2} />
              <StatCard
                label="متوسط نسبة النمو"
                value={data.totals.growthPercent}
                suffix="%"
                icon={Scale}
                trend={data.totals.growthPercent}
                color="#D97706"
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>مقارنة الأداء الفصلي</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuarterTrendChart data={data.quarterComparison} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الأداء العام</CardTitle>
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
                    <EmptyState title="لا توجد بيانات كافية" />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>أفضل المؤشرات أداءً</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.topKpis.map((kpi) => (
                  <div key={kpi.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
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
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
