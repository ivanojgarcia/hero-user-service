import type { AWS } from '@serverless/typescript';
import { ROLE_DYNAMO_STATEMENTS } from '@resources/iam/dynamo.iam'
import { CUSTOM_DYNAMO_CONFIG, USER_TABLE, USER_TOKEN_TABLE } from '@resources/dynamo';
import { ES_BUILD, SLS_OFFLINE } from '@resources/custom.config';



import {default as functions} from '@functions/index'
import { PLUGINS_ARRAY } from '@resources/plugins';
import { ROLE_MANAGER_SECRET_STATEMENTS } from '@resources/iam/secretManager.iam';

const serverlessConfiguration: AWS = {
  service: 'hero-dinzy-be',
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
      USER_TOKEN_TABLE: '${self:service}-user-token-table-${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ACCOUNT_ID: '${aws:accountId}',
      REGION: '${aws:region}',
      AUTH_TOKEN_KEY: '${file(src/resources/environment/variable.${self:provider.stage}.json):AUTH_TOKEN_KEY}',
      AUTH_REFRESH_TOKEN_KEY: '${file(src/resources/environment/variable.${self:provider.stage}.json):AUTH_REFRESH_TOKEN_KEY}',
      CONFIG_ENDPOINT: '${file(src/resources/environment/variable.${self:provider.stage}.json):CONFIG_ENDPOINT}',
      SECRET_NAME: '${file(src/resources/environment/variable.${self:provider.stage}.json):SECRET_NAME}',
      SECRET_KEY: '${file(src/resources/environment/variable.${self:provider.stage}.json):SECRET_KEY}',
      SECRET_PUBLIC_NAME: '${file(src/resources/environment/variable.${self:provider.stage}.json):SECRET_PUBLIC_NAME}',
      SECRET_PUBLIC_KEY: '${file(src/resources/environment/variable.${self:provider.stage}.json):SECRET_PUBLIC_KEY}',
      PATH_KEY: '${file(src/resources/environment/variable.${self:provider.stage}.json):PATH_KEY}',
    },
    iam: {
      role: {
        statements: [
          ROLE_DYNAMO_STATEMENTS,
          ROLE_MANAGER_SECRET_STATEMENTS
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
      ...USER_TABLE,
      ...USER_TOKEN_TABLE,
    }
  },
};

module.exports = serverlessConfiguration;
