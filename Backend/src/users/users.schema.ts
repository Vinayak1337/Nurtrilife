import { Schema } from 'mongoose';

export interface IUser {
  _id: string;
  clerkUserId: string;
  name: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatsGoal: number;
  dailyWaterGoal: number;
  healthFocus: string[];
  currentStreak: number;
  longestStreak: number;
  updatedAt: string;
}

export const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    clerkUserId: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: String,
    age: Number,
    weight: Number,
    height: Number,
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyProteinGoal: { type: Number, default: 150 },
    dailyCarbsGoal: { type: Number, default: 250 },
    dailyFatsGoal: { type: Number, default: 65 },
    dailyWaterGoal: { type: Number, default: 2500 },
    healthFocus: { type: [String], default: [] },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false, versionKey: false },
);
