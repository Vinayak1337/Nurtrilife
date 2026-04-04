import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { NutrientRing } from '@/components/ui/nutrient-ring';
import { MacroBar } from '@/components/ui/macro-bar';
import { MealCard } from '@/components/ui/meal-card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WaterTracker } from '@/components/ui/water-tracker';
import { RecommendationCard } from '@/components/ui/recommendation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Palette, Spacing } from '@/constants/theme';
import { NUTRIENT_META } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/use-auth';
import { useTodayMeals, useMealsLoading, useTodayTotals } from '@/hooks/use-meals';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteMealRequest } from '@/store/slices/meals.slice';
import { addWaterRequest } from '@/store/slices/water.slice';
import { refreshGamificationRequest } from '@/store/slices/gamification.slice';
import { syncTodayRequest } from '@/store/slices/auth.slice';
import { setLastCustomWaterMl } from '@/store/slices/ui.slice';
import { getMealRecommendations, MealSuggestion } from '@/services/recommendations.service';
import { router } from 'expo-router';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';   // 5 AM – 11:59 AM
  if (hour >= 12 && hour < 18) return 'Good afternoon'; // 12 PM – 5:59 PM
  return 'Good evening'; // 6 PM – 11:59 PM  and  midnight – 4:59 AM
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const user = useUser();
  const meals = useTodayMeals();
  const isLoading = useMealsLoading();
  const totals = useTodayTotals();
  const { currentStreak } = useAppSelector((s) => s.gamification);
  const lastCustomWaterMl = useAppSelector((s) => s.ui.lastCustomWaterMl);
  const waterEntries = useAppSelector((s) => s.water.entries);

  const [recommendations, setRecommendations] = useState<MealSuggestion[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');
  const waterTodayTotal = useMemo(
    () => waterEntries.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0),
    [waterEntries, today],
  );
  const displayDate = dayjs().format('dddd, MMMM D');

  // Track the date that was active when data was last fetched so we can
  // detect a midnight rollover while the app is backgrounded.
  const fetchedDateRef = useRef<string>(today);

  useEffect(() => {
    dispatch(syncTodayRequest());
    fetchedDateRef.current = today;
  }, [today]);

  // When the app returns to the foreground, check if the calendar date has
  // changed since the last fetch.  If it has, re-fetch so the home screen
  // always shows data for the current day instead of stale yesterday data.
  useEffect(() => {
    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === 'active') {
        const currentDate = dayjs().format('YYYY-MM-DD');
        if (currentDate !== fetchedDateRef.current) {
          fetchedDateRef.current = currentDate;
          setRecommendations([]);
        }
        dispatch(syncTodayRequest());
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [dispatch]);

  const calorieGoal = user?.dailyCalorieGoal ?? 2000;
  const proteinGoal = user?.dailyProteinGoal ?? 150;
  const carbsGoal = user?.dailyCarbsGoal ?? 200;
  const fatsGoal = user?.dailyFatsGoal ?? 65;
  const waterGoal = user?.dailyWaterGoal ?? 2500;
  const remaining = Math.max(0, calorieGoal - totals.calories);
  const loadingRecsRef = useRef(false);
  const recsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRecommendations = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRecsRef.current) return;
    loadingRecsRef.current = true;
    setLoadingRecs(true);
    try {
      const recs = await getMealRecommendations(
        Math.max(0, calorieGoal - totals.calories),
        Math.max(0, proteinGoal - totals.protein),
        Math.max(0, carbsGoal - totals.carbs),
        Math.max(0, fatsGoal - totals.fats),
      );
      setRecommendations(recs);
    } catch {
      // Silently fail
    } finally {
      setLoadingRecs(false);
      loadingRecsRef.current = false;
    }
  }, [calorieGoal, proteinGoal, carbsGoal, fatsGoal, totals]);

  // Load recommendations once after meals stabilize — debounced so rapid
  // Redux updates (persist rehydrate + server sync) only trigger one call.
  useEffect(() => {
    if (meals.length === 0) return;
    if (recsDebounceRef.current) clearTimeout(recsDebounceRef.current);
    recsDebounceRef.current = setTimeout(loadRecommendations, 1500);
    return () => {
      if (recsDebounceRef.current) clearTimeout(recsDebounceRef.current);
    };
  }, [meals.length, loadRecommendations]);

  function handleRefresh() {
    dispatch(syncTodayRequest());
    loadRecommendations();
  }

  function handleAddWater(amount: number) {
    dispatch(addWaterRequest(amount));
  }

  function handleCustomWaterAdd(amount: number) {
    dispatch(setLastCustomWaterMl(amount));
  }

  function handleDeleteMeal(id: string) {
    dispatch(deleteMealRequest(id));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Palette.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <AppText variant="body" color={theme.textTertiary}>
                {displayDate}
              </AppText>
              <AppText variant="heading" color={theme.text}>
                {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </AppText>
            </View>
            {currentStreak > 0 && (
              <View style={[styles.streakPill, { backgroundColor: `${Palette.secondary}15` }]}>
                <IconSymbol name="flame.fill" size={16} color={Palette.secondary} />
                <AppText variant="label" color={Palette.secondary}>
                  {currentStreak}
                </AppText>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Calorie ring */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.ringSection}>
          <Card style={styles.ringCard}>
            <AppText variant="label" color={theme.textTertiary} align="center" style={{ marginBottom: Spacing.base }}>
              TODAY'S CALORIES
            </AppText>
            <View style={styles.ringRow}>
              <NutrientRing
                consumed={totals.calories}
                goal={calorieGoal}
                size={180}
                strokeWidth={18}
                label="kcal"
              />
              <View style={styles.ringStats}>
                <StatItem
                  label="Consumed"
                  value={`${Math.round(totals.calories)}`}
                  unit="kcal"
                  color={Palette.secondary}
                />
                <View style={styles.divider} />
                <StatItem
                  label="Remaining"
                  value={`${Math.round(remaining)}`}
                  unit="kcal"
                  color={Palette.primary}
                />
                <View style={styles.divider} />
                <StatItem
                  label="Goal"
                  value={`${calorieGoal}`}
                  unit="kcal"
                  color={theme.textTertiary}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Macros */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Card style={styles.macroCard}>
            <AppText variant="label" color={theme.textTertiary} style={{ marginBottom: Spacing.base }}>
              MACRONUTRIENTS
            </AppText>
            <View style={styles.macros}>
              <MacroBar
                label={NUTRIENT_META.protein.label}
                consumed={totals.protein}
                goal={proteinGoal}
                color={NUTRIENT_META.protein.color}
                mutedColor={colorScheme === 'dark' ? 'rgba(59,130,246,0.12)' : NUTRIENT_META.protein.mutedColor}
                unit="g"
              />
              <MacroBar
                label={NUTRIENT_META.carbs.label}
                consumed={totals.carbs}
                goal={carbsGoal}
                color={NUTRIENT_META.carbs.color}
                mutedColor={colorScheme === 'dark' ? 'rgba(245,158,11,0.12)' : NUTRIENT_META.carbs.mutedColor}
                unit="g"
              />
              <MacroBar
                label={NUTRIENT_META.fats.label}
                consumed={totals.fats}
                goal={fatsGoal}
                color={NUTRIENT_META.fats.color}
                mutedColor={colorScheme === 'dark' ? 'rgba(239,68,68,0.12)' : NUTRIENT_META.fats.mutedColor}
                unit="g"
              />
            </View>
          </Card>
        </Animated.View>

        {/* Water Tracker */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <WaterTracker
            currentMl={waterTodayTotal}
            goalMl={waterGoal}
            onAdd={handleAddWater}
            lastCustomMl={lastCustomWaterMl}
            onCustomAdd={handleCustomWaterAdd}
          />
        </Animated.View>

        {/* AI Recommendations */}
        {remaining > 200 && recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350)} style={styles.recsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="sparkles" size={18} color={Palette.primary} />
                <AppText variant="subheading" color={theme.text}>
                  Smart Suggestions
                </AppText>
              </View>
              <AppText variant="caption" color={theme.textTertiary}>
                Based on remaining goals
              </AppText>
            </View>
            <FlatList
              data={recommendations}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `rec-${i}`}
              renderItem={({ item }) => <RecommendationCard suggestion={item} />}
              contentContainerStyle={styles.recsList}
            />
          </Animated.View>
        )}

        {/* Meals list */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <AppText variant="subheading" color={theme.text}>
              Today's Meals
            </AppText>
            <AppText variant="label" color={theme.textTertiary}>
              {meals.length} {meals.length === 1 ? 'item' : 'items'}
            </AppText>
          </View>

          {isLoading && meals.length === 0 ? (
            <View style={styles.skeletons}>
              {[0, 1, 2].map((i) => (
                <Card key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonRow}>
                    <Skeleton width={68} height={68} borderRadius={12} />
                    <View style={styles.skeletonInfo}>
                      <Skeleton width="70%" height={16} />
                      <Skeleton width="40%" height={12} />
                      <Skeleton width="50%" height={10} />
                    </View>
                    <Skeleton width={40} height={24} />
                  </View>
                </Card>
              ))}
            </View>
          ) : meals.length === 0 ? (
            <EmptyState
              icon="camera.fill"
              iconColor={Palette.primary}
              title="No meals logged yet"
              subtitle="Tap the camera button to photograph your food and start tracking"
              actionLabel="Scan Food"
              onAction={() => router.push('/(app)/(tabs)/camera')}
            />
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal: import('@/store/slices/meals.slice').Meal, index: number) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  index={index}
                  onPress={() => router.push(`/(app)/meal/${meal.id}`)}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  return (
    <View style={styles.statItem}>
      <AppText variant="caption" color={theme.textTertiary} align="center">{label}</AppText>
      <AppText style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color, textAlign: 'center' }}>
        {value}
      </AppText>
      <AppText variant="caption" color={theme.textTertiary} align="center">{unit}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ringSection: { marginBottom: Spacing.base },
  ringCard: {},
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  ringStats: {
    flex: 1,
    gap: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  macroCard: { marginBottom: Spacing.base },
  macros: { gap: Spacing.base },
  recsSection: { marginBottom: Spacing.base },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recsList: {
    paddingTop: Spacing.sm,
  },
  mealsSection: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealsList: {},
  skeletons: { gap: Spacing.sm },
  skeletonCard: {},
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonInfo: { flex: 1, gap: Spacing.sm },
});
