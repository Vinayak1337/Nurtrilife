/**
 * File-system backed storage adapter for redux-persist.
 * Replaces @react-native-async-storage/async-storage which requires a
 * native module unavailable in Expo Go SDK 53+.
 */
import * as FileSystem from 'expo-file-system/legacy';

const DIR = `${FileSystem.documentDirectory}.redux-persist/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

function keyPath(key: string) {
  return DIR + encodeURIComponent(key) + '.json';
}

export const fsStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await ensureDir();
    await FileSystem.writeAsStringAsync(keyPath(key), value, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const info = await FileSystem.getInfoAsync(keyPath(key));
      if (!info.exists) return null;
      return await FileSystem.readAsStringAsync(keyPath(key), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch {
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(keyPath(key), { idempotent: true });
    } catch {
      // Ignore missing file
    }
  },
};
