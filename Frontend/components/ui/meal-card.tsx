import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import { AppText } from './text';
import { IconSymbol } from './icon-symbol';
import { Colors, Radius, Spacing, Palette, FontFamily, FontSize } from '@/constants/theme';
import { MEAL_TYPE_META, NUTRIENT_META } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Meal } from '@/store/slices/meals.slice';
import dayjs from 'dayjs';

interface MealCardProps {
	meal: Meal;
	onPress?: () => void;
	onDelete?: (id: string) => void;
	index?: number;
}

export function MealCard({
	meal,
	onPress,
	onDelete,
	index = 0
}: Readonly<MealCardProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const mealMeta = MEAL_TYPE_META[meal.mealType];
	const time = dayjs(meal.createdAt).format('h:mm A');

	function handleDelete() {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		Alert.alert('Delete Meal', `Remove "${meal.foodName}" from your log?`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => onDelete?.(meal.id)
			}
		]);
	}

	function renderRightActions() {
		if (!onDelete) return null;
		return (
			<Pressable onPress={handleDelete} style={styles.deleteAction}>
				<IconSymbol name='trash.fill' size={22} color={Palette.white} />
				<AppText variant='caption' color={Palette.white}>
					Delete
				</AppText>
			</Pressable>
		);
	}

	const cardContent = (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.container,
				{
					backgroundColor: theme.surface,
					opacity: pressed ? 0.85 : 1
				}
			]}>
			{/* Food photo */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: meal.photoUri }}
					style={styles.image}
					contentFit='cover'
					cachePolicy='memory-disk'
					placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
				/>
			</View>

			{/* Info */}
			<View style={styles.info}>
				<AppText
					variant='body'
					weight='semiBold'
					numberOfLines={1}
					color={theme.text}>
					{meal.foodName}
				</AppText>

				<View style={styles.meta}>
					<View
						style={[styles.badge, { backgroundColor: mealMeta.color + '20' }]}>
						<IconSymbol name={mealMeta.icon} size={11} color={mealMeta.color} />
						<AppText variant='caption' color={mealMeta.color} weight='medium'>
							{mealMeta.label}
						</AppText>
					</View>
					<AppText variant='caption' color={theme.textTertiary}>
						{time}
					</AppText>
				</View>

				{/* Macros mini-row */}
				<View style={styles.macros}>
					<MacroChip
						label='P'
						value={meal.protein}
						color={Palette.protein}
						unit='g'
					/>
					<MacroChip
						label='C'
						value={meal.carbs}
						color={Palette.carbs}
						unit='g'
					/>
					<MacroChip
						label='F'
						value={meal.fats}
						color={Palette.fats}
						unit='g'
					/>
				</View>
			</View>

			{/* Calories */}
			<View style={styles.calorieContainer}>
				<AppText
					style={{
						fontFamily: FontFamily.bold,
						fontSize: FontSize.lg,
						color: Palette.secondary
					}}>
					{Math.round(meal.calories)}
				</AppText>
				<AppText variant='caption' color={theme.textTertiary}>
					{NUTRIENT_META.calories.unit}
				</AppText>
			</View>
		</Pressable>
	);

	return (
		<Animated.View entering={FadeInDown.delay(index * 80).springify()}>
			{onDelete ? (
				<ReanimatedSwipeable
					renderRightActions={renderRightActions}
					overshootRight={false}
					friction={2}>
					{cardContent}
				</ReanimatedSwipeable>
			) : (
				cardContent
			)}
		</Animated.View>
	);
}

function MacroChip({
	label,
	value,
	color,
	unit
}: Readonly<{ label: string; value: number; color: string; unit: string }>) {
	return (
		<View style={styles.macroChip}>
			<AppText variant='caption' color={color} weight='semiBold'>
				{label}
			</AppText>
			<AppText variant='caption' color={color}>
				{' '}
				{value.toFixed(0)}
				{unit}
			</AppText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: Radius.xl,
		padding: Spacing.md,
		gap: Spacing.md,
		marginBottom: Spacing.sm
	},
	imageContainer: {
		borderRadius: Radius.md,
		overflow: 'hidden'
	},
	image: {
		width: 68,
		height: 68,
		borderRadius: Radius.md
	},
	info: {
		flex: 1,
		gap: 4
	},
	meta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.sm
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: Radius.full
	},
	macros: {
		flexDirection: 'row',
		gap: Spacing.sm,
		flexWrap: 'wrap'
	},
	macroChip: {
		flexDirection: 'row'
	},
	calorieContainer: {
		alignItems: 'center',
		minWidth: 48
	},
	deleteAction: {
		backgroundColor: Palette.accent,
		justifyContent: 'center',
		alignItems: 'center',
		width: 80,
		borderRadius: Radius.xl,
		marginBottom: Spacing.sm,
		marginLeft: Spacing.sm,
		gap: 4
	}
});

export default MealCard;
