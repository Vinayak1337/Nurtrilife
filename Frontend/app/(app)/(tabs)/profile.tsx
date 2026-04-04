import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Pressable,
	Switch,
	Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, {
	BottomSheetTextInput,
	BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { NUTRIENT_META } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/use-auth';
import { updateGoals } from '@/store/slices/auth.slice';
import { useLogout } from '@/hooks/use-logout';
import { BadgeCard } from '@/components/ui/badge-card';
import { BADGES } from '@/constants/badges';
import {
	useAppSelector as useSelector,
	useAppDispatch,
	useAppSelector
} from '@/store/hooks';
import { refreshGamificationRequest } from '@/store/slices/gamification.slice';
import {
	requestPermissions,
	scheduleMealReminders,
	cancelAllReminders,
	getScheduledRemindersCount
} from '@/services/notifications.service';

type GoalKey =
	| 'dailyCalorieGoal'
	| 'dailyProteinGoal'
	| 'dailyCarbsGoal'
	| 'dailyFatsGoal';

interface Stats {
	totalMeals: number;
	activeDays: number;
	avgCalories: number;
}

function ProfileSheetBackdrop(props: Readonly<BottomSheetBackdropProps>) {
	return (
		<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={0}
			opacity={0.5}
		/>
	);
}

export default function ProfileScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const dispatch = useAppDispatch();
	const user = useUser();
	const handleLogoutAction = useLogout();
	const { unlockedBadgeIds } = useSelector(s => s.gamification);

	const [remindersOn, setRemindersOn] = useState(false);
	const [editingGoal, setEditingGoal] = useState<GoalKey | null>(null);
	const [editValue, setEditValue] = useState('');

	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = ['35%'];

	const allMeals = useAppSelector(s => s.meals.meals);

	const stats = useMemo<Stats>(() => {
		const totalMeals = allMeals.length;
		const activeDays = new Set(allMeals.map(m => m.date)).size;
		if (totalMeals === 0)
			return { totalMeals: 0, activeDays: 0, avgCalories: 0 };
		const calsByDay = new Map<string, number>();
		for (const m of allMeals) {
			calsByDay.set(m.date, (calsByDay.get(m.date) ?? 0) + m.calories);
		}
		const avgCalories =
			activeDays > 0
				? Math.round(
						[...calsByDay.values()].reduce((s, c) => s + c, 0) / activeDays
				  )
				: 0;
		return { totalMeals, activeDays, avgCalories };
	}, [allMeals]);

	useEffect(() => {
		async function loadReminders() {
			const remindersCount = await getScheduledRemindersCount();
			setRemindersOn(remindersCount > 0);
		}
		loadReminders();
		dispatch(refreshGamificationRequest());
	}, []);

	const initials = user?.name
		? user.name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: 'NU';

	function openEditGoal(key: GoalKey) {
		const currentValue = user?.[key] ?? 0;
		setEditingGoal(key);
		setEditValue(String(currentValue));
		bottomSheetRef.current?.expand();
	}

	function saveGoal() {
		if (!editingGoal) return;
		const value = Number.parseInt(editValue, 10);
		const limits: Record<string, { min: number; max: number }> = {
			dailyCalorieGoal: { min: 500, max: 9999 },
			dailyProteinGoal: { min: 10, max: 500 },
			dailyCarbsGoal: { min: 10, max: 1000 },
			dailyFatsGoal: { min: 10, max: 300 }
		};
		const { min, max } = limits[editingGoal] ?? { min: 1, max: 99999 };
		if (Number.isNaN(value) || value < min || value > max) {
			Alert.alert(
				'Invalid Value',
				`Please enter a value between ${min} and ${max}.`
			);
			return;
		}
		dispatch(updateGoals({ [editingGoal]: value }));
		bottomSheetRef.current?.close();
		setEditingGoal(null);
	}

	async function enableReminders() {
		const granted = await requestPermissions();
		if (!granted) {
			Alert.alert(
				'Permission Required',
				'Please allow notifications to enable meal reminders.',
				[{ text: 'Cancel', style: 'cancel' }]
			);
			return;
		}
		await scheduleMealReminders();
		setRemindersOn(true);
	}

	async function disableReminders() {
		await cancelAllReminders();
		setRemindersOn(false);
	}

	function handleLogout() {
		Alert.alert(
			'Log Out',
			'Are you sure you want to log out? Your meal data will be preserved.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Log Out',
					style: 'destructive',
					onPress: () => handleLogoutAction()
				}
			]
		);
	}

	const GOAL_ROWS: {
		key: GoalKey;
		label: string;
		unit: string;
		icon: IconSymbolName;
	}[] = [
		{
			key: 'dailyCalorieGoal',
			label: 'Daily Calories',
			unit: 'kcal',
			icon: NUTRIENT_META.calories.icon
		},
		{
			key: 'dailyProteinGoal',
			label: 'Protein Goal',
			unit: 'g',
			icon: NUTRIENT_META.protein.icon
		},
		{
			key: 'dailyCarbsGoal',
			label: 'Carbs Goal',
			unit: 'g',
			icon: NUTRIENT_META.carbs.icon
		},
		{
			key: 'dailyFatsGoal',
			label: 'Fats Goal',
			unit: 'g',
			icon: NUTRIENT_META.fats.icon
		}
	];

	const goalColors: Record<GoalKey, string> = {
		dailyCalorieGoal: Palette.secondary,
		dailyProteinGoal: Palette.protein,
		dailyCarbsGoal: Palette.carbs,
		dailyFatsGoal: Palette.fats
	};

	const editingLabel = editingGoal
		? GOAL_ROWS.find(r => r.key === editingGoal)?.label
		: '';

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
				showsVerticalScrollIndicator={false}>
				<AppText variant='heading' color={theme.text} style={styles.header}>
					Profile
				</AppText>

				{/* Avatar + name */}
				<Animated.View
					entering={FadeInDown.delay(100)}
					style={styles.avatarSection}>
					<LinearGradient
						colors={[Palette.primary, Palette.primaryDark]}
						style={styles.avatar}>
						<AppText style={styles.initials}>{initials}</AppText>
					</LinearGradient>
					<AppText variant='heading' color={theme.text} align='center'>
						{user?.name ?? 'User'}
					</AppText>
					<AppText variant='body' color={theme.textTertiary} align='center'>
						NutriLife Member
					</AppText>
				</Animated.View>

				{/* Stats */}
				<Animated.View entering={FadeInDown.delay(200)}>
					<Card style={styles.statsCard}>
						<View style={styles.statsRow}>
							<StatItem
								label='Meals Logged'
								value={String(stats.totalMeals)}
								icon='fork.knife'
							/>
							<View
								style={[styles.statsDivider, { backgroundColor: theme.border }]}
							/>
							<StatItem
								label='Active Days'
								value={String(stats.activeDays)}
								icon='calendar'
							/>
							<View
								style={[styles.statsDivider, { backgroundColor: theme.border }]}
							/>
							<StatItem
								label='Avg Daily'
								value={`${stats.avgCalories}`}
								icon='flame.fill'
								suffix='kcal'
							/>
						</View>
					</Card>
				</Animated.View>

				{/* Goals */}
				<Animated.View entering={FadeInDown.delay(300)}>
					<AppText
						variant='label'
						color={theme.textTertiary}
						style={styles.sectionLabel}>
						DAILY GOALS
					</AppText>
					<Card padding={0}>
						{GOAL_ROWS.map((row, i) => (
							<Pressable
								key={row.key}
								onPress={() => openEditGoal(row.key)}
								style={({ pressed }) => [
									styles.goalRow,
									i < GOAL_ROWS.length - 1 && {
										borderBottomWidth: StyleSheet.hairlineWidth,
										borderBottomColor: theme.border
									},
									pressed && { opacity: 0.7 }
								]}>
								<View
									style={[
										styles.goalIcon,
										{ backgroundColor: `${goalColors[row.key]}18` }
									]}>
									<IconSymbol
										name={row.icon}
										size={20}
										color={goalColors[row.key]}
									/>
								</View>
								<View style={styles.goalInfo}>
									<AppText variant='body' color={theme.text}>
										{row.label}
									</AppText>
								</View>
								<AppText variant='subheading' color={goalColors[row.key]}>
									{user?.[row.key] ?? 0}
								</AppText>
								<AppText
									variant='caption'
									color={theme.textTertiary}
									style={{ marginLeft: 4, marginRight: Spacing.sm }}>
									{row.unit}
								</AppText>
								<IconSymbol
									name='chevron.right'
									size={16}
									color={theme.textTertiary}
								/>
							</Pressable>
						))}
					</Card>
				</Animated.View>

				{/* Notifications */}
				<Animated.View entering={FadeInDown.delay(400)}>
					<AppText
						variant='label'
						color={theme.textTertiary}
						style={styles.sectionLabel}>
						NOTIFICATIONS
					</AppText>
					<Card padding={0}>
						<View style={styles.toggleRow}>
							<View
								style={[
									styles.goalIcon,
									{ backgroundColor: `${Palette.primary}18` }
								]}>
								<IconSymbol
									name='bell.fill'
									size={20}
									color={Palette.primary}
								/>
							</View>
							<View style={styles.goalInfo}>
								<AppText variant='body' color={theme.text}>
									Meal Reminders
								</AppText>
								<AppText variant='caption' color={theme.textTertiary}>
									8am, 12:30pm, and 7pm daily
								</AppText>
							</View>
							<Switch
								value={remindersOn}
								onValueChange={nextValue =>
									nextValue ? enableReminders() : disableReminders()
								}
								trackColor={{
									false: theme.border,
									true: `${Palette.primary}60`
								}}
								thumbColor={remindersOn ? Palette.primary : theme.textTertiary}
							/>
						</View>
					</Card>
				</Animated.View>

				{/* Badges */}
				<Animated.View entering={FadeInDown.delay(500)}>
					<AppText
						variant='label'
						color={theme.textTertiary}
						style={styles.sectionLabel}>
						ACHIEVEMENTS
					</AppText>
					<View style={styles.badgesGrid}>
						{BADGES.map(badge => (
							<BadgeCard
								key={badge.id}
								badge={badge}
								unlocked={unlockedBadgeIds.includes(badge.id)}
							/>
						))}
					</View>
				</Animated.View>

				{/* Logout */}
				<Animated.View entering={FadeInDown.delay(600)}>
					<Button
						variant='danger'
						size='md'
						fullWidth
						onPress={handleLogout}
						style={styles.logoutBtn}>
						Log Out
					</Button>
				</Animated.View>
			</ScrollView>

			{/* Edit goal bottom sheet */}
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={snapPoints}
				index={-1}
				enablePanDownToClose
				backdropComponent={ProfileSheetBackdrop}
				backgroundStyle={{ backgroundColor: theme.surface }}
				handleIndicatorStyle={{ backgroundColor: theme.border }}>
				<View style={[styles.sheetContent, { backgroundColor: theme.surface }]}>
					<AppText
						variant='subheading'
						color={theme.text}
						style={{ marginBottom: Spacing.lg }}>
						Edit {editingLabel}
					</AppText>
					<BottomSheetTextInput
						value={editValue}
						onChangeText={setEditValue}
						keyboardType='numeric'
						style={[
							styles.sheetInput,
							{
								color: theme.text,
								borderColor: theme.border,
								backgroundColor: theme.surfaceSecondary
							}
						]}
						placeholder='Enter value'
						placeholderTextColor={theme.textTertiary}
					/>
					<Button
						variant='primary'
						size='lg'
						fullWidth
						onPress={saveGoal}
						style={{ marginTop: Spacing.base }}>
						Save Goal
					</Button>
				</View>
			</BottomSheet>
		</SafeAreaView>
	);
}

function StatItem({
	label,
	value,
	icon,
	suffix
}: Readonly<{
	label: string;
	value: string;
	icon: Parameters<typeof IconSymbol>[0]['name'];
	suffix?: string;
}>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	return (
		<View style={styles.statItem}>
			<IconSymbol name={icon} size={26} color={Palette.primary} />
			<AppText variant='subheading' color={theme.text} align='center'>
				{value}
				{Boolean(suffix) && (
					<AppText variant='caption' color={theme.textTertiary}>
						{' '}
						{suffix}
					</AppText>
				)}
			</AppText>
			<AppText variant='caption' color={theme.textTertiary} align='center'>
				{label}
			</AppText>
		</View>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1 },
	scroll: { flex: 1 },
	content: { padding: Spacing.base },
	header: {
		marginTop: Spacing.sm,
		marginBottom: Spacing.lg
	},
	avatarSection: {
		alignItems: 'center',
		marginBottom: Spacing.xl,
		gap: Spacing.sm
	},
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: Spacing.sm
	},
	initials: {
		fontFamily: 'SpaceGrotesk_700Bold',
		fontSize: 32,
		color: '#FFF'
	},
	statsCard: { marginBottom: Spacing.xl },
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
		gap: 4
	},
	statsDivider: {
		width: 1,
		height: 50
	},
	sectionLabel: {
		marginTop: Spacing.lg,
		marginBottom: Spacing.sm,
		marginLeft: 4
	},
	goalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: Spacing.base,
		gap: Spacing.sm
	},
	goalIcon: {
		width: 40,
		height: 40,
		borderRadius: Radius.md,
		alignItems: 'center',
		justifyContent: 'center'
	},
	goalInfo: { flex: 1 },
	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: Spacing.base,
		gap: Spacing.sm
	},
	badgesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: Spacing.sm,
		justifyContent: 'flex-start'
	},
	logoutBtn: {
		marginTop: Spacing.xxl
	},
	sheetContent: {
		padding: Spacing.xl,
		paddingTop: Spacing.base
	},
	sheetInput: {
		borderWidth: 1.5,
		borderRadius: Radius.lg,
		padding: Spacing.base,
		fontSize: 18,
		fontFamily: 'SpaceGrotesk_500Medium',
		height: 56
	}
});
