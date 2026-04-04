import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from './text';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { MealSuggestion } from '@/services/recommendations.service';

export function RecommendationCard({
	suggestion
}: Readonly<{ suggestion: MealSuggestion }>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];

	return (
		<View style={[styles.card, { backgroundColor: theme.surface }]}>
			<AppText style={styles.emoji}>{suggestion.emoji}</AppText>
			<AppText
				variant='label'
				color={theme.text}
				numberOfLines={1}
				style={styles.name}>
				{suggestion.foodName}
			</AppText>
			<AppText
				variant='caption'
				color={theme.textTertiary}
				numberOfLines={2}
				style={styles.desc}>
				{suggestion.description}
			</AppText>

			<View style={styles.macros}>
				<View
					style={[
						styles.macroPill,
						{ backgroundColor: `${Palette.secondary}15` }
					]}>
					<AppText variant='caption' color={Palette.secondary}>
						{suggestion.calories} kcal
					</AppText>
				</View>
				<View
					style={[
						styles.macroPill,
						{ backgroundColor: `${Palette.protein}15` }
					]}>
					<AppText variant='caption' color={Palette.protein}>
						{suggestion.protein}g P
					</AppText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 150,
		padding: Spacing.md,
		borderRadius: Radius.lg,
		marginRight: Spacing.sm,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2
	},
	emoji: {
		fontSize: 32,
		marginBottom: Spacing.sm
	},
	name: {
		marginBottom: 4
	},
	desc: {
		marginBottom: Spacing.sm,
		lineHeight: 16
	},
	macros: {
		flexDirection: 'row',
		gap: 6,
		flexWrap: 'wrap'
	},
	macroPill: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: Radius.full
	}
});
