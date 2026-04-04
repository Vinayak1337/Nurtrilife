import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { HealthScoreRing } from '@/components/charts/health-score-ring';
import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { DeficiencyAlertCard } from '@/components/ui/deficiency-alert';
import { Colors, Palette, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInsightsRequest } from '@/store/slices/insights.slice';
import { refreshGamificationRequest } from '@/store/slices/gamification.slice';

export default function InsightsScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const dispatch = useAppDispatch();

	const { weeklyData, healthScore, deficiencyAlerts, isLoading, error } =
		useAppSelector(s => s.insights);
	const { currentStreak, longestStreak } = useAppSelector(s => s.gamification);

	useEffect(() => {
		dispatch(fetchInsightsRequest());
		dispatch(refreshGamificationRequest());
	}, []);

	function handleRefresh() {
		dispatch(fetchInsightsRequest());
		dispatch(refreshGamificationRequest());
	}

	const hasData = weeklyData.length > 0;

	// Prepare chart data — memoized so arrays aren't rebuilt on every render
	const { barData, lineLabels, proteinData, carbsData, fatsData } =
		useMemo(() => {
			const bar: { label: string; value: number }[] = [];
			const protein: number[] = [];
			const carbs: number[] = [];
			const fats: number[] = [];
			for (let i = 6; i >= 0; i--) {
				const date = dayjs().subtract(i, 'day');
				const dateStr = date.format('YYYY-MM-DD');
				const summary = weeklyData.find(d => d.date === dateStr);
				bar.push({ label: date.format('ddd'), value: summary?.calories ?? 0 });
				protein.push(summary?.protein ?? 0);
				carbs.push(summary?.carbs ?? 0);
				fats.push(summary?.fats ?? 0);
			}
			return {
				barData: bar,
				lineLabels: bar.map(d => d.label),
				proteinData: protein,
				carbsData: carbs,
				fatsData: fats
			};
		}, [weeklyData]);

	const user = useAppSelector(s => s.auth.user);

	if (error && !isLoading) {
		return (
			<SafeAreaView
				style={[styles.safe, { backgroundColor: theme.background }]}>
				<View style={styles.headerSection}>
					<AppText variant='heading' color={theme.text}>
						Insights
					</AppText>
				</View>
				<EmptyState
					icon='exclamationmark.triangle.fill'
					iconColor='#EF4444'
					title="Couldn't Load Insights"
					subtitle='Something went wrong fetching your data. Pull down to retry.'
					actionLabel='Retry'
					onAction={handleRefresh}
				/>
			</SafeAreaView>
		);
	}

	if (!hasData && !isLoading) {
		return (
			<SafeAreaView
				style={[styles.safe, { backgroundColor: theme.background }]}>
				<View style={styles.headerSection}>
					<AppText variant='heading' color={theme.text}>
						Insights
					</AppText>
				</View>
				<EmptyState
					icon='chart.bar.fill'
					iconColor={Palette.primary}
					title='No Data Yet'
					subtitle='Start tracking your meals to unlock powerful health insights, scores, and weekly trends.'
				/>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={handleRefresh}
						tintColor={Palette.primary}
					/>
				}>
				<View style={styles.headerSection}>
					<AppText variant='heading' color={theme.text}>
						Insights
					</AppText>
					<AppText variant='bodySmall' color={theme.textTertiary}>
						Your weekly nutrition analytics
					</AppText>
				</View>

				{/* Health Score */}
				{healthScore && (
					<Animated.View entering={FadeInDown.delay(100).duration(500)}>
						<Card style={styles.scoreCard}>
							<AppText
								variant='label'
								color={theme.textTertiary}
								style={styles.sectionLabel}>
								TODAY'S HEALTH SCORE
							</AppText>
							<View style={styles.scoreCenter}>
								<HealthScoreRing
									score={healthScore.score}
									grade={healthScore.grade}
									label={healthScore.label}
								/>
							</View>
							{/* Score breakdown */}
							<View style={styles.breakdownRow}>
								<BreakdownItem
									label='Calories'
									value={healthScore.breakdown.calorieScore}
									max={30}
									color={Palette.secondary}
									theme={theme}
								/>
								<BreakdownItem
									label='Protein'
									value={healthScore.breakdown.proteinScore}
									max={20}
									color={Palette.protein}
									theme={theme}
								/>
								<BreakdownItem
									label='Balance'
									value={healthScore.breakdown.macroBalance}
									max={20}
									color={Palette.primary}
									theme={theme}
								/>
							</View>
						</Card>
					</Animated.View>
				)}

				{/* Streak */}
				<Animated.View entering={FadeInDown.delay(200).duration(500)}>
					<Card style={styles.streakCard}>
						<View style={styles.streakRow}>
							<View style={styles.streakInfo}>
								<View style={styles.streakHeader}>
									<IconSymbol
										name='flame.fill'
										size={22}
										color={Palette.secondary}
									/>
									<AppText variant='subheading' color={theme.text}>
										{currentStreak}
									</AppText>
									<AppText variant='body' color={theme.textSecondary}>
										day streak
									</AppText>
								</View>
								<AppText variant='caption' color={theme.textTertiary}>
									Longest: {longestStreak} days
								</AppText>
							</View>
							<View
								style={[
									styles.streakBadge,
									{ backgroundColor: `${Palette.secondary}15` }
								]}>
								<IconSymbol
									name='flame.fill'
									size={36}
									color={Palette.secondary}
								/>
							</View>
						</View>
					</Card>
				</Animated.View>

				{/* Weekly Calories Chart */}
				<Animated.View entering={FadeInDown.delay(300).duration(500)}>
					<Card>
						<AppText
							variant='label'
							color={theme.textTertiary}
							style={styles.sectionLabel}>
							WEEKLY CALORIES
						</AppText>
						<BarChart
							data={barData}
							goalLine={user?.dailyCalorieGoal}
							barColor={Palette.secondary}
							height={200}
						/>
					</Card>
				</Animated.View>

				{/* Macro Trends */}
				<Animated.View entering={FadeInDown.delay(400).duration(500)}>
					<Card style={styles.chartCard}>
						<AppText
							variant='label'
							color={theme.textTertiary}
							style={styles.sectionLabel}>
							MACRO TRENDS (7 DAYS)
						</AppText>
						<LineChart
							datasets={[
								{ data: proteinData, color: Palette.protein, label: 'Protein' },
								{ data: carbsData, color: Palette.carbs, label: 'Carbs' },
								{ data: fatsData, color: Palette.fats, label: 'Fats' }
							]}
							labels={lineLabels}
							height={180}
						/>
					</Card>
				</Animated.View>

				{/* Deficiency Alerts */}
				{deficiencyAlerts.length > 0 && (
					<Animated.View entering={FadeInDown.delay(500).duration(500)}>
						<AppText
							variant='label'
							color={theme.textTertiary}
							style={styles.sectionLabel}>
							NUTRITION ALERTS
						</AppText>
						{deficiencyAlerts.map((alert, i) => (
							<DeficiencyAlertCard key={i + 'deficiencyAlert'} alert={alert} />
						))}
					</Animated.View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function BreakdownItem({
	label,
	value,
	max,
	color,
	theme
}: Readonly<{
	label: string;
	value: number;
	max: number;
	color: string;
	theme: typeof Colors.light;
}>) {
	const pct = max > 0 ? value / max : 0;
	return (
		<View style={bdStyles.item}>
			<AppText variant='caption' color={theme.textTertiary}>
				{label}
			</AppText>
			<View style={[bdStyles.track, { backgroundColor: `${color}20` }]}>
				<View
					style={[
						bdStyles.fill,
						{ width: `${pct * 100}%`, backgroundColor: color }
					]}
				/>
			</View>
			<AppText variant='caption' color={color}>
				{value}/{max}
			</AppText>
		</View>
	);
}

const bdStyles = StyleSheet.create({
	item: { flex: 1, alignItems: 'center', gap: 4 },
	track: { width: '100%', height: 4, borderRadius: 2 },
	fill: { height: 4, borderRadius: 2 }
});

const styles = StyleSheet.create({
	safe: { flex: 1 },
	content: {
		padding: Spacing.base,
		paddingBottom: 120
	},
	headerSection: {
		marginBottom: Spacing.lg
	},
	sectionLabel: {
		marginBottom: Spacing.md,
		letterSpacing: 0.5
	},
	scoreCard: {
		marginBottom: Spacing.base
	},
	scoreCenter: {
		alignItems: 'center',
		marginBottom: Spacing.lg
	},
	breakdownRow: {
		flexDirection: 'row',
		gap: Spacing.sm
	},
	streakCard: {
		marginBottom: Spacing.base
	},
	streakRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	streakInfo: {
		gap: 4
	},
	streakHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.sm
	},
	streakBadge: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	chartCard: {
		marginTop: Spacing.base,
		marginBottom: Spacing.base
	}
});
