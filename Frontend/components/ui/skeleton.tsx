import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming
} from 'react-native-reanimated';
import { Radius, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SkeletonProps {
	readonly width?: number | `${number}%`;
	readonly height?: number;
	readonly borderRadius?: number;
	readonly style?: ViewStyle;
}

export function Skeleton({
	width = '100%',
	height = 16,
	borderRadius = Radius.md,
	style
}: Readonly<SkeletonProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const opacity = useSharedValue(1);

	useEffect(() => {
		opacity.value = withRepeat(withTiming(0.35, { duration: 750 }), -1, true);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value
	}));

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: colorScheme === 'dark' ? Palette.dark700 : Palette.gray200
				},
				animatedStyle,
				style
			]}
		/>
	);
}

export default Skeleton;
