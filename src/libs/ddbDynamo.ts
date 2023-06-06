import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  PutCommandInput,
  GetCommandInput,
  GetCommand,
  DynamoDBDocumentClient,
  QueryCommandInput,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { DynamoConfig, DynamoQueryOptions } from "src/interfaces/config.interface";
const { REGION, STAGE } = process.env

const config: DynamoConfig = {
  region: REGION || "us-east-1"
}

if( STAGE === "dev" ) {
  config.accessKeyId = "dummy";
  config.secretAccessKey = "dummy";
  config.endpoint = "http://localhost:8000";
  console.log("dynamodb-local mode", config);
}

const marshallOptions = {
  convertClassInstanceToMap: true,
};

const translateConfig = { marshallOptions };

const client = new DynamoDBClient(config);
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig); 

export class Dynamo {
  private dynamoClient: DynamoDBClient;

  constructor( private readonly tableName: string ) {
    this.dynamoClient =ddbDocClient;
  }
  
  async write(data: Record<string, any>): Promise<Record<string, any>> {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: data,
    };
    const command = new PutCommand(params);
    await this.dynamoClient.send(command);
    return data;
  }

  async get(id: string): Promise<Record<string, any> | undefined> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        id,
      },
    };
    const command = new GetCommand(params);
    const response = await this.dynamoClient.send(command);

    return response.Item;
  }

  async query({
    index,
    pkValue,
    pkKey = "pk",
    skValue,
    skKey = "sk"
  } : DynamoQueryOptions) {
    
    const skExpression = skValue ? `AND ${skKey} = :rangeValue` : "";

    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: index,
      KeyConditionExpression: `${pkKey} = :hashValue ${skExpression}`,
      ExpressionAttributeValues: {
        ":hashValue": pkValue,
      },
    }

    const command = new QueryCommand(params);
    const res = await this.dynamoClient.send(command);

    return res;
  }

/*
  query: async ({
    tableName,
    index,

    pkValue,
    pkKey = "pk",

    skValue,
    skKey = "sk",

    sortAscending = true,
  }: {
    tableName: string;
    index: string;

    pkValue: string;
    pkKey?: string;

    skValue?: string;
    skKey?: string;

    sortAscending?: boolean;
  }) => {
    const skExpression = skValue ? ` AND ${skKey} = :rangeValue` : "";

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: index,
      KeyConditionExpression: `${pkKey} = :hashValue${skExpression}`,
      ExpressionAttributeValues: {
        ":hashValue": pkValue,
      },
    };

    if (skValue) {
      params.ExpressionAttributeValues[":rangeValue"] = skValue;
    }

    const command = new QueryCommand(params);
    const res = await dynamoClient.send(command);

    return res.Items;
  },
};

*/

}
