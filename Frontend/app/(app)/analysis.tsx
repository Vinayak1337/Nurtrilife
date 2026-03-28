import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { router } from 'expo-router';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Palette, Radius, Spacing, Shadow } from '@/constants/theme';
import { MEAL_TYPE_META, NUTRIENT_META, MealType } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAnalysis, analyzeImageRequest } from '@/store/slices/analysis.slice';
import { saveMealRequest, clearError } from '@/store/slices/meals.slice';
import dayjs from 'dayjs';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function PulsingRing() {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.85);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1, false,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
  }, []);

  const SIZE = 100;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - pulse.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }, containerStyle]}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Palette.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={Palette.secondary} stopOpacity="0.3" />
          </SvgGradient>
        </Defs>
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

function ScanLine() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(260, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 2,
        backgroundColor: Palette.primary,
        opacity: 0.6,
        shadowColor: Palette.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      }, style]}
    />
  );
}

export default function AnalysisScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const { capturedImageUri, analysisResult, isAnalyzing, error } = useAppSelector((s: import('@/store').RootState) => s.analysis);
  const isSaving = useAppSelector((s: import('@/store').RootState) => s.meals.isLoading);
  const saveError = useAppSelector((s: import('@/store').RootState) => s.meals.error);
  const prevSavingRef = useRef(false);

  // Show alert if the save saga failed, then clear the error
  useEffect(() => {
    if (prevSavingRef.current && !isSaving && saveError) {
      Alert.alert('Save Failed', saveError, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
    prevSavingRef.current = isSaving;
  }, [isSaving, saveError]);

  const [selectedMealType, setSelectedMealType] = useState<MealType>(() => {
    const h = new Date().getHours();
    if (h < 11) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  });

  useEffect(() => {
    if (analysisResult?.mealType) {
      setSelectedMealType(analysisResult.mealType);
    }
  }, [analysisResult?.mealType]);

  function handleRetake() {
    dispatch(clearAnalysis());
    router.back();
  }

  function handleRetry() {
    if (capturedImageUri) {
      dispatch(analyzeImageRequest(capturedImageUri));
    }
  }

  function handleSave() {
    if (!analysisResult || !capturedImageUri) return;
    dispatch(saveMealRequest({
      photoUri: capturedImageUri,
      foodName: analysisResult.foodName,
      description: analysisResult.description,
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fats: analysisResult.fats,
      fiber: analysisResult.fiber,
      sugar: analysisResult.sugar,
      sodium: analysisResult.sodium,
      ingredients: analysisResult.ingredients,
      mealType: selectedMealType,
      date: dayjs().format('YYYY-MM-DD'),
    }));
  }

  // Loading state — only while the saga is actively running
  if (isAnalyzing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingHeader}>
            <Pressable onPress={handleRetake} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={20} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.loadingContent}>
            {/* Food image with scanning overlay */}
            <View style={styles.scanContainer}>
              {capturedImageUri ? (
                <Image source={{ uri: capturedImageUri }} style={styles.loadingImage} contentFit="cover" />
              ) : (
                <Skeleton width="100%" height={280} borderRadius={Radius.xl} />
              )}
              {capturedImageUri && (
                <View style={styles.scanOverlay}>
                  <ScanLine />
                </View>
              )}
            </View>

            <View style={styles.loadingInfo}>
              {/* Pulsing ring around sparkle icon */}
              <View style={{ alignSelf: 'center', marginBottom: Spacing.sm, alignItems: 'center', justifyContent: 'center' }}>
                <PulsingRing />
                <View style={{ position: 'absolute' }}>
                  <IconSymbol name="sparkles" size={36} color={Palette.primary} />
                </View>
              </View>
              <AppText variant="heading" color={theme.text} align="center">
                Analyzing...
              </AppText>
              <AppText variant="body" color={theme.textTertiary} align="center">
                Our AI is identifying your food and calculating nutritional values
              </AppText>
              <View style={styles.skeletons}>
                <Skeleton width="60%" height={16} style={{ alignSelf: 'center' }} />
                <View style={styles.skeletonMacros}>
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} width={90} height={80} borderRadius={Radius.xl} />
                  ))}
                </View>
                <Skeleton width="100%" height={12} />
                <Skeleton width="85%" height={12} />
                <Skeleton width="70%" height={12} />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingHeader}>
            <Pressable onPress={handleRetake} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={20} color={theme.text} />
            </Pressable>
          </View>
          <View style={[styles.loadingContent, styles.errorContent]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={64} color={Palette.accent} style={{ alignSelf: 'center', marginBottom: Spacing.base }} />
            <AppText variant="heading" color={theme.text} align="center">
              Analysis Failed
            </AppText>
            <AppText variant="body" color={theme.textTertiary} align="center" style={{ paddingHorizontal: Spacing.xl }}>
              {error}
            </AppText>
            <View style={styles.errorButtons}>
              <Button variant="primary" size="lg" fullWidth onPress={handleRetry}>
                Try Again
              </Button>
              <Button variant="ghost" size="md" onPress={handleRetake}>
                Retake Photo
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // No state at all — shouldn't happen in normal flow, redirect away.
  // Must be in useEffect — calling router during render crashes React.
  useEffect(() => {
    if (!analysisResult && !error && !isAnalyzing) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [analysisResult, error, isAnalyzing]);

  if (!analysisResult && !error && !isAnalyzing) return null;

  if (!analysisResult) return null;

  const confidenceColors: Record<'high' | 'medium' | 'low', string> = { high: Palette.primary, medium: Palette.secondary, low: Palette.accent };
  const confidenceColor = confidenceColors[analysisResult.confidence];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Food photo */}
          <Animated.View entering={FadeIn.duration(400)}>
            {capturedImageUri ? (
              <Image source={{ uri: capturedImageUri }} style={styles.foodImage} contentFit="cover" />
            ) : (
              <View style={[styles.foodImage, { backgroundColor: theme.surfaceSecondary }]} />
            )}
          </Animated.View>

          <View style={styles.content}>
            {/* Food name + confidence */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.nameRow}>
              <AppText variant="title" color={theme.text} style={{ flex: 1 }}>
                {analysisResult.foodName}
              </AppText>
              <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceColor}20` }]}>
                <AppText variant="caption" color={confidenceColor} weight="semiBold">
                  {analysisResult.confidence.toUpperCase()}
                </AppText>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250)}>
              <AppText variant="body" color={theme.textTertiary}>
                {analysisResult.description}
              </AppText>
              <AppText variant="caption" color={theme.textTertiary} style={{ marginTop: 4 }}>
                Serving: {analysisResult.servingSize}
              </AppText>
            </Animated.View>

            {/* Big calorie number */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.caloriesSection}>
              <AppText
                variant="display"
                color={Palette.secondary}
                align="center"
              >
                {analysisResult.calories.toLocaleString()}
              </AppText>
              <AppText variant="subheading" color={theme.textTertiary} align="center">
                Calories
              </AppText>
            </Animated.View>

            {/* Macro cards */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.macroCards}>
              {[
                { key: 'protein', value: analysisResult.protein },
                { key: 'carbs', value: analysisResult.carbs },
                { key: 'fats', value: analysisResult.fats },
              ].map(({ key, value }) => {
                const meta = NUTRIENT_META[key as keyof typeof NUTRIENT_META];
                return (
                  <Card
                    key={key}
                    style={[styles.macroCard, { borderTopWidth: 3, borderTopColor: meta.color }]}
                  >
                    <IconSymbol name={meta.icon} size={22} color={meta.color} />
                    <AppText variant="heading" color={meta.color} align="center">
                      {value.toFixed(1)}
                    </AppText>
                    <AppText variant="caption" color={theme.textTertiary} align="center">
                      {meta.unit} {meta.label}
                    </AppText>
                  </Card>
                );
              })}
            </Animated.View>

            {/* Detail nutrients */}
            <Animated.View entering={FadeInDown.delay(500)}>
              <Card>
                <AppText variant="label" color={theme.textTertiary} style={{ marginBottom: Spacing.md }}>
                  DETAILED NUTRIENTS
                </AppText>
                {[
                  { key: 'fiber', value: analysisResult.fiber },
                  { key: 'sugar', value: analysisResult.sugar },
                  { key: 'sodium', value: analysisResult.sodium },
                ].map(({ key, value }) => {
                  const meta = NUTRIENT_META[key as keyof typeof NUTRIENT_META];
                  return (
                    <View key={key} style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <IconSymbol name={meta.icon} size={18} color={meta.color} style={{ marginRight: 8 }} />
                        <AppText variant="body" color={theme.text}>{meta.label}</AppText>
                      </View>
                      <AppText variant="body" weight="semiBold" color={meta.color}>
                        {value.toFixed(1)} {meta.unit}
                      </AppText>
                    </View>
                  );
                })}
              </Card>
            </Animated.View>

            {/* Ingredients */}
            {analysisResult.ingredients.length > 0 && (
              <Animated.View entering={FadeInDown.delay(600)}>
                <Card>
                  <AppText variant="label" color={theme.textTertiary} style={{ marginBottom: Spacing.md }}>
                    INGREDIENTS
                  </AppText>
                  <View style={styles.ingredients}>
                    {analysisResult.ingredients.map((ing: string, i: number) => (
                      <View key={i} style={[styles.ingredientChip, { backgroundColor: theme.surfaceSecondary }]}>
                        <AppText variant="caption" color={theme.textSecondary}>{ing}</AppText>
                      </View>
                    ))}
                  </View>
                </Card>
              </Animated.View>
            )}

            {/* Meal type selector */}
            <Animated.View entering={FadeInDown.delay(700)}>
              <AppText variant="label" color={theme.textTertiary} style={{ marginBottom: Spacing.sm }}>
                MEAL TYPE
              </AppText>
              <View style={styles.mealTypes}>
                {(Object.keys(MEAL_TYPE_META) as MealType[]).map((type) => {
                  const meta = MEAL_TYPE_META[type];
                  const isSelected = selectedMealType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setSelectedMealType(type)}
                      style={[
                        styles.mealTypeChip,
                        {
                          backgroundColor: isSelected ? `${meta.color}20` : theme.surfaceSecondary,
                          borderColor: isSelected ? meta.color : 'transparent',
                          borderWidth: 1.5,
                        },
                      ]}
                    >
                      <IconSymbol name={meta.icon} size={16} color={isSelected ? meta.color : theme.textTertiary} />
                      <AppText variant="label" color={isSelected ? meta.color : theme.textTertiary}>
                        {meta.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <Animated.View entering={FadeInDown.delay(800)} style={[styles.bottomBar, { backgroundColor: theme.surface, ...Shadow.md }]}>
          <Button variant="ghost" size="md" onPress={handleRetake} style={{ flex: 0 }} disabled={isSaving}>
            Retake
          </Button>
          <Button variant="primary" size="lg" onPress={handleSave} style={{ flex: 1 }} loading={isSaving} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Meal'}
          </Button>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  loadingHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  scanContainer: {
    width: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  loadingImage: {
    width: '100%',
    height: 280,
    borderRadius: Radius.xl,
  },
  loadingInfo: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.base,
  },
  skeletons: { width: '100%', gap: Spacing.base },
  skeletonMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.base,
  },
  errorButtons: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  foodImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: 6,
  },
  caloriesSection: {
    paddingVertical: Spacing.lg,
  },
  macroCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroCard: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
    padding: Spacing.md,
    overflow: 'visible',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.12)',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ingredientChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.base,
    paddingBottom: 30,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
});
