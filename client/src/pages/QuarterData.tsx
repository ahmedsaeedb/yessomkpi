import { useMemo, useState } from 'react';
import { CalendarRange, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { QuarterValueFormDialog } from '@/components/kpiValues/QuarterValueFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useKpis } from '@/hooks/useKpis';
import { useKpiValues } from '@/hooks/useKpiValues';
import { useCategories } from '@/hooks/useCategories';
import { calculateKpiMetrics } from '@/lib/calculations';
import { formatNumber, quarterLabel } from '@/lib/utils';
import type { Kpi, KpiValue, Quarter } from '@/types';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 3 + i);

function currentQuarter(): Quarter {
  return QUARTERS[Math.floor(new Date().getMonth() / 3)];
}

export default function QuarterData() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [quarter, setQuarter] = useState<Quarter>(currentQuarter());
  const [categoryId, setCategoryId] = useState('all');

  const { data: categories } = useCategories();
  const { data: kpis, isLoading: kpisLoading } = useKpis({
    status: 'active',
    categoryId: categoryId === 'all' ? undefined : categoryId,
  });
  const { data: values, isLoading: valuesLoading } = useKpiValues({ year, quarter });

  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const valueByKpi = useMemo(() => {
    const map = new Map<number, KpiValue>();
    values?.forEach((v) => map.set(v.kpi_id, v));
    return map;
  }, [values]);

  function handleEdit(kpi: Kpi) {
    setSelectedKpi(kpi);
    setFormOpen(true);
  }

  const isLoading = kpisLoading || valuesLoading;

  return (
    <div>
      <PageHeader
        title="البيانات الفصلية"
        description="إدخال وتحديث القيم الفصلية لمؤشرات الأداء"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={quarter} onValueChange={(v) => setQuarter(v as Quarter)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

      <Card>
        <CardContent className="p-5">
          {isLoading && <TableSkeleton rows={6} cols={7} />}

          {!isLoading && kpis && kpis.length === 0 && (
            <EmptyState
              icon={CalendarRange}
              title="لا توجد مؤشرات نشطة"
              description="أضف مؤشرات أداء نشطة أولًا لتتمكن من إدخال بياناتها الفصلية"
            />
          )}

          {!isLoading && kpis && kpis.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المؤشر</TableHead>
                  <TableHead>القيمة الحالية</TableHead>
                  <TableHead>القيمة السابقة</TableHead>
                  <TableHead>المستهدف</TableHead>
                  <TableHead>نسبة النمو</TableHead>
                  <TableHead>نسبة الإنجاز</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.map((kpi) => {
                  const value = valueByKpi.get(kpi.id);
                  const metrics = calculateKpiMetrics(
                    value?.current_value ?? 0,
                    value?.previous_value ?? 0,
                    value?.target ?? kpi.target
                  );
                  return (
                    <TableRow key={kpi.id} className="cursor-pointer" onClick={() => handleEdit(kpi)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${kpi.color}1A`, color: kpi.color }}
                          >
                            <DynamicIcon name={kpi.icon} className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{kpi.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{kpi.category_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {value ? `${formatNumber(value.current_value)} ${kpi.unit}` : '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {value ? `${formatNumber(value.previous_value)} ${kpi.unit}` : '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(value?.target ?? kpi.target)} {kpi.unit}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatNumber(metrics.growthPercent)}%</TableCell>
                      <TableCell className="tabular-nums font-semibold">{formatNumber(metrics.achievementPercent)}%</TableCell>
                      <TableCell>
                        <StatusBadge status={value ? metrics.status : 'inactive'} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(kpi)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <QuarterValueFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kpi={selectedKpi}
        existingValue={selectedKpi ? valueByKpi.get(selectedKpi.id) : null}
        year={year}
        quarter={quarter}
      />
    </div>
  );
}
