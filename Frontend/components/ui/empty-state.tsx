import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from './text';
import { Button } from './button';
import { IconSymbol, IconSymbolName } from './icon-symbol';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
	icon: IconSymbolName;
	iconColor?: string;
	title: string;
	subtitle: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function EmptyState({
	icon,
	iconColor,
	title,
	subtitle,
	actionLabel,
	onAction
}: Readonly<EmptyStateProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const color = iconColor ?? theme.textTertiary;

	return (
		<View style={styles.container}>
			<View style={[styles.iconWrap, { backgroundColor: `${color}12` }]}>
				<IconSymbol name={icon} size={40} color={color} />
			</View>
			<AppText variant='subheading' color={theme.text} style={styles.title}>
				{title}
			</AppText>
			<AppText
				variant='body'
				color={theme.textTertiary}
				style={styles.subtitle}>
				{subtitle}
			</AppText>
			{actionLabel && onAction && (
				<Button
					variant='primary'
					size='md'
					onPress={onAction}
					style={styles.button}>
					{actionLabel}
				</Button>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingVertical: Spacing.xxxl,
		paddingHorizontal: Spacing.xl
	},
	iconWrap: {
		width: 80,
		height: 80,
		borderRadius: Radius.xxl,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: Spacing.lg
	},
	title: {
		textAlign: 'center',
		marginBottom: Spacing.sm
	},
	subtitle: {
		textAlign: 'center',
		lineHeight: 22
	},
	button: {
		marginTop: Spacing.xl
	}
});
