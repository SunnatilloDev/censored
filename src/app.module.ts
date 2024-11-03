import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModuleFromNest } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesService } from './categories/categories.service';
import { AirdropsService } from './airdrops/airdrops.service';
import { ArticlesService } from './articles/articles.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { CategoriesController } from './categories/categories.controller';
import { AirdropsController } from './airdrops/airdrops.controller';
import { ArticlesController } from './articles/articles.controller';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { CategoriesModule } from './categories/categories.module';
import { AirdropsModule } from './airdrops/airdrops.module';
import { ArticlesModule } from './articles/articles.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BotModule } from './bot/bot.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ReferralModule } from './referral/referral.module';
import { AdvertisementService } from './advertisement/advertisement.service';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { TagsModule } from './tags/tags.module';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [
    ConfigModuleFromNest.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    AirdropsModule,
    CategoriesModule,
    PrismaModule,
    BotModule,
    NotificationsModule,
    ReferralModule,
    AdvertisementModule,
    TagsModule,
  ],
  controllers: [
    AuthController,
    UsersController,
    ArticlesController,
    AirdropsController,
    CategoriesController,
  ],
  providers: [
    AuthService,
    UsersService,
    ArticlesService,
    AirdropsService,
    CategoriesService,
    PrismaService,
    NotificationsService,
    AdvertisementService,UploadService
  ],
})
export class AppModule {}
