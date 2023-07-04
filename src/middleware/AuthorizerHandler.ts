import { UserTokenService } from "@user/service/UserTokenService";
import { Handler } from "aws-lambda";
/**
 * @description Creates the IAM policy for the response.
 */
const generatePolicy = (principalId: any, effect: any, resource: any, data: any) => {
    const authResponse: any = {
      principalId
    };
  
    if (effect && resource) {
      const policyDocument: any = {
        Version: '2012-10-17',
        Statement: []
      };
  
      const statement = {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      };
  
      policyDocument.Statement[0] = statement;
      authResponse.policyDocument = policyDocument;
    }
  
    authResponse.context = {
      stringKey: JSON.stringify(data)
      //role: user.role --> "principalId" could be an object that also has role
    };
  
    return authResponse;
  };

export const handler: Handler = async (event: any, context: any) => {
    const userTokenService = new UserTokenService();

    const clientToken = event.headers.Authorization;
    const [ , token ] = clientToken.split(' ');
    try {
        const tokenDecoded = await userTokenService.validateTokenByPublicKey(token);
        
        const policy = !tokenDecoded.id ? 'Allow' : 'Deny';
    
        const response = JSON.stringify({
            user: tokenDecoded
        });
    
        return generatePolicy('user', policy, event.methodArn, response);
    } catch (error) {
      console.log("Error :_:::::::: ", error.message)
      return generatePolicy('user', 'Deny', event.methodArn, error.message);
    }
}