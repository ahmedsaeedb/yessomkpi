import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DynamicIcon, ICON_OPTIONS } from '@/components/shared/DynamicIcon';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = '#0B2545' }: IconPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start gap-2">
          <DynamicIcon name={value} className="h-4 w-4" style={{ color }} />
          <span>{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="grid grid-cols-6 gap-1.5">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-accent',
                value === icon && 'border-primary bg-primary/10'
              )}
              title={icon}
            >
              <DynamicIcon name={icon} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
