import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing
} from 'react-native-reanimated';
import { AppText } from './text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MacroBarProps {
	readonly label: string;
	readonly consumed: number;
	readonly goal: number;
	readonly color: string;
	readonly mutedColor?: string;
	readonly unit?: string;
	readonly animate?: boolean;
}

export function MacroBar({
	label,
	consumed,
	goal,
	color,
	mutedColor,
	unit = 'g',
	animate = true
}: Readonly<MacroBarProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];
	const ratio = goal > 0 ? Math.min(consumed / goal, 1) : 0;

	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withTiming(ratio, {
			duration: 900,
			easing: Easing.out(Easing.quad)
		});
	}, [ratio]);

	const animatedFill = useAnimatedStyle(() => ({
		width: `${progress.value * 100}%`
	}));

	const isOver = consumed > goal;

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View style={[styles.dot, { backgroundColor: color }]} />
				<AppText variant='label' color={theme.text} style={styles.label}>
					{label}
				</AppText>
				<View style={styles.spacer} />
				<AppText variant='label' color={isOver ? color : theme.textSecondary}>
					{consumed.toFixed(1)}
					<AppText variant='caption' color={theme.textTertiary}>
						{' '}
						/{goal}
						{unit}
					</AppText>
				</AppText>
			</View>

			<View
				style={[
					styles.track,
					{
						backgroundColor: mutedColor ?? `${color}22`
					}
				]}>
				<Animated.View
					style={[
						styles.fill,
						{
							backgroundColor: color,
							borderRadius: Radius.full
						},
						animatedFill
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: Spacing.xs
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: Spacing.sm
	},
	label: {
		flex: 0
	},
	spacer: {
		flex: 1
	},
	track: {
		height: 8,
		borderRadius: Radius.full,
		overflow: 'hidden'
	},
	fill: {
		height: '100%',
		minWidth: 4
	}
});

export default MacroBar;
