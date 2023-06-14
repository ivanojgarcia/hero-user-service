import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import handleError from '@libs/handleError';
import { getUserById } from './handler';
import { UnauthorizedError, ValidationError } from '@libs/errors';

export const getV1: APIGatewayProxyHandler = async (event) => {
  const { pathParameters, headers } = event
  try {
    if(!headers.Authorization || !headers.Authorization.startsWith('Bearer ')) throw new UnauthorizedError('Unauthorized')
    if(!pathParameters) throw new ValidationError('Missing user ID')
    
    const {id} = pathParameters
    const user = await getUserById(id!)
    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    return handleError(error);
  }
};

