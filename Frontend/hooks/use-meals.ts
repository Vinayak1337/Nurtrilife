import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';
import type { Meal } from '@/store/slices/meals.slice';

export function useTodayMeals(): Meal[] {
  const today = dayjs().format('YYYY-MM-DD');
  const meals = useAppSelector((state: RootState) => state.meals.meals);
  return useMemo(() => meals.filter((m) => m.date === today), [meals, today]);
}

export function useMealsLoading(): boolean {
  return useAppSelector((state: RootState) => state.meals.isLoading);
}

export function useTodayTotals() {
  const meals = useTodayMeals();
  return useMemo(() => {
    return meals.reduce(
      (acc: { calories: number; protein: number; carbs: number; fats: number; fiber: number; sugar: number; sodium: number }, meal: Meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
        fiber: acc.fiber + meal.fiber,
        sugar: acc.sugar + meal.sugar,
        sodium: acc.sodium + meal.sodium,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }, [meals]);
}

export function useAnalysis() {
  return useAppSelector((state: RootState) => state.analysis);
}
