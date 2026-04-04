import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from './text';
import { IconSymbol } from './icon-symbol';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DeficiencyAlert as AlertType } from '@/utils/deficiency-detector';

export function DeficiencyAlertCard({ alert }: Readonly<{ alert: AlertType }>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const isAlert = alert.severity === 'alert';

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: theme.surface,
					borderLeftColor: alert.color
				}
			]}>
			<View style={styles.header}>
				<View
					style={[styles.iconWrap, { backgroundColor: `${alert.color}18` }]}>
					<IconSymbol name={alert.icon} size={18} color={alert.color} />
				</View>
				<View style={styles.headerText}>
					<AppText variant='label' color={theme.text}>
						{alert.nutrient}
					</AppText>
					<View
						style={[
							styles.badge,
							{ backgroundColor: isAlert ? '#EF444420' : '#F59E0B20' }
						]}>
						<AppText variant='caption' color={isAlert ? '#EF4444' : '#F59E0B'}>
							{isAlert ? 'Alert' : 'Warning'}
						</AppText>
					</View>
				</View>
			</View>
			<AppText
				variant='bodySmall'
				color={theme.textSecondary}
				style={styles.message}>
				{alert.message}
			</AppText>
			<AppText
				variant='caption'
				color={theme.textTertiary}
				style={styles.recommendation}>
				{alert.recommendation}
			</AppText>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderLeftWidth: 3,
		borderRadius: Radius.lg,
		padding: Spacing.base,
		marginBottom: Spacing.sm,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 1
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.sm,
		marginBottom: Spacing.sm
	},
	iconWrap: {
		width: 32,
		height: 32,
		borderRadius: Radius.sm,
		alignItems: 'center',
		justifyContent: 'center'
	},
	headerText: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.sm
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: Radius.full
	},
	message: {
		marginBottom: 4
	},
	recommendation: {
		fontStyle: 'italic'
	}
});
