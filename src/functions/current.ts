import type { Handler } from '@netlify/functions';
import type { Datapoint } from '../types';
import { getDataBetween } from '../utils/dynamodb';

export interface CurrentRequest {
  $from: string;
  $to: string;
}
export interface CurrentResponse {
  data: Datapoint[];
}

const handler: Handler = async (event, context) => {
  const { $from, $to } = event.queryStringParameters as Partial<CurrentRequest>;
  if (!$from || !$to) return { statusCode: 400 };

  const data = await getDataBetween(new Date($from), new Date($to));

  return {
    statusCode: 200,
    body: JSON.stringify({ data } as CurrentResponse),
  };
};

export { handler };
