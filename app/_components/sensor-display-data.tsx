import { useState, useEffect, useRef } from 'react';
import {
  checkStruct,
  getDataSensorDisplay,
  getStateSensorDisplay,
  setChart,
  getChartData,
  getMissingData,
  updateChart,
  fetchRawDataArray,
} from '@/script';
import type { SensorConfig, DataSensorInfo, StateSensorInfo, SensorDataEntry } from '@/types/sensor';
import Icon from './icons';
import { getTimeRange } from '@/lib/common';
import { Chart } from 'chart.js/auto';

interface Props {
  sensor: SensorConfig;
  refreshRate: number;
  setSelectedSensor: (id: string) => void;
}

const TIME_RANGE_OPTIONS = [
  { name: 'Last 1 minute', value: 1 * 60 * 1000 },
  { name: 'Last 5 minutes', value: 5 * 60 * 1000 },
  { name: 'Last 1 hour', value: 60 * 60 * 1000 },
];

export default function SensorDisplayData({ sensor, refreshRate, setSelectedSensor }: Props) {
  const [selectedRangeMs, setSelectedRangeMs] = useState(TIME_RANGE_OPTIONS[0].value);
  const [data, setData] = useState<SensorDataEntry[] | null>(null);
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
    chartRef.current = setChart(ctx, 0, emptyChartData, chartTimeRange);
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
  }, [chartTimeRange]);

  // Update chart when data arrives
  useEffect(() => {
    if (!checkStruct(data)) return;
    const missing = getMissingData(data, chartTimeRange);
    const chartData = {
      missingDataBefore: getChartData(missing.before),
      sensorData: getChartData(data),
      missingDataAfter: getChartData(missing.after),
    };
    updateChart(chartRef.current!, chartData, chartTimeRange);
  }, [data]);


  const isData = sensor.sensorType === 'data';
  const displayData = isData
    ? getDataSensorDisplay(data, chartTimeRange)
    : getStateSensorDisplay(data, true, chartTimeRange);


  const isUnknown = displayData.sensorType === 'state' && displayData.state === '-1';

  // Derived display values
  const sensorIconName = sensor.icon.length === 1
    ? sensor.icon[0] : displayData.sensorType === 'state'
      ? (displayData.state ? sensor.icon[0] : sensor.icon[1]) : sensor.icon[0];

  const sensorLabel = displayData.sensorType === 'data'
    ? displayData.value
    : isUnknown ? 'Unknown' : displayData.state ? (sensor.info as StateSensorInfo).labelOnTrue : (sensor.info as StateSensorInfo).labelOnFalse;

  const sensorUnit = isData ? sensor.info.unit : '';
  const sensorDataType = isData ? sensor.info.label : sensor.info.dataType;

  return (
    <div
      onClick={() => setSelectedSensor(sensor.id)}
      className="relative flex flex-col justify-between bg-[#1F1F1F] border border-[#383838] rounded-[15px] p-[15px] cursor-pointer min-w-fit min-h-fit"
    >
      {/* Head */}
      <div className="sensor-display-head">
        <div>
          <Icon name={sensorIconName} />
        </div>
        <div>
          <div className="sensor-display-title">
            <div>{sensorLabel}</div>
            <div>{sensorUnit}</div>
          </div>
          <div className="sensor-display-subtitle">
            {sensorDataType}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="sensor-display-body">

        {displayData.sensorType === 'data' ? (<div className="sensor-display-peaks">
          <div>
            <div>Max today</div>
            <div>{displayData.peaks.max}</div>
          </div>
          <div>
            <div>Min today</div>
            <div>{displayData.peaks.min}</div>
          </div>
        </div>) : (<div className="sensor-display-peaks">
          <div>
            <div>{`Last ${sensorDataType}`}</div>
            <div>{sensorLabel}</div>
          </div>
        </div>)}

        <div className='sensor-display-data-chart'>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
}