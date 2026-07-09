import type { Config } from '@netlify/functions';
import { withLambda } from '@netlify/aws-lambda-compat';
import type { HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/aws-lambda-compat';
import { handler } from '../../dist/lambda';

export default withLambda(
  async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    try {
      return await handler(event, context);
    } catch (error) {
      console.error('Netlify function execution failed', error);

      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        statusCode: 500,
        headers: {
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