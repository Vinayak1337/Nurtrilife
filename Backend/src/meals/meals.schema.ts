import { Schema } from 'mongoose';

export interface IMeal {
  _id: string;
  clerkUserId: string;
  photoUri: string;
  foodName: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string[];
  mealType: string;
  date: string;
  createdAt: string;
}

export const MealSchema = new Schema(
  {
    _id: { type: String, required: true },
    clerkUserId: { type: String, required: true, index: true },
    photoUri: { type: String, default: '' },
    foodName: { type: String, required: true },
    description: { type: String, default: '' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    ingredients: { type: [String], default: [] },
    mealType: { type: String, default: 'snack' },
    date: { type: String, required: true, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false, versionKey: false },
);
