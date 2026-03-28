import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreUser } from '@/store/slices/auth.slice';
import type { RootState } from '@/store';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export default function Index() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const dispatch = useAppDispatch();
  const isOnboarded = useAppSelector((s: RootState) => s.auth.isOnboarded);

  // true while we're asking the backend "does this user have a profile?"
  const [checking, setChecking] = useState(false);
  // once we've asked once, stop asking even if isOnboarded is still false
  const [serverChecked, setServerChecked] = useState(false);

  useEffect(() => {
    // Only run when: Clerk loaded, signed in, Redux says not-onboarded yet,
    // and we haven't already checked the server this session.
    if (!isLoaded || !isSignedIn || isOnboarded || serverChecked) return;

    async function syncFromBackend() {
      setChecking(true);
      try {
        // Get the JWT directly from Clerk — don't wait for TokenSetup's effect.
        const token = await getToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(`${API_BASE}/api/user`, { headers });
        const data = await res.json().catch(() => null);
        if (data?.success && data?.data) {
          dispatch(restoreUser(data.data));
        }
      } catch {
        // Network unavailable — let routing fall through to setup.
      } finally {
        setChecking(false);
        setServerChecked(true);
      }
    }

    syncFromBackend();
  }, [isLoaded, isSignedIn, isOnboarded, serverChecked]);

  // ── Routing ────────────────────────────────────────────────────────────────

  if (!isLoaded || checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F1E', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;
  if (!isOnboarded) return <Redirect href="/(auth)/setup" />;
  return <Redirect href="/(app)/(tabs)/home" />;
}
