import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
config();
import express from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('CryptoArticle API')
    .setDescription('API documentation')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use("/uploads", express.static("uploads"))
  await app.listen(8080);
}
bootstrap();
