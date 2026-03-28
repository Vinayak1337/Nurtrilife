import * as FileSystem from 'expo-file-system/legacy';
import { NutritionData } from '@/store/slices/analysis.slice';
import { getAuthToken } from '@/utils/auth-token';

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  try {
    const Constants = require('expo-constants').default;
    const host = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost ?? '';
    if (host) return `http://${host.split(':')[0]}:3000`;
  } catch {
    // ignore
  }
  return '';
}

export async function analyzeFood(imageUri: string, userId: string): Promise<NutritionData> {
  // Read image as base64
  const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const token = await getAuthToken();
  const response = await fetch(`${getApiBase()}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ imageBase64, userId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? err.error ?? `Request failed with status ${response.status}`);
  }

  const json = await response.json();

  if (!json.success || !json.data) {
    throw new Error('Invalid response from analysis API');
  }

  return json.data as NutritionData;
}
