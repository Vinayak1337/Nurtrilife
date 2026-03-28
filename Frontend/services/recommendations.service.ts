import { getAuthToken } from '@/utils/auth-token';

export interface MealSuggestion {
  foodName: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    const host = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost ?? '';
    if (host) return `http://${host.split(':')[0]}:3000`;
  } catch {
    // ignore
  }
  return '';
}

export async function getMealRecommendations(
  remainingCalories: number,
  remainingProtein: number,
  remainingCarbs: number,
  remainingFats: number,
  mealType?: string,
): Promise<MealSuggestion[]> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${getApiBase()}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        remainingCalories,
        remainingProtein,
        remainingCarbs,
        remainingFats,
        mealType,
      }),
    });

    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch {
    return [];
  }
}
