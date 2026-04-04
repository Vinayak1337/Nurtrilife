import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Dataset {
	data: number[];
	color: string;
	label: string;
}

interface LineChartProps {
	datasets: Dataset[];
	labels: string[];
	height?: number;
	title?: string;
}

export function LineChart({
	datasets,
	labels,
	height = 160,
	title
}: Readonly<LineChartProps>) {
	const colorScheme = useColorScheme() ?? 'light';
	const theme = Colors[colorScheme];

	const paddingLeft = 40;
	const paddingRight = 16;
	const paddingTop = 12;
	const paddingBottom = 28;
	const svgWidth = 320;
	const chartWidth = svgWidth - paddingLeft - paddingRight;
	const chartHeight = height - paddingTop - paddingBottom;

	const allValues = datasets.flatMap(d => d.data);
	const maxValue = Math.max(...allValues) * 1.15 || 100;

	const pointSpacing =
		labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;

	function getX(i: number) {
		return paddingLeft + i * pointSpacing;
	}
	function getY(value: number) {
		return paddingTop + chartHeight * (1 - value / maxValue);
	}

	function buildPath(data: number[]): string {
		if (data.length === 0) return '';
		const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }));

		let path = `M${points[0].x},${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
			const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
			path += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
		}
		return path;
	}

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
				{[0, 0.5, 1].map((pct, i) => (
					<React.Fragment key={i + 'lineChartGrid'}>
						<Line
							x1={paddingLeft}
							y1={paddingTop + chartHeight * (1 - pct)}
							x2={svgWidth - paddingRight}
							y2={paddingTop + chartHeight * (1 - pct)}
							stroke={theme.border}
							strokeWidth={0.5}
						/>
						<SvgText
							x={paddingLeft - 6}
							y={paddingTop + chartHeight * (1 - pct) + 4}
							textAnchor='end'
							fill={theme.textTertiary}
							fontSize={10}
							fontFamily='SpaceGrotesk_400Regular'>
							{Math.round(maxValue * pct)}
						</SvgText>
					</React.Fragment>
				))}

				{/* Datasets */}
				{datasets.map((dataset, di) => (
					<React.Fragment key={di + 'lineChartData'}>
						<Path
							d={buildPath(dataset.data)}
							fill='none'
							stroke={dataset.color}
							strokeWidth={2}
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						{dataset.data.map((v, i) => (
							<Circle
								key={i + 'lineChartData2'}
								cx={getX(i)}
								cy={getY(v)}
								r={3}
								fill={dataset.color}
							/>
						))}
					</React.Fragment>
				))}

				{/* X-axis labels */}
				{labels.map((label, i) => (
					<SvgText
						key={i + 'lineChartLabels'}
						x={getX(i)}
						y={height - 6}
						textAnchor='middle'
						fill={theme.textTertiary}
						fontSize={10}
						fontFamily='SpaceGrotesk_400Regular'>
						{label}
					</SvgText>
				))}
			</Svg>

			{/* Legend */}
			<View style={styles.legend}>
				{datasets.map((d, i) => (
					<View key={i + 'lineChartLegend'} style={styles.legendItem}>
						<View style={[styles.legendDot, { backgroundColor: d.color }]} />
						<AppText variant='caption' color={theme.textTertiary}>
							{d.label}
						</AppText>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { alignItems: 'center' },
	title: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
	legend: {
		flexDirection: 'row',
		gap: Spacing.base,
		marginTop: Spacing.sm
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4
	}
});
