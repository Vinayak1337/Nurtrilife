import * as FileSystem from 'expo-file-system/legacy';
import { NutritionData } from '@/store/slices/analysis.slice';

export async function analyzeFood(imageUri: string, userId: string): Promise<NutritionData> {
  // Read image as base64
  const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, userId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed with status ${response.status}`);
  }

  const json = await response.json();

  if (!json.success || !json.data) {
    throw new Error('Invalid response from analysis API');
  }

  return json.data as NutritionData;
}
