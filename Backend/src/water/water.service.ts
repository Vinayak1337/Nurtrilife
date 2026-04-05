import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IWaterEntry } from './water.schema';

@Injectable()
export class WaterService {
  constructor(@InjectModel('WaterEntry') private readonly waterModel: Model<IWaterEntry>) {}

  async findByDate(clerkUserId: string, date: string): Promise<IWaterEntry[]> {
    return this.waterModel.find({ clerkUserId, date }).sort({ createdAt: -1 }).lean();
  }

  async findByDateRange(clerkUserId: string, startDate: string, endDate: string): Promise<IWaterEntry[]> {
    return this.waterModel
      .find({ clerkUserId, date: { $gte: startDate, $lte: endDate } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async upsert(data: IWaterEntry): Promise<void> {
    await this.waterModel.replaceOne({ _id: data._id }, data, { upsert: true });
  }

  async delete(id: string, clerkUserId: string): Promise<void> {
    await this.waterModel.deleteOne({ _id: id, clerkUserId });
  }
}
