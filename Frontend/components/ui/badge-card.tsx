import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from './text';
import { IconSymbol } from './icon-symbol';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BadgeDefinition } from '@/constants/badges';

interface BadgeCardProps {
	readonly badge: BadgeDefinition;
	readonly unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];

	return (
		<View
			style={[
				styles.card,
				{ backgroundColor: theme.surface },
				!unlocked && styles.locked
			]}>
			<View
				style={[
					styles.iconWrap,
					{
						backgroundColor: unlocked
							? `${badge.color}18`
							: theme.surfaceSecondary
					}
				]}>
				<IconSymbol
					name={badge.icon}
					size={24}
					color={unlocked ? badge.color : theme.textTertiary}
				/>
			</View>
			<AppText
				variant='caption'
				color={unlocked ? theme.text : theme.textTertiary}
				style={styles.name}
				numberOfLines={1}>
				{badge.name}
			</AppText>
			<AppText
				variant='caption'
				color={theme.textTertiary}
				style={styles.desc}
				numberOfLines={2}>
				{badge.description}
			</AppText>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '30%',
		alignItems: 'center',
		padding: Spacing.md,
		borderRadius: Radius.lg,
		gap: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 1
	},
	locked: {
		opacity: 0.5
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center'
	},
	name: {
		textAlign: 'center'
	},
	desc: {
		textAlign: 'center',
		fontSize: 10,
		lineHeight: 14
	}
});
