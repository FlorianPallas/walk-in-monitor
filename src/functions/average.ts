import type { Handler } from '@netlify/functions';
import type { Datapoint } from '../types';
import { getAverageBetween } from '../utils/dynamodb';

export interface AverageRequest {
  $from: string;
  $to: string;
}
export interface AverageResponse {
  data: Datapoint[];
}

const handler: Handler = async (event, context) => {
  const { $from, $to } = event.queryStringParameters as Partial<AverageRequest>;
  if (!$from || !$to) return { statusCode: 400 };

  const data = await getAverageBetween(new Date($from), new Date($to));

  return {
    statusCode: 200,
    body: JSON.stringify({ data } as AverageResponse),
  };
};

export { handler };
