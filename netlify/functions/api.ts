import type { Config } from '@netlify/functions';
import { withLambda } from '@netlify/aws-lambda-compat';
import { handler } from '../../dist/lambda';

export default withLambda(handler);

export const config: Config = {
  path: '/*',
  preferStatic: true,
};