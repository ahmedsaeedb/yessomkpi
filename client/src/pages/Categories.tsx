import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Pencil, Trash2, FolderKanban } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import type { Category } from '@/types';
import { formatDate } from '@/lib/utils';

export default function Categories() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useCategories({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
  });
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function handleAdd() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  const columns = useMemo<ColumnDef<Category, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم الفئة',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.name}</p>
            {row.original.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'kpi_count',
        header: 'عدد المؤشرات',
        cell: ({ row }) => <span className="tabular-nums">{row.original.kpi_count ?? 0}</span>,
      },
      { accessorKey: 'sort_order', header: 'الترتيب' },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'updated_at',
        header: 'آخر تحديث',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updated_at)}</span>,
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
        title="إدارة الفئات"
        description="تصنيف مؤشرات الأداء ضمن فئات تسويقية"
        actions={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة فئة
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث في الفئات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
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
          {isError && <EmptyState title="تعذر تحميل الفئات" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState
              icon={FolderKanban}
              title="لا توجد فئات بعد"
              description="ابدأ بإضافة أول فئة لتنظيم مؤشرات الأداء"
              actionLabel="إضافة فئة"
              onAction={handleAdd}
            />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف الفئة"
        description={`هل أنت متأكد من حذف فئة "${deleteTarget?.name}"؟ سيتم حذف جميع المؤشرات والبيانات المرتبطة بها.`}
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
