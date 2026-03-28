import React from 'react';
import { Stack } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearNewBadge } from '@/store/slices/gamification.slice';
import { CelebrationOverlay } from '@/components/animations/celebration-overlay';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const newBadgeId = useAppSelector((s) => s.gamification.newBadgeId);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="analysis"
          options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
        />
        <Stack.Screen
          name="meal/[id]"
          options={{ animation: 'slide_from_right', gestureEnabled: true }}
        />
      </Stack>

      {/* Badge celebration overlay */}
      {newBadgeId && (
        <CelebrationOverlay
          badgeId={newBadgeId}
          onDismiss={() => dispatch(clearNewBadge())}
        />
      )}
    </>
  );
}
