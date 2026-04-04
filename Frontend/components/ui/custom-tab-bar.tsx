import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView } from 'expo-glass-effect';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring
} from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Palette, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppText } from './text';
import { IconSymbol } from './icon-symbol';

const TAB_ITEMS = [
	{ name: 'home', icon: 'house.fill' as const, label: 'Home' },
	{ name: 'calendar', icon: 'calendar' as const, label: 'Log' },
	// --- FAB camera sits in center ---
	{ name: 'insights', icon: 'chart.bar.fill' as const, label: 'Insights' },
	{ name: 'profile', icon: 'person.fill' as const, label: 'Profile' }
];

const FAB_SIZE = 58;
const TAB_BAR_HEIGHT = 68;

function TabItem({
	name,
	icon,
	label,
	isActive,
	onPress
}: Readonly<{
	name: string;
	icon: (typeof TAB_ITEMS)[0]['icon'];
	label: string;
	isActive: boolean;
	onPress: () => void;
}>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const scale = useSharedValue(1);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}));

	return (
		<Animated.View style={[styles.tabItem, animStyle]}>
			<Pressable
				onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					scale.value = withSpring(0.88, { damping: 12 }, () => {
						scale.value = withSpring(1, { damping: 12 });
					});
					onPress();
				}}
				style={styles.tabPressable}>
				<View
					style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
					<IconSymbol
						name={icon}
						size={22}
						color={isActive ? Palette.primary : theme.tabIconDefault}
					/>
				</View>
				<AppText
					variant='labelSmall'
					color={isActive ? Palette.primary : theme.textTertiary}
					style={{ marginTop: 2 }}>
					{label}
				</AppText>
			</Pressable>
		</Animated.View>
	);
}

export function CustomTabBar({ state, navigation }: Readonly<BottomTabBarProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const camScale = useSharedValue(1);

	const camAnimStyle = useAnimatedStyle(() => ({
		transform: [{ scale: camScale.value }]
	}));

	// Map route names to our tab items
	const activeRouteName = state.routes[state.index]?.name ?? '';

	function navigate(tabName: string) {
		navigation.navigate(tabName);
	}

	function openCamera() {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		camScale.value = withSpring(0.88, { damping: 12 }, () => {
			camScale.value = withSpring(1, { damping: 12 });
		});
		router.push('/(app)/(tabs)/camera');
	}

	const barContent = (
		<View style={styles.innerBar}>
			{/* Left tabs */}
			<View style={styles.tabSide}>
				{TAB_ITEMS.slice(0, 2).map(tab => (
					<TabItem
						key={tab.name}
						name={tab.name}
						icon={tab.icon}
						label={tab.label}
						isActive={activeRouteName === tab.name}
						onPress={() => navigate(tab.name)}
					/>
				))}
			</View>

			{/* Center FAB spacer */}
			<View style={styles.fabSpacer} />

			{/* Right tabs */}
			<View style={styles.tabSide}>
				{TAB_ITEMS.slice(2).map(tab => (
					<TabItem
						key={tab.name}
						name={tab.name}
						icon={tab.icon}
						label={tab.label}
						isActive={activeRouteName === tab.name}
						onPress={() => navigate(tab.name)}
					/>
				))}
			</View>
		</View>
	);

	return (
		<View style={styles.wrapper} pointerEvents='box-none'>
			{/* Tab bar */}
			<View
				style={[
					styles.container,
					!Platform.select({ ios: true }) && {
						backgroundColor:
							colorScheme === 'dark'
								? 'rgba(17,24,39,0.96)'
								: 'rgba(255,255,255,0.96)'
					}
				]}>
				{Platform.OS === 'ios' ? (
					<GlassView
						glassEffectStyle='regular'
						colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
						style={StyleSheet.absoluteFill}
					/>
				) : null}
				{barContent}
			</View>

			{/* Floating camera FAB */}
			<Animated.View style={[styles.fab, camAnimStyle]}>
				<Pressable
					onPress={openCamera}
					style={[styles.fabButton, Shadow.primary]}>
					<IconSymbol name='camera.fill' size={26} color='#FFFFFF' />
				</Pressable>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
		alignItems: 'center'
	},
	container: {
		width: '100%',
		height: TAB_BAR_HEIGHT,
		borderRadius: Radius.xxxl,
		overflow: 'hidden',
		...Shadow.lg
	},
	innerBar: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: Spacing.md
	},
	tabSide: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	tabItem: {
		flex: 1,
		alignItems: 'center'
	},
	tabPressable: {
		alignItems: 'center',
		paddingVertical: Spacing.xs,
		paddingHorizontal: Spacing.sm,
		minWidth: 60
	},
	iconWrapper: {
		width: 36,
		height: 36,
		borderRadius: Radius.lg,
		alignItems: 'center',
		justifyContent: 'center'
	},
	activeIconWrapper: {
		backgroundColor: `${Palette.primary}18`
	},
	fabSpacer: {
		width: FAB_SIZE + Spacing.xxl
	},
	fab: {
		position: 'absolute',
		top: -(FAB_SIZE / 2) - 4,
		alignSelf: 'center',
		zIndex: 10
	},
	fabButton: {
		width: FAB_SIZE,
		height: FAB_SIZE,
		borderRadius: FAB_SIZE / 2,
		backgroundColor: Palette.primary,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

export default CustomTabBar;
