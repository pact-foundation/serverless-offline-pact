import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";

// API GW
export type PromiseHandler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context
) => Promise<TResult>;

export type APIGatewayProxyPromiseHandler = PromiseHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult | undefined
>;
