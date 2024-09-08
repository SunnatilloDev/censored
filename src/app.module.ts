import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModuleFromNest } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
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
    ConfigModule,
    PrismaModule,
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
  ],
})
export class AppModule {}
