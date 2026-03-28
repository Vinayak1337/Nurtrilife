import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { MealCard } from '@/components/ui/meal-card';
import { Colors, Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/use-auth';
import { useAppSelector } from '@/store/hooks';
import { Meal } from '@/store/slices/meals.slice';
import { router } from 'expo-router';

interface DayMeals {
  [date: string]: Meal[];
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = useUser();
  const allMeals = useAppSelector((s) => s.meals.meals);

  const today = dayjs().format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));

  // Group meals for the current month from Redux state
  const monthMeals = useMemo<DayMeals>(() => {
    const start = dayjs(currentMonth + '-01').startOf('month').format('YYYY-MM-DD');
    const end = dayjs(currentMonth + '-01').endOf('month').format('YYYY-MM-DD');
    const grouped: DayMeals = {};
    allMeals
      .filter((m) => m.date >= start && m.date <= end)
      .forEach((meal) => {
        if (!grouped[meal.date]) grouped[meal.date] = [];
        grouped[meal.date].push(meal);
      });
    return grouped;
  }, [allMeals, currentMonth]);

  // Meals for the selected day
  const selectedDayMeals = useMemo(
    () => allMeals.filter((m) => m.date === selectedDate),
    [allMeals, selectedDate],
  );

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const goal = user?.dailyCalorieGoal ?? 2000;

    Object.entries(monthMeals).forEach(([date, meals]) => {
      const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
      const ratio = totalCals / goal;

      let dotColor = Palette.primary;
      if (ratio >= 0.9 && ratio <= 1.1) dotColor = Palette.secondary;
      else if (ratio > 1.1) dotColor = Palette.accent;

      marks[date] = {
        marked: true,
        dotColor,
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? `${Palette.primary}30` : undefined,
        selectedTextColor: date === selectedDate ? Palette.primary : undefined,
      };
    });

    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: `${Palette.primary}20`,
        selectedTextColor: Palette.primary,
      };
    }

    // Highlight today
    if (!marks[today]) {
      marks[today] = { marked: false };
    }

    return marks;
  }, [monthMeals, selectedDate, user?.dailyCalorieGoal]);

  const selectedDayTotal = selectedDayMeals.reduce((sum, m) => sum + m.calories, 0);
  const displayDate = dayjs(selectedDate).format('MMMM D, YYYY');
  const isToday = selectedDate === today;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
          <AppText variant="heading" color={theme.text}>Food Journal</AppText>
          <AppText variant="body" color={theme.textTertiary}>
            Your meal history & nutrition log
          </AppText>
        </Animated.View>

        {/* Legend */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.legend}>
          {[
            { color: Palette.primary, label: 'Under goal' },
            { color: Palette.secondary, label: 'At goal' },
            { color: Palette.accent, label: 'Over goal' },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <AppText variant="caption" color={theme.textTertiary}>{label}</AppText>
            </View>
          ))}
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Card padding={0} style={{ overflow: 'hidden' }}>
            <Calendar
              current={today}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              onMonthChange={(month) => setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`)}
              markedDates={markedDates}
              markingType="dot"
              theme={{
                calendarBackground: theme.surface,
                textSectionTitleColor: theme.textTertiary,
                dayTextColor: theme.text,
                todayTextColor: Palette.primary,
                selectedDayTextColor: Palette.primary,
                selectedDayBackgroundColor: `${Palette.primary}20`,
                arrowColor: Palette.primary,
                monthTextColor: theme.text,
                textDayFontFamily: 'SpaceGrotesk_500Medium',
                textMonthFontFamily: 'SpaceGrotesk_700Bold',
                textDayHeaderFontFamily: 'SpaceGrotesk_600SemiBold',
                textDayFontSize: 14,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12,
                dotColor: Palette.primary,
                selectedDotColor: Palette.primary,
              }}
            />
          </Card>
        </Animated.View>

        {/* Selected day summary */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <View style={styles.daySummaryHeader}>
            <AppText variant="subheading" color={theme.text}>
              {isToday ? 'Today' : displayDate}
            </AppText>
          </View>

          {selectedDayMeals.length > 0 && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <AppText variant="heading" color={Palette.secondary} align="center">
                    {Math.round(selectedDayTotal)}
                  </AppText>
                  <AppText variant="caption" color={theme.textTertiary} align="center">
                    kcal consumed
                  </AppText>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                <View style={styles.summaryItem}>
                  <AppText variant="heading" color={theme.text} align="center">
                    {selectedDayMeals.length}
                  </AppText>
                  <AppText variant="caption" color={theme.textTertiary} align="center">
                    {selectedDayMeals.length === 1 ? 'meal' : 'meals'} logged
                  </AppText>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                <View style={styles.summaryItem}>
                  <AppText
                    variant="heading"
                    color={selectedDayTotal > (user?.dailyCalorieGoal ?? 2000) ? Palette.accent : Palette.primary}
                    align="center"
                  >
                    {Math.max(0, Math.round((user?.dailyCalorieGoal ?? 2000) - selectedDayTotal))}
                  </AppText>
                  <AppText variant="caption" color={theme.textTertiary} align="center">
                    kcal remaining
                  </AppText>
                </View>
              </View>
            </Card>
          )}

          {selectedDayMeals.length === 0 ? (
            <View style={styles.emptyDay}>
              <AppText style={{ fontSize: 40 }} align="center">🗓️</AppText>
              <AppText variant="body" color={theme.textTertiary} align="center">
                {isToday
                  ? 'No meals logged today yet. Tap the camera to get started!'
                  : 'No meals were logged on this day.'}
              </AppText>
            </View>
          ) : (
            selectedDayMeals.map((meal, index) => (
              <MealCard
                key={meal.id}
                meal={meal}
                index={index}
                onPress={() => router.push(`/(app)/meal/${meal.id}`)}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  header: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
    gap: 4,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.base,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  daySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    marginBottom: Spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
});
