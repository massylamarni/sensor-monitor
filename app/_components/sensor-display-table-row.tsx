import { getStateSensorDisplay } from '@/script';
import type { SensorConfig, SensorDataEntry, StateSensorInfo } from '@/types/sensor';

interface Props {
  tableRowData: {
    data: SensorDataEntry;
    info: SensorConfig;
  };
}

export default function SensorDisplayTableRow({ tableRowData }: Props) {
  const { data, info } = tableRowData;
  const isData = info.sensorType === 'data';

  const displayStateData = !isData ? getStateSensorDisplay([data], false) : null;
  const isUnknown = displayStateData?.state === '-1';

  const stateLabel = isUnknown
    ? 'Unknown'
    : displayStateData?.state
      ?(info.info as StateSensorInfo).labelOnTrue
      :(info.info as StateSensorInfo).labelOnFalse;

  const recordedAt = data.createdAt === 'Unknown'
    ? 'Unknown'
    : new Date(data.createdAt).toLocaleString();

  return (
    <div className="sensor-display-table-row">
      <div className="sensor-display-table-row-head">

        {!isData && displayStateData && <>
          <div>
            <div className="sensor-display-table-row-title">
              <div>{stateLabel}</div>
              <div></div>
            </div>
            <div className="sensor-display-table-row-subtitle">
              {info.info.dataType}
            </div>
          </div>

          {typeof displayStateData.value !== 'boolean' && displayStateData.value !== 'Unknown' && (
            <div>
              <div className="sensor-display-table-row-title">
                <div>{displayStateData.value}</div>
              </div>
              <div className="sensor-display-table-row-subtitle">
                {info.info.dataType}
              </div>
            </div>
          )}
        </>}

        {isData && (
          <div>
            <div className="sensor-display-table-row-title">
              <div>{data.value}</div>
              <div>{info.info.unit}</div>
            </div>
            <div className="sensor-display-table-row-subtitle">
              {info.info.label}
            </div>
          </div>
        )}

      </div>
      <div className="sensor-display-table-row-body">
        <div className="sensor-display-table-row-peaks">
          <div>
            <div>{recordedAt}</div>
            <div>Recorded at</div>
          </div>
        </div>
      </div>
    </div>
  );
}