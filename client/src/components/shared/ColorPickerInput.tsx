import { Input } from '@/components/ui/input';

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function ColorPickerInput({ value, onChange, id }: ColorPickerInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#0B2545'}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#0B2545" className="font-mono" dir="ltr" />
    </div>
  );
}
