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
  QueryCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { DynamoConfig, DynamoQueryOptions } from "../../src/interfaces/config.interface";
import { DatabaseError } from "@libs/errors";
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
    try {
      const params: PutCommandInput = {
        TableName: this.tableName,
        Item: data,
      };
      const command = new PutCommand(params);
      await this.dynamoClient.send(command);
      return data;
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

  async get(id: string): Promise<Record<string, any> | undefined> {
    try {
      const params: GetCommandInput = {
        TableName: this.tableName,
        Key: {
          id,
        },
      };
      const command = new GetCommand(params);
      const response = await this.dynamoClient.send(command);
  
      return response.Item;
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

  async delete(id: string): Promise<DeleteCommandOutput> {
    try {
      const params: DeleteCommandInput = {
        TableName: this.tableName,
        Key: {
          id,
        },
        ReturnValues: "ALL_OLD"
      };
      const command = new DeleteCommand(params);
     const itemDeleted = await this.dynamoClient.send(command);
     return itemDeleted.Attributes?.id
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

  async query({
    index,
    pkValue,
    pkKey = "pk",
    skValue,
    skKey = "sk"
  } : DynamoQueryOptions):  Promise<QueryCommandOutput>{
    
    try {
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
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

  async getOne(options: DynamoQueryOptions): Promise<Record<string, AttributeValue> | undefined> {
    try {
      const result = await this.query(options);
      return result.Items ? result.Items[0] : undefined;
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

    /**
   * Method to update a record in the DynamoDB table.
   * @param key - An object containing the key(s) of the item to update.
   * @param updateValues - An object containing the field values to update.
   * @returns Promise resolving with the outcome of the update operation.
   */
  async update(key: { [key: string]: string | number }, updateValues: object) {
    try {
      // Generate the parameters for the update operation.
      const parameterToUpdate = this.generateUpdateParams(key, updateValues)

      // Add the table and return options to the parameters.
      const parameter = {
        ...parameterToUpdate,
        TableName: this.tableName,
        ReturnValues: 'ALL_NEW',
      }

      // Create a new update command with the parameters.
      const command = new UpdateCommand(parameter);

      // Send the command to the DynamoDB client and return the result.
      return await this.dynamoClient.send(command);
    } catch (error) {
      throw new DatabaseError(error)
    }
  }

  /**
   * Generates the parameters for a DynamoDB update operation.
   * @param key - An object containing the key(s) of the item to update.
   * @param updateValues - An object containing the field values to update.
   * @returns An object with the parameters for the update operation.
   */
  private generateUpdateParams(key: { [key: string]: string | number }, updateValues: object) {
    // Initialize the arrays and objects used to build the update expression.
    const updateParts: string[] = [];
    const attributeNames: { [key: string]: string } = {};
    const attributeValues: { [key: string]: any } = {};

    // Loop over each field-value pair in updateValues.
    Object.entries(updateValues).forEach(([fieldName, fieldValue], index) => {
      // Create the keys for the field and the value.
      const fieldKey = `#field${index}`;
      const valueKey = `:value${index}`;

      // Add this field's update part to updateParts.
      updateParts.push(`${fieldKey} = ${valueKey}`);
      // Map the field key to the field name in attributeNames.
      attributeNames[fieldKey] = fieldName;
      // Map the value key to the field value in attributeValues.
      attributeValues[valueKey] = fieldValue;
    });

    // Create the full update expression.
    const updateExpression = `SET ${updateParts.join(', ')}`;

    // Return an object with all the components needed for the update operation.
    return {
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      Key: key
    };
  }

}
