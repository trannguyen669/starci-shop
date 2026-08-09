import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { logger } from './logger';
import { requestId } from './middleware/request-id.middleware';

async function bootstrap() {
  const env = loadEnv();

  logger.info('Environment validated');



  const app = await NestFactory.create(AppModule);

   app.use(requestId);

  app.enableShutdownHooks();// tắt app có trật tự

  await app.listen(env.PORT);

  logger.info(
    {
      port: env.PORT,
    },
    'StarCi Shop backend started',
  );
}

bootstrap();