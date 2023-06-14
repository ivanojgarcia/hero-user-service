export const ROLE_DYNAMO_STATEMENTS = {
  Effect: 'Allow',
  Action: [
  'dynamodb:DescribeTable',
  'dynamodb:Query',
  'dynamodb:Scan',
  'dynamodb:GetItem',
  'dynamodb:PutItem',
  'dynamodb:UpdateItem',
  'dynamodb:DeleteItem',
  ],
  Resource: [
    "arn:aws:dynamodb:${opt:region, self:provider.environment.REGION}:*:table/${self:provider.environment.USER_TABLE}",
    "arn:aws:dynamodb:${opt:region, self:provider.environment.REGION}:*:table/${self:provider.environment.USER_TABLE}/*",
    "arn:aws:dynamodb:${opt:region, self:provider.environment.REGION}:*:table/${self:provider.environment.USER_TOKEN_TABLE}",
    "arn:aws:dynamodb:${opt:region, self:provider.environment.REGION}:*:table/${self:provider.environment.USER_TOKEN_TABLE}/*"
  ],
}