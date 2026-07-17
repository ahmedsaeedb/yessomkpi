import type { ReactNode } from 'react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WidgetShellProps {
  title?: string;
  children: ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function WidgetShell({ title, children, editable, onEdit, onDelete, className }: WidgetShellProps) {
  return (
    <div className={cn('flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card', className)}>
      {(title || editable) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          {editable && (
            <span className="widget-drag-handle cursor-move text-muted-foreground/50 hover:text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          <h3 className="flex-1 truncate text-sm font-semibold">{title}</h3>
          {editable && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-3 scrollbar-thin">{children}</div>
    </div>
  );
}
