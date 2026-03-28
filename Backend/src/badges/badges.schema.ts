import { Schema } from 'mongoose';

export interface IBadge {
  _id: string;
  clerkUserId: string;
  badgeId: string;
  unlockedAt: string;
}

export const BadgeSchema = new Schema(
  {
    _id: { type: String, required: true },
    clerkUserId: { type: String, required: true, index: true },
    badgeId: { type: String, required: true },
    unlockedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false, versionKey: false },
);
