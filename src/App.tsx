import { ChangeEvent, FC, useEffect, useState } from 'react';
import BarChart from './components/BarChart';
import type { Datapoint } from './types';
import { getAverageData, getCurrentData } from './utils/api';
import { getDateFromWeekday, getDayRange } from './utils/date';

const App: FC = () => {
  const [weekday, setWeekday] = useState<number | undefined>();
  const [current, setCurrent] = useState<Datapoint[]>([]);
  const [average, setAverage] = useState<Datapoint[]>([]);

  const fetchData = () => {
    setAverage([]);
    setCurrent([]);
    if (weekday === undefined) return;
    const date = getDateFromWeekday(weekday);
    if (weekday === new Date().getDay()) {
      getCurrentData(...getDayRange())
        .then((res) => setCurrent(res.data))
        .catch((err) => console.error(err));
      getAverageData(...getDayRange())
        .then((res) => setAverage(res.data))
        .catch((err) => console.error(err));
    } else {
      getAverageData(...getDayRange(date))
        .then((res) => setCurrent(res.data))
        .catch((err) => console.error(err));
    }
  };

  const onWeekdayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const day = parseInt(e.currentTarget.value);
    if (day < 0 || day > 6) return;
    setWeekday(day);
  };

  useEffect(() => {
    console.log(new Date().getDay());
    setWeekday(new Date().getDay());
  }, []);

  useEffect(fetchData, [weekday]);

  return (
    <>
      <BarChart current={current} average={average} />
      <div className="actions">
        <select onChange={onWeekdayChange} defaultValue={new Date().getDay()}>
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </select>
        <button onClick={fetchData}>Refresh</button>
      </div>
    </>
  );
};
export default App;
