import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Meal } from '@/store/slices/meals.slice';

let db: SQLite.SQLiteDatabase | null = null;

interface DBMeal {
  id: string;
  photo_uri: string;
  food_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients: string;
  meal_type: string;
  date: string;
  created_at: string;
}

function mapDBMealToMeal(row: DBMeal): Meal {
  return {
    id: row.id,
    photoUri: row.photo_uri,
    foodName: row.food_name,
    description: row.description ?? '',
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    fiber: row.fiber ?? 0,
    sugar: row.sugar ?? 0,
    sodium: row.sodium ?? 0,
    ingredients: JSON.parse(row.ingredients ?? '[]'),
    mealType: (row.meal_type as Meal['mealType']) ?? 'snack',
    date: row.date,
    createdAt: row.created_at,
  };
}

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('nutrilife.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY NOT NULL,
      photo_uri TEXT NOT NULL,
      food_name TEXT NOT NULL,
      description TEXT DEFAULT '',
      calories REAL NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      carbs REAL NOT NULL DEFAULT 0,
      fats REAL NOT NULL DEFAULT 0,
      fiber REAL DEFAULT 0,
      sugar REAL DEFAULT 0,
      sodium REAL DEFAULT 0,
      ingredients TEXT DEFAULT '[]',
      meal_type TEXT DEFAULT 'snack',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
    CREATE INDEX IF NOT EXISTS idx_meals_created ON meals(created_at DESC);
  `);
}

export async function ensureMealsDirectory(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}meals/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export async function insertMeal(meal: Meal): Promise<void> {
  await getDB().runAsync(
    `INSERT INTO meals (id, photo_uri, food_name, description, calories, protein, carbs, fats, fiber, sugar, sodium, ingredients, meal_type, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      meal.id,
      meal.photoUri,
      meal.foodName,
      meal.description,
      meal.calories,
      meal.protein,
      meal.carbs,
      meal.fats,
      meal.fiber,
      meal.sugar,
      meal.sodium,
      JSON.stringify(meal.ingredients),
      meal.mealType,
      meal.date,
      meal.createdAt,
    ]
  );
}

export async function getMealsByDate(date: string): Promise<Meal[]> {
  const rows = await getDB().getAllAsync<DBMeal>(
    'SELECT * FROM meals WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
  return rows.map(mapDBMealToMeal);
}

export async function getMealsByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
  const rows = await getDB().getAllAsync<DBMeal>(
    'SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC',
    [startDate, endDate]
  );
  return rows.map(mapDBMealToMeal);
}

export async function getMealById(id: string): Promise<Meal | null> {
  const row = await getDB().getFirstAsync<DBMeal>(
    'SELECT * FROM meals WHERE id = ?',
    [id]
  );
  return row ? mapDBMealToMeal(row) : null;
}

export async function deleteMeal(id: string): Promise<void> {
  // Also delete the photo file
  const row = await getDB().getFirstAsync<{ photo_uri: string }>(
    'SELECT photo_uri FROM meals WHERE id = ?',
    [id]
  );
  if (row?.photo_uri) {
    try {
      await FileSystem.deleteAsync(row.photo_uri, { idempotent: true });
    } catch {
      // Ignore file deletion errors
    }
  }
  await getDB().runAsync('DELETE FROM meals WHERE id = ?', [id]);
}

export async function getTotalMealsCount(): Promise<number> {
  const result = await getDB().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM meals'
  );
  return result?.count ?? 0;
}

export async function getActiveDaysCount(): Promise<number> {
  const result = await getDB().getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT date) as count FROM meals'
  );
  return result?.count ?? 0;
}

export async function getAverageDailyCalories(): Promise<number> {
  const result = await getDB().getFirstAsync<{ avg: number }>(
    `SELECT AVG(daily_cal) as avg FROM (
      SELECT SUM(calories) as daily_cal FROM meals GROUP BY date
    )`
  );
  return Math.round(result?.avg ?? 0);
}

export async function getDatesWithMeals(startDate: string, endDate: string): Promise<string[]> {
  const rows = await getDB().getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM meals WHERE date >= ? AND date <= ? ORDER BY date',
    [startDate, endDate]
  );
  return rows.map(r => r.date);
}
