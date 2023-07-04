import { handlerPath } from '@libs/handlerResolver';

export const user = {
    createV1: {
      handler: `${handlerPath(__dirname)}/create/v1/index.createV1`,
      events: [
        {
          http: {
            method: 'POST',
            path: '/api/v1/users',
            cors: true,
          },
        },
      ],
      /**
       * for production change to 1
       */
      provisionedConcurrency: 0, 
    },
    
    getV1: {
      handler: `${handlerPath(__dirname)}/get/v1/index.getV1`,
      events: [
        {
          http: {
            method: 'GET',
            path: '/api/v1/users/{id}',
            cors: true,
            authorizer: {
              name: 'Authorizer',
              resultTtlInSeconds: 30,
              identitySource: 'method.request.header.Authorization',
              type: 'TOKEN'
            },
            request: {
              parameters: {
                paths: {
                  id: true
                }
              }
            }
          },
        },
      ],
      /**
       * for production change to 1
       */
      provisionedConcurrency: 0, 
    },
    
    loginV1: {
      handler: `${handlerPath(__dirname)}/login/v1/index.loginV1`,
      events: [
        {
          http: {
            method: 'POST',
            path: '/api/v1/users/login',
            cors: true
          },
        },
      ],
      /**
       * for production change to 1
       */
      provisionedConcurrency: 0, 
    },

    tokenV1: {
      handler: `${handlerPath(__dirname)}/token/v1/index.tokenV1`,
      events: [
        {
          http: {
            method: 'POST',
            path: '/api/v1/users/token',
            cors: true
          },
        },
      ],
      /**
       * for production change to 1
       */
      provisionedConcurrency: 0, 
    },
  }
