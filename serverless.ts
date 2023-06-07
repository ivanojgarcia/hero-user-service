import type { AWS } from '@serverless/typescript';
import { ROLE_DYNAMO_STATEMENTS } from '@resources/iam/dynamo.iam'
import { CUSTOM_DYNAMO_CONFIG, USER_TABLE } from '@resources/dynamo';
import { ES_BUILD, SLS_OFFLINE } from '@resources/custom.config';

import {default as functions} from '@functions/index'
import { PLUGINS_ARRAY } from '@resources/plugins';

const serverlessConfiguration: AWS = {
  service: 'hero-zimpple-be',
  frameworkVersion: '3',
  plugins: PLUGINS_ARRAY,
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: '${opt:stage, \'dev\'}',
    memorySize: 128,
    httpApi: {
      cors: true
    },
    // tracing: {
    //     lambda: true,
    //     apiGateway: true
    // },
    apiGateway: {
      // minimumCompressionSize: 128,
      shouldStartNameWithService: true,
    },
    environment: {
      STAGE: '${self:provider.stage}',
      USER_TABLE: '${self:service}-user-table-${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ACCOUNT_ID: '${aws:accountId}',
      REGION: '${aws:region}'
    },
    iam: {
      role: {
        statements: [
          ROLE_DYNAMO_STATEMENTS
        ]
      }
    }
  },
  // import the function via paths
  functions,
  package: { individually: true },
  custom: {
    ...CUSTOM_DYNAMO_CONFIG,
    ...ES_BUILD,
    ...SLS_OFFLINE
  },
  resources: {
    Resources: {
      ...USER_TABLE
    }
  },
};

module.exports = serverlessConfiguration;
