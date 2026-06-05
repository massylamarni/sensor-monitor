import type { SensorDataEntry, StateObjectData } from '@/types/sensor';

export function checkStruct(rawDataArray: unknown): rawDataArray is SensorDataEntry[] {
  return (
    Array.isArray(rawDataArray) &&
    rawDataArray.length > 0 &&
    rawDataArray.every(
      (x) => x != null && typeof x === "object" && "data" in x && x.data != null
    )
  );
}

// Parses a raw data value that may be a plain scalar or a JSON object with a state key
export function getStateObjectData(entry: SensorDataEntry): StateObjectData | false {
  if (!entry.data.state) return false;
  return {
    data: entry.data.value,
    state: entry.data.state === '1',
    type: 0,
  };
}