import { useState } from 'react';
import { Range } from 'react-range';
import type { IThumbProps, ITrackProps } from 'react-range/lib/types';
import Icon from './icons';

interface Props {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
}

const MIN = 0;
const MAX = 60000;
const STEP = 5000;
const PADDING = 1000;

export default function SensorSettingSlider({ refreshRate, setRefreshRate }: Props) {
  const [value, setValue] = useState(refreshRate);

  const handleChange = (newValues: number[]) => {
    const clamped = Math.min(Math.max(newValues[0], MIN+PADDING), MAX);
    setValue(clamped);
    setRefreshRate(clamped);
  };

  const label = `Every ${value / 1000} ${value === 1000 ? 'Second' : 'Seconds'}`;

  return (
    <div className="sensor-display">
      <div className="sensor-display-head">
        <div>
          <Icon name='temperature' />
        </div>
        <div>
          <div className="sensor-display-title">
            <div>{label}</div>
            <div></div>
          </div>
          <div className="sensor-display-subtitle">Sensors refresh rate</div>
        </div>
      </div>

      <div className="sensor-display-body">
        <Range
          values={[value]}
          step={STEP}
          min={MIN}
          max={MAX+PADDING}
          onChange={handleChange}
          renderTrack={({ props, children }: { props: ITrackProps; children: React.ReactNode }) => {
            return (
              <div {...props} key="track" className="slider">
                <div
                  className="slider-selected"
                  style={{ width: `calc(${(value / (MAX+PADDING)) * 100}% + 10px)` }}
                  key="selected"
                />
                {children}
              </div>
            );
          }}
          renderThumb={({ props }: { props: IThumbProps }) => {
            const { key, ...thumbProps } = props;
            return <div {...thumbProps} key="thumb" className="thumb" />;
          }}
        />
      </div>
    </div>
  );
}