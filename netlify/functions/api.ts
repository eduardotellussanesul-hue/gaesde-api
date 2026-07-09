import type { Config } from '@netlify/functions';
import { withLambda } from '@netlify/aws-lambda-compat';
import type { HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/aws-lambda-compat';
import { handler } from '../../dist/lambda';

function getCorsHeaders(event: HandlerEvent): Record<string, string> {
  const origin = event.headers?.origin || event.headers?.Origin || '*';

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'Authorization,Content-Type,X-Requested-With',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

export default withLambda(
  async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    const corsHeaders = getCorsHeaders(event);

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: corsHeaders,
        body: '',
      };
    }

    try {
      const response = await handler(event, context);

      return {
        ...response,
        headers: {
          ...corsHeaders,
          ...(response.headers ?? {}),
        },
      };
    } catch (error) {
      console.error('Netlify function execution failed', error);

      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        statusCode: 500,
        headers: {
          ...corsHeaders,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      };
    }
  },
);

export const config: Config = {
  path: '/*',
  preferStatic: true,
};