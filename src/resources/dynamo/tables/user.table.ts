export default {
    UserTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Delete',
        Properties: {
            TableName: '${self:provider.environment.USER_TABLE}',
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'email', AttributeType: 'S' },
            ],
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes: [
                    {
                        IndexName: 'email_index',
                        KeySchema: [
                            { AttributeName: 'email', KeyType: 'HASH' }
                        ],
                        Projection: {
                            // attributes to project into the index
                            ProjectionType: 'ALL', // (ALL | KEYS_ONLY | INCLUDE)
                        },
                    },
                ],
            StreamSpecification: {
                StreamViewType: 'NEW_IMAGE'
            }
        },
    }
}