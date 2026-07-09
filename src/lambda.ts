import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { createApp } from './bootstrap';

let cachedHandler: ((event: any, context: any) => Promise<any>) | null = null;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  try {
    const expressApp = express();
    const app = await createApp(new ExpressAdapter(expressApp));
    await app.init();

    cachedHandler = serverless(expressApp);

    return cachedHandler;
  } catch (error) {
    console.error('Failed to initialize Netlify handler', error);
    throw error;
  }
}

export async function handler(event: any, context: any) {
  const server = await getHandler();
  return server(event, context);
}