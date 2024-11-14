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
  app.enableCors({
    origin: 'https://cripta-valuta.vercel.app', // Specific frontend origin
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Authorization', // Expose Authorization for frontend access
    credentials: true, // Enable cookies and auth headers
  });

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
