import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';
import { WaterEntrySchema } from './water.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'WaterEntry', schema: WaterEntrySchema, collection: 'water_entries' },
    ]),
  ],
  controllers: [WaterController],
  providers: [WaterService],
})
export class WaterModule {}
