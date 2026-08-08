import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanItemFormDialog } from './PlanItemFormDialog';
import { usePlanItems, useDeletePlanItem, useUpdatePlanItem } from '@/hooks/usePlanItems';
import type { PlanItem, PlanSection } from '@/types';

interface PlanItemsEditorProps {
  section: PlanSection;
  title: string;
  description: string;
}

export function PlanItemsEditor({ section, title, description }: PlanItemsEditorProps) {
  const { data, isLoading } = usePlanItems(section);
  const deleteMutation = useDeletePlanItem(section);
  const updateMutation = useUpdatePlanItem(section);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanItem | null>(null);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(item: PlanItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function handleMove(item: PlanItem, direction: 'up' | 'down') {
    if (!data) return;
    const index = data.findIndex((i) => i.id === item.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= data.length) return;
    const swapItem = data[swapIndex];

    updateMutation.mutate({ id: item.id, data: { sortOrder: swapItem.sort_order } });
    updateMutation.mutate({ id: swapItem.id, data: { sortOrder: item.sort_order } });
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة بند
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="لا توجد بنود بعد"
          description="ابدأ بإضافة أول بند لهذا القسم"
          actionLabel="إضافة بند"
          onAction={handleAdd}
        />
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex shrink-0 flex-col gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => handleMove(item, 'up')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === data.length - 1}
                    onClick={() => handleMove(item, 'down')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  {item.details && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.details}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanItemFormDialog open={formOpen} onOpenChange={setFormOpen} section={section} item={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف البند"
        description={`هل أنت متأكد من حذف بند "${deleteTarget?.title}"؟`}
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
