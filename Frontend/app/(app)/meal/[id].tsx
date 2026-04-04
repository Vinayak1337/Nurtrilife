import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { MEAL_TYPE_META, NUTRIENT_META } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteMealRequest } from '@/store/slices/meals.slice';

export default function MealDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const dispatch = useAppDispatch();

	const meal = useAppSelector(
		s => s.meals.meals.find(m => m.id === id) ?? null
	);

	function handleDelete() {
		if (!meal) return;
		Alert.alert(
			'Delete Meal',
			`Remove "${meal.foodName}" from your log? This cannot be undone.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						dispatch(deleteMealRequest(meal.id));
						router.back();
					}
				}
			]
		);
	}

	if (!meal) {
		return (
			<View style={[styles.centered, { backgroundColor: theme.background }]}>
				<AppText variant='heading' color={theme.text} align='center'>
					Meal not found
				</AppText>
				<Button variant='ghost' size='md' onPress={() => router.back()}>
					Go Back
				</Button>
			</View>
		);
	}

	const mealMeta = MEAL_TYPE_META[meal.mealType];
	const mealTime = dayjs(meal.createdAt).format('h:mm A');
	const mealDate = dayjs(meal.date).format('MMMM D, YYYY');

	const nutrients = [
		{ key: 'protein', value: meal.protein },
		{ key: 'carbs', value: meal.carbs },
		{ key: 'fats', value: meal.fats },
		{ key: 'fiber', value: meal.fiber },
		{ key: 'sugar', value: meal.sugar },
		{ key: 'sodium', value: meal.sodium }
	] as const;

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}>
				{/* Photo */}
				<Animated.View
					entering={FadeIn.duration(400)}
					style={styles.imageWrapper}>
					<Image
						source={{ uri: meal.photoUri }}
						style={styles.image}
						contentFit='cover'
						cachePolicy='memory-disk'
					/>
					{/* Back button */}
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<IconSymbol name='chevron.left' size={22} color='#FFF' />
					</Pressable>
				</Animated.View>

				<View style={styles.content}>
					{/* Name + type */}
					<Animated.View entering={FadeInDown.delay(150)}>
						<View style={styles.nameRow}>
							<AppText variant='title' color={theme.text} style={{ flex: 1 }}>
								{meal.foodName}
							</AppText>
						</View>
						<View style={styles.metaRow}>
							<View
								style={[
									styles.typeBadge,
									{ backgroundColor: `${mealMeta.color}20` }
								]}>
								<IconSymbol
									name={mealMeta.icon}
									size={12}
									color={mealMeta.color}
								/>
								<AppText
									variant='caption'
									color={mealMeta.color}
									weight='semiBold'>
									{mealMeta.label}
								</AppText>
							</View>
							<AppText variant='caption' color={theme.textTertiary}>
								{mealDate} at {mealTime}
							</AppText>
						</View>
						{meal.description ? (
							<AppText
								variant='body'
								color={theme.textTertiary}
								style={{ marginTop: Spacing.sm }}>
								{meal.description}
							</AppText>
						) : null}
					</Animated.View>

					{/* Big calorie */}
					<Animated.View
						entering={FadeInDown.delay(200)}
						style={styles.calorieBlock}>
						<AppText
							style={{
								fontFamily: 'SpaceGrotesk_700Bold',
								fontSize: 52,
								color: Palette.secondary
							}}>
							{Math.round(meal.calories)}
						</AppText>
						<AppText variant='subheading' color={theme.textTertiary}>
							Calories
						</AppText>
					</Animated.View>

					{/* Macro cards */}
					<Animated.View
						entering={FadeInDown.delay(280)}
						style={styles.macroCards}>
						{(['protein', 'carbs', 'fats'] as const).map(key => {
							const meta = NUTRIENT_META[key];
							const value = meal[key];
							return (
								<Card
									key={key}
									style={[
										styles.macroCard,
										{ borderTopWidth: 3, borderTopColor: meta.color }
									]}>
									<IconSymbol name={meta.icon} size={22} color={meta.color} />
									<AppText variant='heading' color={meta.color} align='center'>
										{value.toFixed(1)}
									</AppText>
									<AppText
										variant='caption'
										color={theme.textTertiary}
										align='center'>
										{meta.unit} {meta.label}
									</AppText>
								</Card>
							);
						})}
					</Animated.View>

					{/* All nutrients */}
					<Animated.View entering={FadeInDown.delay(360)}>
						<Card>
							<AppText
								variant='label'
								color={theme.textTertiary}
								style={{ marginBottom: Spacing.md }}>
								FULL NUTRITION INFO
							</AppText>
							{nutrients.map(({ key, value }) => {
								const meta = NUTRIENT_META[key];
								return (
									<View
										key={key}
										style={[
											styles.nutrientRow,
											{ borderBottomColor: theme.border }
										]}>
										<View style={styles.nutrientLeft}>
											<IconSymbol
												name={meta.icon}
												size={18}
												color={meta.color}
												style={{ marginRight: 8 }}
											/>
											<AppText variant='body' color={theme.text}>
												{meta.label}
											</AppText>
										</View>
										<AppText
											variant='body'
											weight='semiBold'
											color={meta.color}>
											{key === 'sodium' ? Math.round(value) : value.toFixed(1)}{' '}
											{meta.unit}
										</AppText>
									</View>
								);
							})}
						</Card>
					</Animated.View>

					{/* Ingredients */}
					{meal.ingredients.length > 0 && (
						<Animated.View entering={FadeInDown.delay(440)}>
							<Card>
								<AppText
									variant='label'
									color={theme.textTertiary}
									style={{ marginBottom: Spacing.md }}>
									INGREDIENTS
								</AppText>
								<View style={styles.ingredients}>
									{meal.ingredients.map((ing, i) => (
										<View
											key={i + 'meal-ingredient'}
											style={[
												styles.ingredientChip,
												{ backgroundColor: theme.surfaceSecondary }
											]}>
											<AppText variant='caption' color={theme.textSecondary}>
												{ing}
											</AppText>
										</View>
									))}
								</View>
							</Card>
						</Animated.View>
					)}
				</View>
			</ScrollView>

			{/* Delete button */}
			<Animated.View
				entering={FadeInDown.delay(500)}
				style={[styles.footer, { backgroundColor: theme.background }]}>
				<Button variant='danger' size='lg' fullWidth onPress={handleDelete}>
					Delete Meal
				</Button>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.base
	},
	scroll: { flex: 1 },
	imageWrapper: {
		position: 'relative'
	},
	image: {
		width: '100%',
		height: 320
	},
	backButton: {
		position: 'absolute',
		top: 52,
		left: Spacing.base,
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(0,0,0,0.45)',
		alignItems: 'center',
		justifyContent: 'center'
	},
	content: {
		padding: Spacing.base,
		gap: Spacing.base
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.sm,
		marginTop: Spacing.sm,
		flexWrap: 'wrap'
	},
	typeBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: Radius.full
	},
	calorieBlock: {
		alignItems: 'center',
		paddingVertical: Spacing.base
	},
	macroCards: {
		flexDirection: 'row',
		gap: Spacing.sm
	},
	macroCard: {
		flex: 1,
		gap: 4,
		alignItems: 'center',
		padding: Spacing.md,
		overflow: 'visible'
	},
	nutrientRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: Spacing.sm,
		borderBottomWidth: StyleSheet.hairlineWidth
	},
	nutrientLeft: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	ingredients: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: Spacing.sm
	},
	ingredientChip: {
		paddingHorizontal: Spacing.md,
		paddingVertical: 6,
		borderRadius: Radius.full
	},
	footer: {
		padding: Spacing.base,
		paddingBottom: 30
	}
});
