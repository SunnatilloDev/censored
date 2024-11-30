import { Module, Logger } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file immediately
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const logger = new Logger('ConfigModule');
logger.debug(`Loading environment from: ${envPath}`);
logger.debug('Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  TELEGRAM_BOT_TOKEN_EXISTS: !!process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID_EXISTS: !!process.env.TELEGRAM_CHAT_ID,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      ignoreEnvFile: true, // We loaded it manually above
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
        TELEGRAM_CHAT_ID: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
      load: [() => ({
        database: {
          url: process.env.DATABASE_URL,
        },
        telegram: {
          botToken: process.env.TELEGRAM_BOT_TOKEN,
          chatId: process.env.TELEGRAM_CHAT_ID,
        },
        server: {
          port: parseInt(process.env.PORT || '3000', 10),
          env: process.env.NODE_ENV,
        },
      })],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
