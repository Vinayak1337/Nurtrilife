import { Redirect } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';

export default function Index() {
  const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
  const isOnboarded = useAppSelector((s: RootState) => s.auth.isOnboarded);

  if (isAuthenticated && isOnboarded) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/welcome" />;
}
