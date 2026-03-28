import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { MealsModule } from './meals/meals.module';
import { WaterModule } from './water/water.module';
import { BadgesModule } from './badges/badges.module';
import { AnalyzeModule } from './analyze/analyze.module';
import { RecommendModule } from './recommend/recommend.module';
import { ClerkAuthGuard } from './auth/clerk.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    MealsModule,
    WaterModule,
    BadgesModule,
    AnalyzeModule,
    RecommendModule,
  ],
  controllers: [AppController],
  providers: [
    // Register guard via DI so Reflector can be injected (needed for @Public())
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}
