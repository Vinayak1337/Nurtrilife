import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async findByClerkId(clerkUserId: string): Promise<IUser | null> {
    return this.userModel.findOne({ clerkUserId }).lean();
  }

  async findOrCreate(clerkUserId: string): Promise<IUser> {
    const existing = await this.userModel.findOne({ clerkUserId }).lean();
    if (existing) return existing;

    const doc: IUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      clerkUserId,
      name: 'User',
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyCarbsGoal: 250,
      dailyFatsGoal: 65,
      dailyWaterGoal: 2500,
      healthFocus: [],
      currentStreak: 0,
      longestStreak: 0,
      updatedAt: new Date().toISOString(),
    };
    await this.userModel.replaceOne({ _id: doc._id }, doc, { upsert: true });
    return doc;
  }

  async updateStreaks(clerkUserId: string, currentStreak: number, longestStreak: number): Promise<void> {
    await this.userModel.updateOne(
      { clerkUserId },
      { $set: { currentStreak, longestStreak, updatedAt: new Date().toISOString() } },
    );
  }

  async upsert(data: IUser): Promise<void> {
    await this.userModel.replaceOne({ _id: data._id }, data, { upsert: true });
  }
}
