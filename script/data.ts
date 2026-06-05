import type { SensorDataEntry, ChartPoint, ChartTimeRange } from '@/types/sensor';
import { checkStruct, getStateObjectData } from './utils';

// [{"data": "value", "createdAt": "timeString"}] → [{"x": Date, "y": number}]
export function getChartData(dataArray: SensorDataEntry[]): ChartPoint[] {
  return dataArray.map(entry => {
    const stateObject = getStateObjectData(entry.data.state);
    console.log(dataArray);
    console.log({
      x: new Date(entry.createdAt).getMilliseconds(),
      y: stateObject ? (stateObject.state ? 1 : 0) : parseFloat(entry.data.value),
    });
    return {
      x: new Date(entry.createdAt).getMilliseconds(),
      y: stateObject ? (stateObject.state ? 1 : 0) : parseFloat(entry.data.value),
    };
  });
}

// Returns padded missing-data segments to fill gaps before/after real data
export function getMissingData(
  dataArray: SensorDataEntry[],
  chartTimeRange: ChartTimeRange
): { before: SensorDataEntry[]; after: SensorDataEntry[] } {
  const DELAY = 60 * 1000;
  const PREDICTED_VALUE = '0';
  const padding = (chartTimeRange.end.getTime() - chartTimeRange.start.getTime()) / 25;
  const delayedEnd = new Date(chartTimeRange.end.getTime() - DELAY);

  const defaultFill: SensorDataEntry[] = [
    { data: { value: PREDICTED_VALUE, state: null }, createdAt: chartTimeRange.start.toString() },
    { data: { value: PREDICTED_VALUE, state: null }, createdAt: chartTimeRange.end.toString() },
  ];

  const missing = { before: [] as SensorDataEntry[], after: [] as SensorDataEntry[] };

  if (!checkStruct(dataArray)) {
    missing.after = defaultFill;
    return missing;
  }

  const dataStart = new Date(dataArray[0].createdAt);
  const dataEnd = new Date(dataArray.at(-1)!.createdAt);
  const startsOnTime = dataStart <= chartTimeRange.start;
  const endsOnTime = dataEnd >= delayedEnd;

  if (!startsOnTime) {
    missing.before = [
      { data: { value: PREDICTED_VALUE, state: null }, createdAt: chartTimeRange.start.toString() },
      { data: { value: PREDICTED_VALUE, state: null }, createdAt: new Date(dataStart.getTime() - padding).toString() },
      { data: dataArray[0].data, createdAt: dataStart.toString() },
    ];
  }

  if (!endsOnTime) {
    missing.after = [
      { data: dataArray.at(-1)!.data, createdAt: dataEnd.toString() },
      { data: { value: PREDICTED_VALUE, state: null }, createdAt: new Date(dataEnd.getTime() + padding).toString() },
      { data: { value: PREDICTED_VALUE, state: null }, createdAt: chartTimeRange.end.toString() },
    ];
  }

  if (startsOnTime && endsOnTime) {
    // Normal — data covers the full range, nothing to fill
  }

  return missing;
}

// Reduces dense chart data to ~500 averaged points across the time range
export function getAverageChartData(chartData: ChartPoint[], chartTimeRange: ChartTimeRange): ChartPoint[] {
  if (chartData.length < 2) return chartData;
  const maxGap = (chartTimeRange.end.getTime() - chartTimeRange.start.getTime()) / 500;
  const result: ChartPoint[] = [chartData[0]];
  let timeSum = 0, valueSum = 0, count = 0;

  for (let i = 1; i < chartData.length - 1; i++) {
    const gap = chartData[i].x - chartData[i - 1].x;
    count++;
    if (gap < maxGap && timeSum < maxGap) {
      timeSum += gap;
      valueSum += chartData[i].y;
    } else {
      result.push({ x: chartData[i].x, y: valueSum / count });
      timeSum = 0; valueSum = 0; count = 0;
    }
  }

  result.push(chartData.at(-1)!);
  return result;
}

// Reduces dense state chart data to grouped boolean chunks across the time range
export function getGroupedChartData(chartData: ChartPoint[], chartTimeRange: ChartTimeRange): ChartPoint[] {
  if (chartData.length < 2) return chartData;
  const maxGap = (chartTimeRange.end.getTime() - chartTimeRange.start.getTime()) / 1500;
  const result: ChartPoint[] = [chartData[0]];
  let timeSum = 0, chunkPositive = false, chunkStart = 0;

  for (let i = 1; i < chartData.length - 1; i++) {
    if (chunkStart === 0) chunkStart = chartData[i].x;
    const gap = chartData[i].x - chartData[i - 1].x;

    if (gap < maxGap && timeSum < maxGap) {
      timeSum += gap;
      chunkPositive = chunkPositive || chartData[i].y === 1;
    } else {
      result.push({ x: chunkStart, y: chunkPositive ? 1 : 0 });
      timeSum = 0; chunkPositive = false; chunkStart = 0;
    }
  }

  result.push(chartData.at(-1)!);
  return result;
}