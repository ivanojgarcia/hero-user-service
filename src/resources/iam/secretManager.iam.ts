export const ROLE_MANAGER_SECRET_STATEMENTS = {
  Effect: 'Allow',
  Action: [
  'secretsmanager:GetSecretValue',
  ],
  Resource: [
    "arn:aws:secretsmanager:${opt:region, self:provider.environment.REGION}:${self:provider.environment.ACCOUNT_ID}:secret:${self:provider.environment.SECRET_KEY}",
    "arn:aws:secretsmanager:${opt:region, self:provider.environment.REGION}:${self:provider.environment.ACCOUNT_ID}:secret:${self:provider.environment.SECRET_KEY}"
  ],
}