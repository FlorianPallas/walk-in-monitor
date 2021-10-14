import type { AverageResponse } from '../functions/average';
import type { CurrentResponse } from '../functions/current';

export const getCurrentData = (from: Date, to: Date) =>
  fetch(
    `/.netlify/functions/current?$from=${from.toISOString()}&$to=${to.toISOString()}`
  ).then((res) => res.json() as Promise<CurrentResponse>);

export const getAverageData = (from: Date, to: Date) =>
  fetch(
    `/.netlify/functions/average?$from=${from.toISOString()}&$to=${to.toISOString()}`
  ).then((res) => res.json() as Promise<AverageResponse>);
