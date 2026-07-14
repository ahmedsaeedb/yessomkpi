import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Pencil, Trash2, Gauge } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { KpiFormDialog } from '@/components/kpis/KpiFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKpis, useDeleteKpi } from '@/hooks/useKpis';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import type { Kpi } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function Kpis() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const debouncedSearch = useDebounce(search);

  const { data: categories } = useCategories();
  const { data, isLoading, isError } = useKpis({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    categoryId: categoryId === 'all' ? undefined : categoryId,
  });
  const deleteMutation = useDeleteKpi();

  const [formOpen, setFormOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kpi | null>(null);

  function handleAdd() {
    setEditingKpi(null);
    setFormOpen(true);
  }

  function handleEdit(kpi: Kpi) {
    setEditingKpi(kpi);
    setFormOpen(true);
  }

  const columns = useMemo<ColumnDef<Kpi, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'المؤشر',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${row.original.color}1A`, color: row.original.color }}
            >
              <DynamicIcon name={row.original.icon} className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.category_name}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'target',
        header: 'المستهدف',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatNumber(row.original.target)} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'latestValue',
        header: 'آخر قيمة',
        cell: ({ row }) =>
          row.original.latestValue !== null ? (
            <span className="tabular-nums">
              {formatNumber(row.original.latestValue)} {row.original.unit}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">لا توجد بيانات</span>
          ),
      },
      {
        accessorKey: 'achievementPercent',
        header: 'نسبة الإنجاز',
        cell: ({ row }) => <span className="tabular-nums font-semibold">{formatNumber(row.original.achievementPercent)}%</span>,
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-start gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="إدارة المؤشرات"
        description="تعريف مؤشرات الأداء الرئيسية لكل فئة"
        actions={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة مؤشر
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="بحث في المؤشرات..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-48">
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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading && <TableSkeleton rows={5} cols={6} />}
          {isError && <EmptyState title="تعذر تحميل المؤشرات" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState
              icon={Gauge}
              title="لا توجد مؤشرات بعد"
              description="ابدأ بإضافة أول مؤشر أداء ضمن إحدى الفئات"
              actionLabel="إضافة مؤشر"
              onAction={handleAdd}
            />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <KpiFormDialog open={formOpen} onOpenChange={setFormOpen} kpi={editingKpi} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف المؤشر"
        description={`هل أنت متأكد من حذف مؤشر "${deleteTarget?.name}"؟ سيتم حذف جميع البيانات الفصلية المرتبطة به.`}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
