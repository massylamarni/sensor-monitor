import type { SensorConfig } from '@/types/sensor';

export const DEFAULT_REFRESH_RATE = 30_000;

export const SENSORS: SensorConfig[] = [
  {
    id: 'temperature',
    sensorType: 'data',
    endpoint: { url: '/api/temperature', method: 'GET' },
    info: { label: 'Temperature', unit: '°C' },
    icon: ['temperature']
  },
  {
    id: 'gas',
    sensorType: 'data',
    endpoint: { url: '/api/gas', method: 'GET' },
    info: { label: 'Gas rate', unit: 'PPM' },
    icon: ['gas']
  },
  {
    id: 'rfid',
    sensorType: 'state',
    endpoint: { url: '/api/rfid', method: 'GET' },
    info: { label: 'RFID validation', dataType: 'UID', labelOnTrue: 'Valid', labelOnFalse: 'Not valid' },
    icon: ['doorOpen', 'doorClosed']
  },
  {
    id: 'movement',
    sensorType: 'state',
    endpoint: { url: '/api/movement', method: 'GET' },
    info: { label: 'Movement state', dataType: 'State', labelOnTrue: 'Movement detected', labelOnFalse: 'No Movement' },
    icon: ['doorOpen', 'doorClosed']
  },
];
