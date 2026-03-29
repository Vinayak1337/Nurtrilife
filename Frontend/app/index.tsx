import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreUser } from '@/store/slices/auth.slice';
import { setMeals } from '@/store/slices/meals.slice';
import { setEntries } from '@/store/slices/water.slice';
import { setBadges } from '@/store/slices/gamification.slice';
import {
  fetchUserFromServer,
  fetchMealsFromServer,
  fetchWaterFromServer,
  fetchBadgesFromServer,
} from '@/services/sync.service';
import type { RootState } from '@/store';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
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
        const today = new Date().toLocaleDateString('en-CA');

        // 1. Restore user profile — if found, mark as onboarded
        const serverUser = await fetchUserFromServer();
        if (serverUser) {
          dispatch(restoreUser(serverUser));

          // 2. Restore today's meals
          const serverMeals = await fetchMealsFromServer(today);
          if (serverMeals.length > 0) dispatch(setMeals(serverMeals));

          // 3. Restore today's water entries
          const serverWater = await fetchWaterFromServer(today);
          if (serverWater.length > 0) dispatch(setEntries(serverWater));

          // 4. Restore badges
          const serverBadges = await fetchBadgesFromServer();
          if (serverBadges.length > 0) dispatch(setBadges(serverBadges));
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
