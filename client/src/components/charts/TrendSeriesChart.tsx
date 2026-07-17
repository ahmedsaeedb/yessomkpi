import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';

interface TrendSeriesChartProps {
  data: Array<{ label: string; achievementPercent: number; growthPercent: number }>;
  chartType?: 'area' | 'line' | 'bar';
  metrics?: Array<'achievement' | 'growth'>;
  height?: number;
}

const METRIC_META = {
  achievement: { name: 'نسبة الإنجاز', color: '#0B2545', key: 'achievementPercent' as const },
  growth: { name: 'نسبة النمو', color: '#C9A24B', key: 'growthPercent' as const },
};

export function TrendSeriesChart({ data, chartType = 'area', metrics = ['achievement', 'growth'], height = 260 }: TrendSeriesChartProps) {
  const { theme } = useTheme();
  const activeMetrics = metrics.length > 0 ? metrics : (['achievement'] as const);

  const options: ApexOptions = {
    chart: { type: chartType, toolbar: { show: false }, fontFamily: 'Tajawal, sans-serif', background: 'transparent' },
    theme: { mode: theme },
    colors: activeMetrics.map((m) => METRIC_META[m].color),
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: chartType === 'bar' ? 0 : 2.5 },
    ...(chartType === 'bar' ? { plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } } } : {}),
    fill: chartType === 'area' ? { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } } : { type: 'solid' },
    grid: { borderColor: theme === 'dark' ? '#2a3441' : '#eef1f5', strokeDashArray: 4 },
    xaxis: { categories: data.map((d) => d.label), labels: { style: { fontFamily: 'Tajawal' } } },
    yaxis: { labels: { formatter: (v) => `${Math.round(v)}%` } },
    tooltip: { theme, y: { formatter: (v) => `${v}%` } },
    legend: { position: 'top', horizontalAlign: 'center', fontFamily: 'Tajawal' },
  };

  const series = activeMetrics.map((m) => ({
    name: METRIC_META[m].name,
    data: data.map((d) => d[METRIC_META[m].key]),
  }));

  return <Chart options={options} series={series} type={chartType} height={height} />;
}
