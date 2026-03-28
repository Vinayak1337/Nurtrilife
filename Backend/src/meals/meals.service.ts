import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMeal } from './meals.schema';

@Injectable()
export class MealsService {
  constructor(@InjectModel('Meal') private readonly mealModel: Model<IMeal>) {}

  async findByDate(clerkUserId: string, date: string): Promise<IMeal[]> {
    return this.mealModel.find({ clerkUserId, date }).sort({ createdAt: -1 }).lean();
  }

  async findByDateRange(clerkUserId: string, startDate: string, endDate: string): Promise<IMeal[]> {
    return this.mealModel
      .find({ clerkUserId, date: { $gte: startDate, $lte: endDate } })
      .sort({ date: -1, createdAt: -1 })
      .lean();
  }

  async upsert(data: IMeal): Promise<void> {
    await this.mealModel.replaceOne({ _id: data._id }, data, { upsert: true });
  }

  async delete(id: string, clerkUserId: string): Promise<void> {
    await this.mealModel.deleteOne({ _id: id, clerkUserId });
  }
}
