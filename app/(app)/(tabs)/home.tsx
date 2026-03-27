import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  
  RefreshControl,
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
import { Colors, Palette, Spacing } from '@/constants/theme';
import { NUTRIENT_META } from '@/constants/nutrition';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/use-auth';
import { useTodayMeals, useMealsLoading, useTodayTotals } from '@/hooks/use-meals';
import { useAppDispatch } from '@/store/hooks';
import { fetchMealsRequest } from '@/store/slices/meals.slice';
import { router } from 'expo-router';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const user = useUser();
  const meals = useTodayMeals();
  const isLoading = useMealsLoading();
  const totals = useTodayTotals();

  const today = dayjs().format('YYYY-MM-DD');
  const displayDate = dayjs().format('dddd, MMMM D');

  useEffect(() => {
    dispatch(fetchMealsRequest(today));
  }, [today]);

  function handleRefresh() {
    dispatch(fetchMealsRequest(today));
  }

  const calorieGoal = user?.dailyCalorieGoal ?? 2000;
  const proteinGoal = user?.dailyProteinGoal ?? 150;
  const carbsGoal = user?.dailyCarbsGoal ?? 200;
  const fatsGoal = user?.dailyFatsGoal ?? 65;
  const remaining = Math.max(0, calorieGoal - totals.calories);

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
          <View>
            <AppText variant="body" color={theme.textTertiary}>
              {displayDate}
            </AppText>
            <AppText variant="heading" color={theme.text}>
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </AppText>
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

        {/* Meals list */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.mealsSection}>
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
            <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyState}>
              <IconSymbol name="fork.knife" size={56} color={theme.textTertiary} style={styles.emptyIcon} />
              <AppText variant="subheading" color={theme.text} align="center">
                No meals logged yet
              </AppText>
              <AppText variant="body" color={theme.textTertiary} align="center">
                Tap the camera button to photograph your food and start tracking
              </AppText>
            </Animated.View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal: import('@/store/slices/meals.slice').Meal, index: number) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  index={index}
                  onPress={() => router.push(`/(app)/meal/${meal.id}`)}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: { marginBottom: Spacing.sm },
});
