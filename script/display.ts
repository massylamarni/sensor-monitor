import type { SensorDataEntry, ChartTimeRange, PeakValues } from '@/types/sensor';
import { checkStruct, getStateObjectData } from './utils';
import { getMissingData } from './data';

function getPeakValues(dataArray: SensorDataEntry[]): PeakValues {
  if (!checkStruct(dataArray)) return { min: 'Unknown', max: 'Unknown' };
  let min = dataArray[0].value, max = dataArray[0].value;
  for (let i = 1; i < dataArray.length; i++) {
    if (dataArray[i].value < min) min = dataArray[i].value;
    if (dataArray[i].value > max) max = dataArray[i].value;
  }
  return { min, max };
}

export interface DataSensorDisplay {
  sensorType: 'data';
  value: string;
  peaks: PeakValues;
}

export interface StateSensorDisplay {
  sensorType: 'state';
  value: string | boolean;
  state: boolean | '-1';
}

export function getDataSensorDisplay(
  data: SensorDataEntry[] | null,
  timeRange: ChartTimeRange
): DataSensorDisplay {
  if (!checkStruct(data)) return { sensorType: 'data', value: 'Unknown', peaks: { min: 'Unknown', max: 'Unknown' } };
  const hasGapAfter = checkStruct(getMissingData(data, timeRange).after);
  return {
    sensorType: 'data',
    value: hasGapAfter ? 'Unknown' : data.at(-1)!.value,
    peaks: getPeakValues(data),
  };
}

export function getStateSensorDisplay(
  state: SensorDataEntry[] | null,
  isRealTime: boolean,
  timeRange?: ChartTimeRange
): StateSensorDisplay {
  if (!checkStruct(state) || state[0].value === 'Unknown') return { sensorType: 'state', value: 'Unknown', state: '-1' };

  const hasGapAfter = isRealTime && timeRange
    ? checkStruct(getMissingData(state, timeRange).after)
    : false;

  const stateObject = getStateObjectData(state.at(-1)!.value);

  if (stateObject) {
    return {
      sensorType: 'state',
      value: stateObject.type === 0 ? stateObject.data : stateObject.state,
      state: hasGapAfter ? '-1' : stateObject.state,
    };
  }

  const boolValue = state.at(-1)!.value !== '0';
  return {
    sensorType: 'state',
    value: boolValue,
    state: hasGapAfter ? '-1' : boolValue,
  };
}