import { useEffect, useState, useRef, useCallback } from 'react';
import { checkStruct, fetchRawDataArray } from '@/script';
import type { SensorConfig, SensorDataEntry } from '@/types/sensor';
import SensorDisplayTableRow from './sensor-display-table-row';
import { getTimeRange } from '@/lib/common';
import Icon from './icons';

interface Props {
  sensor: SensorConfig;
  refreshRate: number;
}

const DEFAULT_ROW: SensorDataEntry = { data: {value: 'Unknown', state: 'Unknown'}, createdAt: 'Unknown' };
const ROW_COUNT = 6;
const DEFAULT_DATA = Array.from({ length: ROW_COUNT }, () => DEFAULT_ROW);

const TIME_RANGE_OPTIONS = [
  { name: 'Last 24 hours', value: 24 * 60 * 60 * 1000 }
];

function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let lastTime = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    args[0] instanceof Event && (args[0] as Event).preventDefault();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  } as T;
}

export default function SensorDisplayTable({ sensor, refreshRate }: Props) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [anchor, setAnchor] = useState({ now: ROW_COUNT - 1, max: ROW_COUNT - 1 });
  const tableRef = useRef<HTMLDivElement>(null);
  const lastTouchY = useRef(0);

  const moveAnchor = useCallback((direction: 'up' | 'down') => {
    setAnchor(prev => {
      if (direction === 'down') return prev.now >= ROW_COUNT ? { ...prev, now: prev.now - 1 } : prev;
      return prev.now < prev.max ? { ...prev, now: prev.now + 1 } : prev;
    });
  }, []);

  // Sync anchor max when new data arrives
  useEffect(() => {
    if (anchor.max === ROW_COUNT - 1) {
      setAnchor({ now: data.length - 1, max: data.length - 1 });
    }
  }, [data]);

  // Attach scroll/touch listeners
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    const onWheel = throttle((e: any) => {
      moveAnchor((e as WheelEvent).deltaY > 0 ? 'down' : 'up');
    }, 100);

    const onTouchStart = throttle((e: any) => {
      const touch = (e as TouchEvent).touches[0];
      if (touch) lastTouchY.current = touch.clientY;
    }, 100);

    const onTouchMove = throttle((e: any) => {
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;
      const delta = touch.clientY - lastTouchY.current;
      lastTouchY.current = touch.clientY;
      moveAnchor(delta > 0 ? 'up' : 'down');
    }, 100);

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [moveAnchor]);

  // Fetch on interval
  useEffect(() => {
    fetchRawDataArray(sensor.endpoint.url, setData, getTimeRange(TIME_RANGE_OPTIONS[0].value));
    const id = setInterval(() => {
      fetchRawDataArray(sensor.endpoint.url, setData, getTimeRange(TIME_RANGE_OPTIONS[0].value));
    }, refreshRate);
    return () => clearInterval(id);
  }, [refreshRate, sensor.endpoint.url]);

  const visibleRows = checkStruct(data)
    ? Array.from({ length: ROW_COUNT }, (_, i) => data[anchor.now - i])
    : [];

  return (
    <div className="sensor-display-table sensor-display">
      <div className="sensor-display-table-head sensor-display-head">
        <div>
          <Icon name='temperature' />
        </div>
        <div>
          <div className="sensor-display-table-title sensor-display-title">
            <div>{`${TIME_RANGE_OPTIONS[0].name} History`}</div>
            <div></div>
          </div>
          <div className="sensor-display-table-subtitle sensor-display-subtitle">
            {sensor.info.label}
          </div>
        </div>
      </div>

      <div className="sensor-display-table-body" ref={tableRef}>
        {visibleRows.map((row, i) => (
          <SensorDisplayTableRow
            key={anchor.now - i}
            tableRowData={{ data: row, info: sensor }}
          />
        ))}
      </div>
    </div>
  );
}