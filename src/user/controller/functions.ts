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
  }
