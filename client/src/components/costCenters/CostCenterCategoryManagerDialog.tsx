import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useCostCenterCategories,
  useCreateCostCenterCategory,
  useUpdateCostCenterCategory,
  useDeleteCostCenterCategory,
} from '@/hooks/useCostCenterCategories';
import type { CostCenterCategory } from '@/types';

export function CostCenterCategoryManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: categories } = useCostCenterCategories();
  const createMutation = useCreateCostCenterCategory();
  const updateMutation = useUpdateCostCenterCategory();
  const deleteMutation = useDeleteCostCenterCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CostCenterCategory | null>(null);

  async function handleAdd() {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim() });
    setNewName('');
  }

  function startEdit(cat: CostCenterCategory) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  async function saveEdit() {
    if (editingId && editingName.trim()) {
      await updateMutation.mutateAsync({ id: editingId, data: { name: editingName.trim() } });
    }
    setEditingId(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة تصنيفات مراكز التكلفة</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="اسم تصنيف جديد، مثال: إعلانات"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={createMutation.isPending || !newName.trim()} className="gap-1 shrink-0">
                <Plus className="h-4 w-4" />
                إضافة
              </Button>
            </div>

            <div className="max-h-72 space-y-1.5 overflow-y-auto scrollbar-thin">
              {categories?.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">لا توجد تصنيفات بعد</p>
              )}
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  {editingId === cat.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="h-8"
                      />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={saveEdit}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => startEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setDeleteTarget(cat)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف التصنيف"
        description={`هل أنت متأكد من حذف تصنيف "${deleteTarget?.name}"؟ البنود المرتبطة به تصير بدون تصنيف.`}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
