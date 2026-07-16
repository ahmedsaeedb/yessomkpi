import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';
import { quarterLabel } from '@/lib/utils';

interface QuarterTrendChartProps {
  data: Array<{ quarter: string; achievementPercent: number; growthPercent: number }>;
  chartType?: 'area' | 'line' | 'bar';
}

export function QuarterTrendChart({ data, chartType = 'area' }: QuarterTrendChartProps) {
  const { theme } = useTheme();

  const options: ApexOptions = {
    chart: {
      type: chartType,
      toolbar: { show: false },
      fontFamily: 'Tajawal, sans-serif',
      background: 'transparent',
    },
    theme: { mode: theme },
    colors: ['#0B2545', '#C9A24B'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: chartType === 'bar' ? 0 : 2.5 },
    ...(chartType === 'bar' ? { plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } } } : {}),
    fill:
      chartType === 'area'
        ? { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } }
        : { type: 'solid' },
    grid: { borderColor: theme === 'dark' ? '#2a3441' : '#eef1f5', strokeDashArray: 4 },
    xaxis: {
      categories: data.map((d) => quarterLabel(d.quarter)),
      labels: { style: { fontFamily: 'Tajawal' } },
    },
    yaxis: { labels: { formatter: (v) => `${Math.round(v)}%` } },
    tooltip: { theme, y: { formatter: (v) => `${v}%` } },
    legend: { position: 'top', horizontalAlign: 'center', fontFamily: 'Tajawal' },
  };

  const series = [
    { name: 'نسبة الإنجاز', data: data.map((d) => d.achievementPercent) },
    { name: 'نسبة النمو', data: data.map((d) => d.growthPercent) },
  ];

  return <Chart options={options} series={series} type={chartType} height={300} />;
}
