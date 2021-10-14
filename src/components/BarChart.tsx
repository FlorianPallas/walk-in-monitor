import { FC, useMemo } from 'react';
import type { Datapoint } from '../types';
import { colorMixer } from '../utils/color';

interface Props {
  current: Datapoint[];
  average: Datapoint[];
}

const BarChart: FC<Props> = ({ current, average }) => {
  const data = useMemo(() => {
    let points = [] as (Datapoint & { isOpaque?: boolean })[];
    if (!current || !average) return [];
    for (let i = 0; i < Math.max(current.length, average.length); i++) {
      let val: Datapoint & { isOpaque?: boolean } = average[i];
      if (current[i]) {
        val = current[i];
        val.isOpaque = true;
      }
      points.push(val);
    }
    return points;
  }, [current, average]);

  const getLocalTime = (time: string) => {
    const [h, m] = time.split(':');
    const hours = parseInt(h);
    const minutes = parseInt(m);
    const date = new Date();
    if (minutes !== 0) return '';
    if (hours % 2 === 0) return '';
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div
          key={`${d.date}-${d.time}`}
          style={{
            height: `${(d.value / d.max) * 100}%`,
            background: d.isOpaque
              ? colorMixer([255, 0, 0], [0, 0, 255], d.value / d.max)
              : '#555',
            opacity: d.isOpaque ? 1 : 0.5,
          }}
        >
          <p>{getLocalTime(d.time)}</p>
        </div>
      ))}
    </div>
  );
};
export default BarChart;
