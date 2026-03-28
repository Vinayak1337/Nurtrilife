import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppText } from './text';
import { Palette, FontFamily, FontSize } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NutrientRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
  animate?: boolean;
}

export function NutrientRing({
  consumed,
  goal,
  size = 200,
  strokeWidth = 16,
  label = 'kcal',
  showLabel = true,
  animate = true,
}: NutrientRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      progress.value = withTiming(ratio, {
        duration: 1200,
        easing: Easing.out(Easing.quad),
      });
    } else {
      progress.value = ratio;
    }
  }, [ratio, animate]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const cx = size / 2;
  const cy = size / 2;
  const isOverGoal = consumed > goal;

  const ringColor = isOverGoal ? Palette.accent : Palette.primary;
  const gradientId = `ring-gradient-${size}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isOverGoal ? Palette.accentLight : Palette.primaryLight} />
            <Stop offset="100%" stopColor={ringColor} />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={isOverGoal ? Palette.accentMuted : Palette.primaryMuted}
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      {showLabel && (
        <View style={styles.center}>
          <AppText
            style={{
              fontFamily: FontFamily.bold,
              fontSize: FontSize.xxl,
              color: isOverGoal ? Palette.accent : Palette.primary,
              lineHeight: FontSize.xxl + 4,
            }}
          >
            {Math.round(consumed).toLocaleString()}
          </AppText>
          <AppText
            style={{
              fontFamily: FontFamily.medium,
              fontSize: FontSize.xs,
              color: Palette.gray500,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </AppText>
          {goal > 0 && (
            <AppText
              style={{
                fontFamily: FontFamily.regular,
                fontSize: FontSize.xs,
                color: Palette.gray400,
                marginTop: 2,
              }}
            >
              of {goal.toLocaleString()}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NutrientRing;
