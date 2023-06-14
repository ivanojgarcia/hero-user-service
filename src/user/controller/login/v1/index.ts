import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import handleError from '@libs/handleError';
import { userLogin } from './handler';

export const loginV1: APIGatewayProxyHandler = async (event) => {
  try {
    const userData = JSON.parse(event.body || '{}');
    const token = await userLogin(userData);
    return {
      statusCode: 200,
      body: JSON.stringify(token),
    };
  } catch (error) {
    return handleError(error);
  }
};

