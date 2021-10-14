import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Datapoint } from '../types';
import { formatDate } from './date';

export const client = new DynamoDBClient({ region: 'eu-central-1' });
export const documentClient = DynamoDBDocumentClient.from(client);
const DYNAMODB_TABLE = 'walk-in-utilization';

export const getData = () =>
  documentClient
    .send(
      new ScanCommand({
        TableName: DYNAMODB_TABLE,
      })
    )
    .then((res) => (res.Items as Datapoint[]) ?? []);

export const getDataAt = (at: Date) =>
  documentClient
    .send(
      new QueryCommand({
        TableName: DYNAMODB_TABLE,
        KeyConditionExpression: '#date = :date',
        ExpressionAttributeNames: { '#date': 'date' },
        ExpressionAttributeValues: { ':date': formatDate(at) },
      })
    )
    .then((res) => (res.Items as Datapoint[]) ?? []);

export const getDataBetween = async (from: Date, to: Date) => {
  const fromHours = from.getUTCHours();
  const toHours = to.getUTCHours();
  const fromMinutes = from.getUTCMinutes();
  const toMinutes = to.getUTCMinutes();
  const fromDay = from.getUTCDay();
  const toDay = to.getUTCDay();

  if (fromDay === toDay) {
    return (await getDataAt(from)).filter((p) => {
      let [h, m] = p.time.split(':');
      const hours = parseInt(h);
      const minutes = parseInt(m);
      if (hours < fromHours) return false;
      if (hours === fromHours && minutes < fromMinutes) return false;
      if (hours > toHours) return false;
      if (hours === toHours && minutes > toMinutes) return false;
      return true;
    });
  }

  const points1 = (await getDataAt(from)).filter((p) => {
    let [h, m] = p.time.split(':');
    const hours = parseInt(h);
    const minutes = parseInt(m);
    if (hours < fromHours) return false;
    if (hours === fromHours && minutes < fromMinutes) return false;
    return true;
  });
  const points2 = (await getDataAt(to)).filter((p) => {
    let [h, m] = p.time.split(':');
    const hours = parseInt(h);
    const minutes = parseInt(m);
    if (hours > toHours) return false;
    if (hours === toHours && minutes > toMinutes) return false;
    return true;
  });
  return [...points1, ...points2];
};

export const getAverageAt = (at: string) =>
  documentClient
    .send(
      new QueryCommand({
        TableName: DYNAMODB_TABLE,
        KeyConditionExpression: '#date = :date',
        ExpressionAttributeNames: { '#date': 'date' },
        ExpressionAttributeValues: { ':date': `$avg_${at}` },
      })
    )
    .then((res) => (res.Items as Datapoint[]) ?? []);

export const getAverageBetween = async (from: Date, to: Date) => {
  const fromHours = from.getUTCHours();
  const toHours = to.getUTCHours();
  const fromMinutes = from.getUTCMinutes();
  const toMinutes = to.getUTCMinutes();
  const fromDay = from.getUTCDay();
  const toDay = to.getUTCDay();

  if (fromDay === toDay) {
    return (await getAverageAt(`daily_${fromDay}`)).filter((p) => {
      let [h, m] = p.time.split(':');
      const hours = parseInt(h);
      const minutes = parseInt(m);
      if (hours < fromHours) return false;
      if (hours === fromHours && minutes < fromMinutes) return false;
      if (hours > toHours) return false;
      if (hours === toHours && minutes > toMinutes) return false;
      return true;
    });
  }

  const points1 = (await getAverageAt(`daily_${fromDay}`)).filter((p) => {
    let [h, m] = p.time.split(':');
    const hours = parseInt(h);
    const minutes = parseInt(m);
    if (hours < fromHours) return false;
    if (hours === fromHours && minutes < fromMinutes) return false;
    return true;
  });
  const points2 = (await getAverageAt(`daily_${toDay}`)).filter((p) => {
    let [h, m] = p.time.split(':');
    const hours = parseInt(h);
    const minutes = parseInt(m);
    if (hours > toHours) return false;
    if (hours === toHours && minutes > toMinutes) return false;
    return true;
  });
  return [...points1, ...points2];
};

export const updateAverage = async () => {
  const week: {
    [day: number]: {
      [time: string]: {
        value: number;
        count: number;
      };
    };
  } = {};

  const points = await getData();
  for (const point of points) {
    if (point.date.startsWith('$')) continue;
    console.log(point.date, new Date(point.date));

    const [y, m, d] = point.date.split('/');
    const date = new Date();
    date.setUTCFullYear(parseInt(y));
    date.setUTCMonth(parseInt(m) - 1);
    date.setUTCDate(parseInt(d));
    const weekday = date.getUTCDay();

    if (!week[weekday]) week[weekday] = {};
    if (!week[weekday][point.time])
      week[weekday][point.time] = { value: 0, count: 0 };
    if (point.max > 0)
      week[weekday][point.time].value += point.value / point.max;
    week[weekday][point.time].count++;
  }

  for (const weekday in week) {
    if (Object.prototype.hasOwnProperty.call(week, weekday)) {
      const day = week[weekday];
      for (const time in day) {
        if (Object.prototype.hasOwnProperty.call(day, time)) {
          const sum = day[time];
          if (sum.count > 0) week[weekday][time].value = sum.value / sum.count;

          await documentClient.send(
            new PutCommand({
              TableName: DYNAMODB_TABLE,
              Item: {
                date: `$avg_daily_${weekday}`,
                time,
                value: week[weekday][time].value,
                max: 1,
              } as Datapoint,
            })
          );
        }
      }
    }
  }
};
