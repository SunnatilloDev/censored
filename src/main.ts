import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'; // Use named import

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CryptoArticle API')
    .setDescription('API documentation')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use('/uploads', express.static('uploads')); // Use named import

  await app.listen(8080);
}

bootstrap();
