import { ChartDataset, ChartTimeRange } from '@/types/sensor';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

export function setChart(
  ctx: CanvasRenderingContext2D,
  chartType: 0 | 1,
  initialData: ChartDataset,
  timeRange: ChartTimeRange
): Chart {
  const missingColor = (ctx: CanvasRenderingContext2D, width: number) => {
    const g = ctx.createLinearGradient(0, 0, width, 0);
    g.addColorStop(0, 'rgba(31,31,31,0)');
    g.addColorStop(0.5, 'rgb(228,48,48)');
    g.addColorStop(1, 'rgba(31,31,31,0)');
    return g;
  };

  const sensorColor = (ctx: CanvasRenderingContext2D, width: number) => {
    const g = ctx.createLinearGradient(0, 0, width, 0);
    g.addColorStop(0, 'rgba(31,31,31,0)');
    g.addColorStop(0.5, 'rgba(48,228,142,1)');
    g.addColorStop(1, 'rgba(31,31,31,0)');
    return g;
  };

  const isCompact = chartType === 0;

  const options: Chart['options'] = {
    layout: { padding: { top: 15 } },
    plugins: { legend: { display: false } },
    animation: { duration: 0 },
    responsive: true,
    maintainAspectRatio: !isCompact,
    scales: {
      x: {
        type: 'time',
        display: !isCompact,
        grid: { display: false },
        ticks: { display: !isCompact, maxTicksLimit: 8 },
        min: timeRange.start as unknown as number,
        max: timeRange.end as unknown as number,
      },
      y: {
        display: !isCompact,
        grid: { display: false },
        ticks: { display: !isCompact },
        min: 0,
      },
    },
  };

  const makeDataset = (data: ChartDataset[keyof ChartDataset], isSensor: boolean) =>
    isCompact
      ? {
        data,
        fill: false,
        tension: isSensor ? 0.5 : 0,
        pointRadius: 0,
        borderColor: (context: { chart: Chart }) =>
          isSensor
            ? sensorColor(ctx, context.chart.width)
            : missingColor(ctx, context.chart.width),
      }
      : {
        data,
        fill: true,
        tension: isSensor ? 0.2 : 0,
        pointRadius: isSensor ? 1 : 0,
        borderWidth: 1,
        borderColor: isSensor ? 'rgba(48,228,142,1)' : 'rgb(228,48,48)',
        backgroundColor: (context: { chart: Chart }) => {
          const g = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          g.addColorStop(0.5, isSensor ? 'rgba(48,228,142,0.1)' : 'rgba(228,48,48,0.1)');
          g.addColorStop(1, 'rgba(31,31,31,0)');
          return g;
        },
      };

  const inst = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        makeDataset(initialData.missingDataBefore, false),
        makeDataset(initialData.sensorData, true),
        makeDataset(initialData.missingDataAfter, false),
      ],
    },
    options,
  });

  return inst;
}

export function updateChart(
  inst: Chart,
  chartData: ChartDataset,
  timeRange: ChartTimeRange
): void {
  if (!inst) return;
  (inst.data.datasets[0] as { data: unknown }).data = chartData.missingDataBefore;
  (inst.data.datasets[1] as { data: unknown }).data = chartData.sensorData;
  (inst.data.datasets[2] as { data: unknown }).data = chartData.missingDataAfter;
  (inst.options.scales?.x as any).min = timeRange.start as unknown as number;
  (inst.options.scales?.x as any).max = timeRange.end as unknown as number;
  inst.update();
}