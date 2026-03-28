import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBadge } from './badges.schema';

@Injectable()
export class BadgesService {
  constructor(@InjectModel('Badge') private readonly badgeModel: Model<IBadge>) {}

  async findByClerkId(clerkUserId: string): Promise<string[]> {
    const docs = await this.badgeModel
      .find({ clerkUserId })
      .sort({ unlockedAt: -1 })
      .lean();
    return docs.map((d) => d.badgeId);
  }

  async upsert(clerkUserId: string, badgeId: string): Promise<void> {
    const doc: IBadge = {
      _id: `${clerkUserId}_${badgeId}`,
      clerkUserId,
      badgeId,
      unlockedAt: new Date().toISOString(),
    };
    await this.badgeModel.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
