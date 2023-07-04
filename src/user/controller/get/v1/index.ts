import { APIGatewayProxyHandler, Context } from 'aws-lambda';
import 'source-map-support/register';
import handleError from '@libs/handleError';
import { getUserById } from './handler';
import { ValidationError } from '@libs/errors';

export const getV1: APIGatewayProxyHandler = async (event, context: any) => {
  console.log("🚀 ~ file: index.ts:8 ~ constgetV1:APIGatewayProxyHandler= ~ contex:", context.requestContext)
  const { pathParameters } = event
  try {
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

