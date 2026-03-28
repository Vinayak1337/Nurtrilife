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

  async upsert(data: IUser): Promise<void> {
    await this.userModel.replaceOne({ _id: data._id }, data, { upsert: true });
  }
}
