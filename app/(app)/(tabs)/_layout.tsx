import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/ui/custom-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="camera" options={{ title: 'Camera', href: null }} />
      <Tabs.Screen name="calendar" options={{ title: 'Log' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
