import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
	useSharedValue,
	useAnimatedProps,
	withTiming,
	Easing
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Colors, Palette, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthScoreRingProps {
	readonly score: number; // 0-100
	readonly grade: string;
	readonly label: string;
	readonly size?: number;
}

function getScoreColors(score: number): [string, string] {
	if (score >= 70) return [Palette.primary, '#34D399'];
	if (score >= 40) return ['#F59E0B', '#FBBF24'];
	return ['#EF4444', '#F87171'];
}

export function HealthScoreRing({
	score,
	label,
	size = 180
}: Readonly<HealthScoreRingProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];

	const strokeWidth = 14;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const center = size / 2;

	const progress = useSharedValue(0);
	const displayScore = useSharedValue(0);

	useEffect(() => {
		progress.value = withTiming(score / 100, {
			duration: 1200,
			easing: Easing.out(Easing.cubic)
		});
		displayScore.value = withTiming(score, {
			duration: 1200,
			easing: Easing.out(Easing.cubic)
		});
	}, [score]);

	const animatedCircleProps = useAnimatedProps(() => ({
		strokeDashoffset: circumference * (1 - progress.value)
	}));

	const [color1, color2] = getScoreColors(score);

	return (
		<View style={[styles.container, { width: size, height: size }]}>
			<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<Defs>
					<LinearGradient id='scoreGradient' x1='0' y1='0' x2='1' y2='1'>
						<Stop offset='0' stopColor={color1} />
						<Stop offset='1' stopColor={color2} />
					</LinearGradient>
				</Defs>

				{/* Track */}
				<Circle
					cx={center}
					cy={center}
					r={radius}
					fill='none'
					stroke={theme.border}
					strokeWidth={strokeWidth}
					opacity={0.3}
				/>

				{/* Progress */}
				<AnimatedCircle
					cx={center}
					cy={center}
					r={radius}
					fill='none'
					stroke='url(#scoreGradient)'
					strokeWidth={strokeWidth}
					strokeLinecap='round'
					strokeDasharray={circumference}
					animatedProps={animatedCircleProps}
					transform={`rotate(-90 ${center} ${center})`}
				/>
			</Svg>

			{/* Center content — absoluteFill so it's always centred inside the ring */}
			<View style={styles.centerContent}>
				<AppText style={[styles.scoreText, { color: color1 }]}>{score}</AppText>
				<AppText variant='label' color={theme.textTertiary}>
					{label}
				</AppText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	centerContent: {
		...StyleSheet.absoluteFill,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2
	},
	scoreText: {
		fontFamily: FontFamily.bold,
		fontSize: 42,
		lineHeight: 48
	}
});
