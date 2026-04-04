import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
	useSharedValue,
	useAnimatedProps,
	withTiming,
	Easing
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Colors, Spacing, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface BarChartProps {
	readonly data: ReadonlyArray<{
		readonly label: string;
		readonly value: number;
	}>;
	readonly goalLine?: number;
	readonly barColor?: string;
	readonly height?: number;
	readonly title?: string;
}

type AnimatedBarProps = {
	readonly x: number;
	readonly width: number;
	readonly maxHeight: number;
	readonly value: number;
	readonly maxValue: number;
	readonly color: string;
	readonly chartY: number;
};

function AnimatedBar({
	x,
	width,
	maxHeight,
	value,
	maxValue,
	color,
	chartY
}: AnimatedBarProps) {
	const barHeight = useSharedValue(0);

	useEffect(() => {
		const targetHeight = maxValue > 0 ? (value / maxValue) * maxHeight : 0;
		barHeight.value = withTiming(targetHeight, {
			duration: 800,
			easing: Easing.out(Easing.cubic)
		});
	}, [value, maxValue]);

	const animatedProps = useAnimatedProps(() => ({
		y: chartY + maxHeight - barHeight.value,
		height: barHeight.value
	}));

	return (
		<AnimatedRect
			x={x}
			rx={4}
			width={width}
			fill={color}
			animatedProps={animatedProps}
		/>
	);
}

export function BarChart({
	data,
	goalLine,
	barColor = Palette.secondary,
	height = 180,
	title
}: BarChartProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];

	const paddingLeft = 40;
	const paddingRight = 16;
	const paddingTop = 8;
	const paddingBottom = 28;
	const chartWidth = 320 - paddingLeft - paddingRight;
	const chartHeight = height - paddingTop - paddingBottom;
	const svgWidth = 320;

	const maxValue =
		Math.max(...data.map(d => d.value), goalLine ?? 0) * 1.15 || 100;
	const barWidth = Math.min(28, (chartWidth / data.length) * 0.6);
	const barGap = (chartWidth - barWidth * data.length) / (data.length + 1);

	// Grid lines
	const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
		y: paddingTop + chartHeight * (1 - pct),
		label: Math.round(maxValue * pct).toString()
	}));

	return (
		<View style={styles.container}>
			{title && (
				<AppText
					variant='label'
					color={theme.textTertiary}
					style={styles.title}>
					{title}
				</AppText>
			)}
			<Svg
				width={svgWidth}
				height={height}
				viewBox={`0 0 ${svgWidth} ${height}`}>
				{/* Grid lines */}
				{gridLines.map((line, i) => (
					<React.Fragment key={i + 'barChart'}>
						<Line
							x1={paddingLeft}
							y1={line.y}
							x2={svgWidth - paddingRight}
							y2={line.y}
							stroke={theme.border}
							strokeWidth={0.5}
						/>
						<SvgText
							x={paddingLeft - 6}
							y={line.y + 4}
							textAnchor='end'
							fill={theme.textTertiary}
							fontSize={10}
							fontFamily='SpaceGrotesk_400Regular'>
							{line.label}
						</SvgText>
					</React.Fragment>
				))}

				{/* Bars */}
				{data.map((d, i) => {
					const x = paddingLeft + barGap + i * (barWidth + barGap);
					return (
						<React.Fragment key={i + 'barChartData'}>
							<AnimatedBar
								x={x}
								width={barWidth}
								maxHeight={chartHeight}
								value={d.value}
								maxValue={maxValue}
								color={barColor}
								chartY={paddingTop}
							/>
							<SvgText
								x={x + barWidth / 2}
								y={height - 6}
								textAnchor='middle'
								fill={theme.textTertiary}
								fontSize={10}
								fontFamily='SpaceGrotesk_400Regular'>
								{d.label}
							</SvgText>
						</React.Fragment>
					);
				})}

				{/* Goal line */}
				{goalLine != null && goalLine > 0 && (
					<Line
						x1={paddingLeft}
						y1={paddingTop + chartHeight * (1 - goalLine / maxValue)}
						x2={svgWidth - paddingRight}
						y2={paddingTop + chartHeight * (1 - goalLine / maxValue)}
						stroke={Palette.primary}
						strokeWidth={1.5}
						strokeDasharray='6 4'
					/>
				)}
			</Svg>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { alignItems: 'center' },
	title: { marginBottom: Spacing.sm, alignSelf: 'flex-start' }
});
