'use client'

import { useState } from 'react';
import { SENSORS, DEFAULT_REFRESH_RATE } from '@/config/sensors';
import SensorDisplayData from './_components/sensor-display-data';
import SensorDisplayChart from './_components/sensor-display-chart';
import SensorSettingSlider from './_components/sensor-setting-slider';
import SensorDisplayTable from './_components/sensor-display-table';

export default function Home() {
  const [refreshRate, setRefreshRate] = useState(DEFAULT_REFRESH_RATE);
  const [selectedSensorId, setSelectedSensorId] = useState(SENSORS[0].id);

  const activeSensor = SENSORS.find(s => s.id === selectedSensorId) ?? SENSORS[0];

  return (
    <div className='sensors-display-layout'>
      <div className='main'>
        <div className='sensors-display-grid'>
          <div></div>
          <SensorDisplayData sensor={SENSORS[0]} refreshRate={refreshRate} setSelectedSensor={setSelectedSensorId} />
          <SensorDisplayData sensor={SENSORS[1]} refreshRate={refreshRate} setSelectedSensor={setSelectedSensorId} />
          <SensorSettingSlider refreshRate={refreshRate} setRefreshRate={setRefreshRate} />
          <SensorDisplayChart sensor={activeSensor} refreshRate={refreshRate} />
          <SensorDisplayTable sensor={activeSensor} refreshRate={refreshRate} />
          <SensorDisplayData sensor={SENSORS[2]} refreshRate={refreshRate} setSelectedSensor={setSelectedSensorId} />
          <SensorDisplayData sensor={SENSORS[3]} refreshRate={refreshRate} setSelectedSensor={setSelectedSensorId} />
        </div>
      </div>
    </div>
  );
}
