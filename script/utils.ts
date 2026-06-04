import type { SensorDataEntry, StateObjectData } from '@/types/sensor';

export function checkStruct(rawDataArray: unknown): rawDataArray is SensorDataEntry[] {
  return Array.isArray(rawDataArray) && rawDataArray.length > 0 && rawDataArray[0] != null;
}

// Parses a raw data value that may be a plain scalar or a JSON object with a state key
export function getStateObjectData(data: unknown): StateObjectData | false {
  if (!data || typeof data !== 'object') return false;
  const keys = Object.keys(data as object);
  const firstVal = (data as Record<string, string>)[keys[0]];
  const type: 0 | 1 = (firstVal !== '1' && firstVal !== '0') ? 0 : 1;
  return {
    data: firstVal,
    state: type === 0 ? (data as Record<string, string>)[keys[1]] !== '0' : firstVal !== '0',
    type,
  };
}