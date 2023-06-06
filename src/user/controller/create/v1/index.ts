import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createUser } from './handler';
import handleError from '@libs/handleError';

export const createV1: APIGatewayProxyHandler = async (event) => {
  try {
    const userData = JSON.parse(event.body || '{}');

    const user = await createUser(userData);
    return {
      statusCode: 201,
      body: JSON.stringify(user),
    };
  } catch (error) {
    return handleError(error);
  }
};

