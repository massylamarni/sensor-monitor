import type { SensorConfig } from '@/types/sensor';

export const DEFAULT_REFRESH_RATE = 30_000;

export const SENSORS: SensorConfig[] = [
  {
    id: 'temperature',
    sensorType: 'data',
    endpoint: { url: '/api/get/temperature', method: 'GET' },
    info: { label: 'Temperature', unit: '°C' },
    icon: ['temperature']
  },
  {
    id: 'gas',
    sensorType: 'data',
    endpoint: { url: '/api/get/gas', method: 'GET' },
    info: { label: 'Gas rate', unit: 'PPM' },
    icon: ['gas']
  },
  {
    id: 'rfid',
    sensorType: 'state',
    endpoint: { url: '/api/get/rfid', method: 'GET' },
    info: { label: 'RFID validation', dataType: 'UID', labelOnTrue: 'Valid', labelOnFalse: 'Not valid' },
    icon: ['doorOpen', 'doorClosed']
  },
  {
    id: 'movement',
    sensorType: 'state',
    endpoint: { url: '/api/get/movement', method: 'GET' },
    info: { label: 'Movement state', dataType: 'State', labelOnTrue: 'Movement detected', labelOnFalse: 'No Movement' },
    icon: ['doorOpen', 'doorClosed']
  },
];
