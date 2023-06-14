import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  PutCommandInput,
  GetCommandInput,
  GetCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
  QueryCommandInput,
  QueryCommand,
  QueryCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { DynamoConfig, DynamoQueryOptions } from "src/interfaces/config.interface";
const { REGION, STAGE, CONFIG_ENDPOINT } = process.env

const config: DynamoConfig = {
  region: REGION || "us-east-1"
}

if( STAGE === "dev" ) {
  config.endpoint = CONFIG_ENDPOINT;
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
  } : DynamoQueryOptions):  Promise<QueryCommandOutput>{
    
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

  async getOne(options: DynamoQueryOptions): Promise<Record<string, AttributeValue> | undefined> {
    const result = await this.query(options);
    return result.Items ? result.Items[0] : undefined;
  }

  async update(key: { [key: string]: string | number }, updateValues: object) {
    const parameterToUpdate = this.generateUpdateParams(key, updateValues)
    const parameter = {
      ...parameterToUpdate,
      TableName: this.tableName,
      ReturnValues: 'ALL_NEW',

    }
    const command = new UpdateCommand(parameter);
    return await this.dynamoClient.send(command);
  }

  private generateUpdateParams( key: { [key: string]: string | number }, updateValues: object) {
    const updateParts: string[] = [];
    const attributeNames: { [key: string]: string } = {};
    const attributeValues: { [key: string]: any } = {};

    Object.entries(updateValues).forEach(([fieldName, fieldValue], index) => {
        const fieldKey = `#field${index}`;
        const valueKey = `:value${index}`;

        updateParts.push(`${fieldKey} = ${valueKey}`);
        attributeNames[fieldKey] = fieldName;
        attributeValues[valueKey] = fieldValue;
    });

    const updateExpression = `SET ${updateParts.join(', ')}`;

    return {
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        Key: key
    };
}

}
