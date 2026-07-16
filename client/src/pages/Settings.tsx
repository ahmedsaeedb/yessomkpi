import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Moon, Sparkles, Sun } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPickerInput } from '@/components/shared/ColorPickerInput';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings, useUploadLogo } from '@/hooks/useSettings';
import { useTheme } from '@/context/ThemeContext';
import { extractDominantColor } from '@/lib/extractColor';
import { cn } from '@/lib/utils';

const schema = z.object({
  companyName: z.string().min(1, 'اسم الشركة مطلوب'),
  systemName: z.string().min(1, 'اسم النظام مطلوب'),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  successColor: z.string().min(1),
  warningColor: z.string().min(1),
  dangerColor: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const uploadLogoMutation = useUploadLogo();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedColor, setExtractedColor] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      systemName: '',
      primaryColor: '#0B2545',
      secondaryColor: '#C9A24B',
      successColor: '#15803D',
      warningColor: '#D97706',
      dangerColor: '#DC2626',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName,
        systemName: settings.systemName,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        successColor: settings.successColor,
        warningColor: settings.warningColor,
        dangerColor: settings.dangerColor,
      });
    }
  }, [settings, form]);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const color = await extractDominantColor(file);
    if (color) {
      setExtractedColor(color);
      form.setValue('primaryColor', color, { shouldDirty: true });
      toast.info('تم استخراج اللون الأساسي من الشعار تلقائيًا');
    }

    await uploadLogoMutation.mutateAsync(file);
    e.target.value = '';
  }

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync(values);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="الإعدادات" description="تخصيص هوية النظام وألوانه ومظهره" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>هوية النظام</CardTitle>
              <CardDescription>اسم الشركة والنظام والشعار الظاهر في الواجهة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                  {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt="الشعار" className="h-full w-full object-contain p-2" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoChange} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadLogoMutation.isPending} className="gap-2">
                    {uploadLogoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    رفع شعار جديد
                  </Button>
                  <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG, SVG أو WEBP، بحد أقصى 5 ميجابايت</p>
                  {extractedColor && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                      تم استخراج اللون {extractedColor} من الشعار
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشركة</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم النظام</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الألوان</CardTitle>
              <CardDescription>ألوان الهوية البصرية المستخدمة في الواجهة والتقارير</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الأساسي</FormLabel>
                    <FormControl>
                      <ColorPickerInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الثانوي</FormLabel>
                    <FormControl>
                      <ColorPickerInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="successColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لون النجاح</FormLabel>
                    <FormControl>
                      <ColorPickerInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warningColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لون التنبيه</FormLabel>
                    <FormControl>
                      <ColorPickerInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dangerColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لون الخطر</FormLabel>
                    <FormControl>
                      <ColorPickerInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المظهر</CardTitle>
              <CardDescription>الوضع الافتراضي لعرض النظام على هذا الجهاز</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <Sun className="h-4.5 w-4.5" /> فاتح
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <Moon className="h-4.5 w-4.5" /> داكن
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit" size="lg" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
