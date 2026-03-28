import { Schema } from 'mongoose';

export interface IWaterEntry {
  _id: string;
  clerkUserId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export const WaterEntrySchema = new Schema(
  {
    _id: { type: String, required: true },
    clerkUserId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false, versionKey: false },
);
