import type { SensorDataEntry } from '@/types/sensor';
import { checkStruct } from '@/script/utils';

export async function fetchRawDataArray(
  endpointUrl: string,
  setter: (data: SensorDataEntry[]) => void,
  timeRange: { start: Date; end: Date }
): Promise<void> {
  try {
    const response = await fetch(
      `${endpointUrl}?timeStart=${timeRange.start.getTime()}&timeEnd=${timeRange.end.getTime()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) return;
    const rawDataArray = await response.json();
    if (!checkStruct(rawDataArray)) return;
    setter(rawDataArray);
  } catch (error) {
    console.error('Error fetching rawDataArray:', error);
  }
}