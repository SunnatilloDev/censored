import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import * as compression from 'compression';
import helmet from 'helmet';
const express = require('express');
async function bootstrap() {
  // Load env variables early
  const logger = new Logger('Bootstrap');
  logger.log('Loading environment variables...');

  // Log the current working directory and NODE_ENV
  logger.debug(`Current working directory: ${process.cwd()}`);
  logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global pipes and filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Crypto Article API')
    .setDescription(
      'API for managing crypto-related articles and user subscriptions',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Static files
  app.use('uploads', express.static('uploads'));

  // Start server
  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}

bootstrap();
