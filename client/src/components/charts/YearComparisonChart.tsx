import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';

interface YearComparisonChartProps {
  data: Array<{ year: number; achievementPercent: number }>;
  chartType?: 'bar' | 'line';
}

export function YearComparisonChart({ data, chartType = 'bar' }: YearComparisonChartProps) {
  const { theme } = useTheme();

  const options: ApexOptions = {
    chart: { type: chartType, toolbar: { show: false }, fontFamily: 'Tajawal, sans-serif', background: 'transparent' },
    theme: { mode: theme },
    colors: ['#0B2545'],
    ...(chartType === 'bar'
      ? { plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: false } } }
      : { stroke: { curve: 'smooth' as const, width: 3 }, markers: { size: 5 } }),
    dataLabels: { enabled: true, formatter: (v) => `${v}%`, style: { fontFamily: 'Tajawal', colors: [theme === 'dark' ? '#fff' : '#0B2545'] }, offsetY: -20 },
    grid: { borderColor: theme === 'dark' ? '#2a3441' : '#eef1f5', strokeDashArray: 4 },
    xaxis: { categories: data.map((d) => String(d.year)), labels: { style: { fontFamily: 'Tajawal' } } },
    yaxis: { labels: { formatter: (v) => `${Math.round(v)}%` } },
    tooltip: { theme, y: { formatter: (v) => `${v}%` } },
  };

  const series = [{ name: 'نسبة الإنجاز', data: data.map((d) => d.achievementPercent) }];

  return <Chart options={options} series={series} type={chartType} height={300} />;
}
