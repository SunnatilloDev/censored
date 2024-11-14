import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './auth/guards/roles.guard'; // Use named import for RolesGuard
import * as express from 'express';
import * as process from 'node:process';

config(); // Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://cripta-valuta.vercel.app', 'http://localhost:8000'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    exposedHeaders: ['Authorization'], // Exposed headers
    credentials: true, // Allow credentials (e.g., cookies)
    maxAge: 86400, // Cache preflight for 1 day
    preflightContinue: false, // Stop at CORS
    optionsSuccessStatus: 200, // Use 200 status for OPTIONS success
  });
  // Set up Swagger configuration
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
      'access-token', // Name this security requirement for Swagger
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document); // Swagger UI available at /api/docs

  // Enable CORS with Authorization header included explicitly

  // Global validation pipe to automatically validate incoming data
  app.useGlobalPipes(new ValidationPipe());

  // Apply RolesGuard globally
  app.useGlobalGuards(new RolesGuard(new Reflector()));

  // Serve static files from the "uploads" folder
  app.use('/uploads', express.static('uploads'));

  // Start the application and listen on port 8080
  await app.listen(process.env.PORT || 8080);
  console.log('Application is running on:', await app.getUrl());
}

bootstrap();
