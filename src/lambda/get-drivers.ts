import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import drivers from '../data/drivers';

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.log('Getting drivers...');

  const { forceError } = event.queryStringParameters || {};

  if (forceError === 'true') {
    throw new Error('Error fetching drivers');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ count: drivers.length, data: drivers }),
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Content-Type',
      'access-control-allow-methods': 'OPTIONS,GET',
    },
  };
}
