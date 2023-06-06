import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import handleError from '@libs/handleError';
import { getUserById } from './handler';

export const getV1: APIGatewayProxyHandler = async (event) => {
  const { pathParameters } = event
  if(!pathParameters) throw new Error('No path parameters')
  const {id} = pathParameters
  try {
    const user = await getUserById(id!)
    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    return handleError(error);
  }
};

