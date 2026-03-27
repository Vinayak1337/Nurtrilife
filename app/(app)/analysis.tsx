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
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
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
import { saveMealRequest } from '@/store/slices/meals.slice';
import dayjs from 'dayjs';

const ReAnimatedText = Animated.createAnimatedComponent(AppText as any);

export default function AnalysisScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const { capturedImageUri, analysisResult, isAnalyzing, error } = useAppSelector((s: import('@/store').RootState) => s.analysis);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('snack');

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

  // Loading state
  if (isAnalyzing || (!analysisResult && !error)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingHeader}>
            <Pressable onPress={handleRetake} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={20} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.loadingContent}>
            {capturedImageUri ? (
              <Image source={{ uri: capturedImageUri }} style={styles.loadingImage} contentFit="cover" />
            ) : (
              <Skeleton width="100%" height={280} borderRadius={Radius.xl} />
            )}
            <View style={styles.loadingInfo}>
              <IconSymbol name="sparkles" size={48} color={Palette.primary} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />
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
          <Button variant="ghost" size="md" onPress={handleRetake} style={{ flex: 0 }}>
            Retake
          </Button>
          <Button variant="primary" size="lg" onPress={handleSave} style={{ flex: 1 }}>
            Save Meal
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
