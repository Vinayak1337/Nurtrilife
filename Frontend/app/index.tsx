import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const isOnboarded = useAppSelector((s: RootState) => s.auth.isOnboarded);

  if (!isLoaded) {
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
