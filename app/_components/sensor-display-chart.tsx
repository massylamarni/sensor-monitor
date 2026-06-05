import { useEffect, useRef, useState } from 'react';
import {
  checkStruct,
  setChart,
  getChartData,
  getMissingData,
  updateChart,
  fetchRawDataArray,
  getAverageChartData,
  getGroupedChartData,
} from '@/script';
import type { SensorConfig, DataSensorInfo } from '@/types/sensor';
import { getTimeRange } from '@/lib/common';
import { Chart } from 'chart.js/auto';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  sensor: SensorConfig;
  refreshRate: number;
}

const TIME_RANGE_OPTIONS = [
  { name: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
  { name: 'Last 12 hours', value: 12 * 60 * 60 * 1000 },
  { name: 'Last 1 hour', value: 1 * 60 * 60 * 1000 },
  { name: 'Last 30 minutes', value: 30 * 60 * 1000 },
];

export default function SensorDisplayChart({ sensor, refreshRate }: Props) {
  const [selectedRangeMs, setSelectedRangeMs] = useState(TIME_RANGE_OPTIONS[0].value);
  const [data, setData] = useState<unknown[] | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState(() => getTimeRange(selectedRangeMs));
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Init chart
  useEffect(() => {
    if (!canvasRef.current) return;
    const missingData = getMissingData([], chartTimeRange);
    const emptyChartData = {
      missingDataBefore: getChartData(missingData.before),
      sensorData: [],
      missingDataAfter: getChartData(missingData.after),
    };

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current?.destroy();
    chartRef.current = setChart(ctx, 1, emptyChartData, chartTimeRange);
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  // Refresh time range on interval
  useEffect(() => {
    setChartTimeRange(getTimeRange(selectedRangeMs));
    const id = setInterval(() => {
      setChartTimeRange(getTimeRange(selectedRangeMs));
    }, refreshRate);
    return () => clearInterval(id);
  }, [refreshRate, selectedRangeMs]);

  // Fetch when time range changes
  useEffect(() => {
    fetchRawDataArray(sensor.endpoint.url, setData, chartTimeRange);
  }, [chartTimeRange, sensor]);

  // Update chart when data arrives
  useEffect(() => {
    if (!checkStruct(data)) return;
    const missing = getMissingData(data, chartTimeRange);
    const chartData = {
      missingDataBefore: getChartData(missing.before),
      sensorData: sensor.sensorType === 'data'
        ? getAverageChartData(getChartData(data), chartTimeRange)
        : getGroupedChartData(getChartData(data), chartTimeRange),
      missingDataAfter: getChartData(missing.after),
    };
    updateChart(chartRef.current!, chartData, chartTimeRange);
  }, [data]);

  const label = sensor.info.label ?? sensor.id;

  return (
    <div className="sensor-chart">
      <div className="sensor-chart-head">
        <div className="sensor-chart-title">{label}</div>
        <div className="sensor-chart-dropdown">
          <Select
            value={String(selectedRangeMs)}
            onValueChange={(val) => setSelectedRangeMs(Number(val))}
          >
            <SelectTrigger className='dark:bg-transparent text-(--default-text-color) border border-(--element-border-color) rounded-[5px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className='text-(--default-text-color) border border-(--element-border-color) rounded-[5px]'>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="sensor-chart-body">
        <div className="sensor-display-data-chart-detailed">
          <canvas className="sensor-display-chart" ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}