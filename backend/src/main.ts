import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { logger } from './logger';
import { requestId } from './middleware/request-id.middleware';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const env = loadEnv();

  logger.info('Environment validated');

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.enableCors({
  origin: 'http://localhost:3001',}); 

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(requestId);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StarCi Shop')
    .setDescription('StarCi Shop API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks(); // tắt app có trật tự

  await app.listen(env.PORT);

  logger.info(
    {
      port: env.PORT,
    },
    'StarCi Shop backend started',
  );
}

void bootstrap();
