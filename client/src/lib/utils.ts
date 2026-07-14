import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value ?? 0);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}%`;
}

export function formatDate(value: string | Date, locale = 'ar-SA-u-ca-gregory'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

const QUARTER_LABELS: Record<string, string> = {
  Q1: 'الربع الأول',
  Q2: 'الربع الثاني',
  Q3: 'الربع الثالث',
  Q4: 'الربع الرابع',
};

export function quarterLabel(quarter: string): string {
  return QUARTER_LABELS[quarter] ?? quarter;
}

const STATUS_LABELS: Record<string, string> = {
  excellent: 'ممتاز',
  'on-track': 'على المسار',
  'at-risk': 'بحاجة لمتابعة',
  behind: 'متأخر',
  active: 'نشط',
  inactive: 'غير نشط',
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/** Converts a #rrggbb hex color to an "H S% L%" triplet for CSS var(--x) HSL usage. */
export function hexToHslTriplet(hex: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Picks black or white foreground text for readability against a given hex background. */
export function contrastForeground(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return '0 0% 100%';
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '215 35% 12%' : '0 0% 100%';
}
