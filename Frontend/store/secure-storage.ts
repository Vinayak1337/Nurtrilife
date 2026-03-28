/**
 * SecureStore-backed storage adapter for redux-persist.
 *
 * Why not fsStorage?  In Expo Go running as @anonymous the document directory
 * path contains "@anonymous" which causes expo-file-system writes to fail.
 * expo-secure-store uses the iOS Keychain / Android Keystore and works fine
 * in Expo Go regardless of the experience name.
 *
 * Limitation: SecureStore keys must be alphanumeric + [._-].
 * redux-persist uses "persist:root" which contains a colon, so we sanitize.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Map any key to a SecureStore-safe equivalent. */
function safeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.setItemAsync(safeKey(key), value);
    } catch {
      // Value may exceed Keychain item size on edge-case devices — silently skip.
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    try {
      return await SecureStore.getItemAsync(safeKey(key));
    } catch {
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.deleteItemAsync(safeKey(key));
    } catch {
      // ignore
    }
  },
};
