import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './auth/guards/roles.guard';
import * as express from 'express';
import * as process from 'node:process';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CryptoArticle API')
    .setDescription('API documentation for CryptoArticle')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Explicit CORS config with all options
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        ['https://cripta-valuta.vercel.app', 'http://localhost:8000'].includes(
          origin,
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new RolesGuard(new Reflector()));
  app.use('/uploads', express.static('uploads'));

  await app.listen(process.env.PORT || 8080);
  console.log('Application is running on:', await app.getUrl());
}

bootstrap();
