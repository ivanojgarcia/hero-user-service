import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import handleError from '@libs/handleError';
import { generateRefreshToken } from './handler';



export const tokenV1: APIGatewayProxyHandler = async (event) => {
  try {
    const tokenData = JSON.parse(event.body || '{}');
    
    const token = await generateRefreshToken(tokenData);
    return {
      statusCode: 200,
      body: JSON.stringify(token),
    };
  } catch (error) {
    return handleError(error);
  }
};

