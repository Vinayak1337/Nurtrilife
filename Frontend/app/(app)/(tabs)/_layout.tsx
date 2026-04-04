import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '@/components/ui/custom-tab-bar';

function renderTabBar(props: BottomTabBarProps) {
	return <CustomTabBar {...props} />;
}

export default function TabsLayout() {
	return (
		<Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
			<Tabs.Screen name='home' options={{ title: 'Home' }} />
			<Tabs.Screen name='camera' options={{ title: 'Camera', href: null }} />
			<Tabs.Screen name='calendar' options={{ title: 'Log' }} />
			<Tabs.Screen name='insights' options={{ title: 'Insights' }} />
			<Tabs.Screen name='profile' options={{ title: 'Profile' }} />
		</Tabs>
	);
}
