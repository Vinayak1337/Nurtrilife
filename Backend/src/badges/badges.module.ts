import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BadgeSchema } from './badges.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Badge', schema: BadgeSchema, collection: 'badges' }]),
  ],
  controllers: [BadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}
