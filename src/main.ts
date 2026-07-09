import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger available at: http://localhost:${port}/api/docs`);
  console.log(`📖 API JSON: http://localhost:${port}/api/docs-json`);
}
bootstrap();
