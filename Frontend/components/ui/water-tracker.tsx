import React, { useState } from 'react';
import { View, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import Svg, { Rect, Defs, ClipPath, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AppText } from './text';
import { Card } from './card';
import { IconSymbol } from './icon-symbol';
import { Colors, Palette, Radius, Spacing, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAdd: (amount: number) => void;
  /** Last amount the user typed in the custom input. When provided, a quick-add
   *  button is shown so they can re-use it with a single tap. */
  lastCustomMl?: number | null;
  /** Called after a successful custom add so the parent can persist the value. */
  onCustomAdd?: (amount: number) => void;
}

const QUICK_ADD = [
  { label: '+250ml', amount: 250 },
  { label: '+500ml', amount: 500 },
];

export function WaterTracker({ currentMl, goalMl, onAdd, lastCustomMl, onCustomAdd }: WaterTrackerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const progress = Math.min(1, goalMl > 0 ? currentMl / goalMl : 0);
  const percentage = Math.round(progress * 100);

  const svgWidth = 60;
  const svgHeight = 80;
  const fillHeight = svgHeight * progress;

  function handleAdd(amount: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd(amount);
  }

  function handleCustomAdd() {
    const val = parseInt(customInput, 10);
    if (isNaN(val) || val < 10 || val > 2000) {
      Alert.alert('Invalid Amount', 'Please enter a value between 10 and 2000 ml.');
      return;
    }
    handleAdd(val);
    onCustomAdd?.(val); // persist the value in the parent
    setCustomInput('');
    setShowCustom(false);
  }

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Water glass visualization */}
        <View style={styles.glassWrap}>
          <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <Defs>
              <ClipPath id="glassClip">
                <Rect x={4} y={4} width={svgWidth - 8} height={svgHeight - 8} rx={8} />
              </ClipPath>
            </Defs>
            {/* Glass background */}
            <Rect
              x={4}
              y={4}
              width={svgWidth - 8}
              height={svgHeight - 8}
              rx={8}
              fill={`${Palette.protein}15`}
              stroke={`${Palette.protein}30`}
              strokeWidth={1.5}
            />
            {/* Water fill */}
            <Rect
              x={4}
              y={4 + (svgHeight - 8) * (1 - progress)}
              width={svgWidth - 8}
              height={(svgHeight - 8) * progress}
              fill={`${Palette.protein}40`}
              clipPath="url(#glassClip)"
            />
          </Svg>
          <AppText
            variant="caption"
            color={Palette.protein}
            style={styles.percentage}
          >
            {percentage}%
          </AppText>
        </View>

        {/* Info and buttons */}
        <View style={styles.info}>
          <View style={styles.infoHeader}>
            <IconSymbol name="drop.fill" size={18} color={Palette.protein} />
            <AppText variant="label" color={theme.text}>
              Hydration
            </AppText>
          </View>

          <View style={styles.amountRow}>
            <AppText style={[styles.current, { color: Palette.protein }]}>
              {currentMl >= 1000 ? `${(currentMl / 1000).toFixed(1)}L` : `${currentMl}ml`}
            </AppText>
            <AppText variant="bodySmall" color={theme.textTertiary}>
              {' / '}
              {goalMl >= 1000 ? `${(goalMl / 1000).toFixed(1)}L` : `${goalMl}ml`}
            </AppText>
          </View>

          {/* Quick add buttons */}
          <View style={styles.buttons}>
            {QUICK_ADD.map((item) => (
              <Pressable
                key={item.amount}
                onPress={() => handleAdd(item.amount)}
                style={[styles.addBtn, { backgroundColor: `${Palette.protein}15`, borderColor: `${Palette.protein}30` }]}
              >
                <AppText variant="caption" color={Palette.protein}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
            {/* Last-used custom amount — only shown after the user has typed
                a custom value at least once */}
            {lastCustomMl != null && (
              <Pressable
                onPress={() => handleAdd(lastCustomMl)}
                style={[styles.addBtn, { backgroundColor: `${Palette.protein}20`, borderColor: `${Palette.protein}50` }]}
              >
                <AppText variant="caption" color={Palette.protein}>
                  +{lastCustomMl}ml
                </AppText>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShowCustom((v) => !v)}
              style={[styles.addBtn, { backgroundColor: `${Palette.protein}15`, borderColor: `${Palette.protein}30` }]}
            >
              <AppText variant="caption" color={Palette.protein}>Custom</AppText>
            </Pressable>
          </View>
          {showCustom && (
            <View style={styles.customRow}>
              <TextInput
                style={[styles.customInput, { color: theme.text, borderColor: `${Palette.protein}40`, backgroundColor: `${Palette.protein}08` }]}
                value={customInput}
                onChangeText={setCustomInput}
                keyboardType="number-pad"
                placeholder="ml"
                placeholderTextColor={theme.textTertiary}
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={handleCustomAdd}
                autoFocus
              />
              <Pressable
                onPress={handleCustomAdd}
                style={[styles.addBtn, { backgroundColor: Palette.protein, borderColor: Palette.protein }]}
              >
                <AppText variant="caption" color="#fff">Add</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.base },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  glassWrap: {
    alignItems: 'center',
    gap: 4,
  },
  percentage: {
    fontFamily: FontFamily.semiBold,
  },
  info: {
    flex: 1,
    gap: Spacing.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  customInput: {
    flex: 1,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
});
