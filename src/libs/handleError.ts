import { APIGatewayProxyResult } from "aws-lambda";
import { CustomError } from "./errors";

export default function handleError(error: Error): APIGatewayProxyResult {
  console.log("🚀 ~ file: handleError.ts:6 ~ handleError ~ error:", error)
  if (error instanceof CustomError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ message: error.message }),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
}
