export type SensorType = 'data' | 'state';
export type IconName = 'temperature' | 'gas' | 'doorClosed' | 'doorOpen';

export interface Endpoint {
  url: string;
  method: 'GET' | 'POST';
}

export interface DataSensorInfo {
  label: string;
  unit: string;
}

export interface StateSensorInfo {
  label: string;
  dataType: string;
  labelOnTrue: string;
  labelOnFalse: string;
}

interface BaseSensorConfig {
  id: string;
  endpoint: Endpoint;
  icon: IconName[];
}

export interface DataSensorConfig extends BaseSensorConfig {
  sensorType: 'data';
  info: DataSensorInfo;
}

export interface StateSensorConfig extends BaseSensorConfig {
  sensorType: 'state';
  info: StateSensorInfo;
}

export type SensorConfig = DataSensorConfig | StateSensorConfig;

/* */

export interface SensorDataEntry {
  value: string;
  createdAt: string;
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartTimeRange {
  start: Date;
  end: Date;
}

export interface ChartDataset {
  missingDataBefore: ChartPoint[];
  sensorData: ChartPoint[];
  missingDataAfter: ChartPoint[];
}

export interface StateObjectData {
  data: string;
  state: boolean;
  type: 0 | 1;
}

export interface PeakValues {
  min: string;
  max: string;
}