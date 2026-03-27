import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { CALORIE_PRESETS, MACRO_PRESETS } from '@/constants/nutrition';
import { useAppDispatch } from '@/store/hooks';
import { completeOnboarding, createDefaultUser } from '@/store/slices/auth.slice';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

type MacroPresetKey = keyof typeof MACRO_PRESETS;

const STEP_LABELS = ['Your Name', 'Calorie Goal', 'Macro Split'];

export default function SetupScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [customCalories, setCustomCalories] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<MacroPresetKey>('balanced');

  function handleNext() {
    if (step === 0) {
      if (!name.trim() || name.trim().length < 2) {
        setNameError('Please enter your name (at least 2 characters)');
        return;
      }
      setNameError('');
      setStep(1);
    } else if (step === 1) {
      const custom = parseInt(customCalories, 10);
      if (customCalories && (isNaN(custom) || custom < 1000 || custom > 5000)) {
        return;
      }
      if (customCalories && !isNaN(custom)) {
        setCalorieGoal(custom);
      }
      setStep(2);
    } else {
      handleComplete();
    }
  }

  function handleComplete() {
    const preset = MACRO_PRESETS[selectedPreset];
    const user = createDefaultUser(
      name.trim(),
      calorieGoal,
      preset.protein,
      preset.carbs,
      preset.fats
    );
    dispatch(completeOnboarding(user));
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <LinearGradient
      colors={['#0A0F1E', '#111827']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.stepIndicator}>
              {STEP_LABELS.map((label, i) => (
                <View key={i} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: i <= step ? Palette.primary : 'rgba(255,255,255,0.15)',
                        borderColor: i === step ? Palette.primary : 'transparent',
                        borderWidth: i === step ? 2 : 0,
                      },
                    ]}
                  />
                  {i < STEP_LABELS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: i < step ? Palette.primary : 'rgba(255,255,255,0.1)' },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <AppText variant="caption" color="rgba(255,255,255,0.5)" align="center">
              Step {step + 1} of {STEP_LABELS.length}
            </AppText>
            <AppText variant="heading" color="#FFFFFF" align="center" style={{ marginTop: 4 }}>
              {STEP_LABELS[step]}
            </AppText>
          </Animated.View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 0 && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
                <AppText variant="body" color="rgba(255,255,255,0.6)" align="center" style={styles.stepDesc}>
                  What should we call you?
                </AppText>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={(t) => { setName(t); setNameError(''); }}
                  error={nameError}
                  autoFocus
                  autoCapitalize="words"
                  style={{ color: '#FFF' }}
                  containerStyle={styles.input}
                />
              </Animated.View>
            )}

            {step === 1 && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
                <AppText variant="body" color="rgba(255,255,255,0.6)" align="center" style={styles.stepDesc}>
                  Choose your daily calorie goal
                </AppText>

                <View style={styles.presetGrid}>
                  {CALORIE_PRESETS.map((cal) => (
                    <Pressable
                      key={cal}
                      onPress={() => { setCalorieGoal(cal); setCustomCalories(''); }}
                      style={[
                        styles.calPreset,
                        {
                          backgroundColor: calorieGoal === cal && !customCalories
                            ? Palette.primary
                            : 'rgba(255,255,255,0.08)',
                          borderColor: calorieGoal === cal && !customCalories
                            ? Palette.primary
                            : 'rgba(255,255,255,0.12)',
                        },
                      ]}
                    >
                      <AppText
                        variant="heading"
                        color={calorieGoal === cal && !customCalories ? '#FFF' : 'rgba(255,255,255,0.8)'}
                        align="center"
                      >
                        {cal}
                      </AppText>
                      <AppText
                        variant="caption"
                        color={calorieGoal === cal && !customCalories ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'}
                        align="center"
                      >
                        kcal/day
                      </AppText>
                    </Pressable>
                  ))}
                </View>

                <AppText variant="label" color="rgba(255,255,255,0.4)" align="center" style={{ marginVertical: Spacing.base }}>
                  or enter a custom goal
                </AppText>
                <Input
                  placeholder="e.g. 1750"
                  value={customCalories}
                  onChangeText={(t) => { setCustomCalories(t); if (t) setCalorieGoal(parseInt(t) || 2000); }}
                  keyboardType="numeric"
                  hint="Between 1000 and 5000 kcal"
                  style={{ color: '#FFF' }}
                />
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
                <AppText variant="body" color="rgba(255,255,255,0.6)" align="center" style={styles.stepDesc}>
                  Select a macro split that matches your goals
                </AppText>

                <View style={styles.presetList}>
                  {(Object.keys(MACRO_PRESETS) as MacroPresetKey[]).map((key) => {
                    const preset = MACRO_PRESETS[key];
                    const isSelected = selectedPreset === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setSelectedPreset(key)}
                        style={[
                          styles.macroPreset,
                          {
                            backgroundColor: isSelected ? `${Palette.primary}18` : 'rgba(255,255,255,0.05)',
                            borderColor: isSelected ? Palette.primary : 'rgba(255,255,255,0.1)',
                          },
                        ]}
                      >
                        <View style={styles.macroPresetTop}>
                          <AppText variant="subheading" color={isSelected ? Palette.primary : '#FFF'}>
                            {preset.label}
                          </AppText>
                          {isSelected && (
                            <View style={[styles.checkBadge, { backgroundColor: Palette.primary }]}>
                              <AppText variant="caption" color="#FFF">✓</AppText>
                            </View>
                          )}
                        </View>
                        <AppText variant="bodySmall" color="rgba(255,255,255,0.5)" style={{ marginBottom: Spacing.sm }}>
                          {preset.description}
                        </AppText>
                        <View style={styles.macroChips}>
                          <MacroChip label="P" value={preset.protein} color={Palette.protein} />
                          <MacroChip label="C" value={preset.carbs} color={Palette.carbs} />
                          <MacroChip label="F" value={preset.fats} color={Palette.fats} />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Footer */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.footer}>
            {step > 0 && (
              <Button variant="ghost" size="md" onPress={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onPress={handleNext}
              style={styles.nextButton}
            >
              {step === STEP_LABELS.length - 1 ? '✓ Complete Setup' : 'Continue'}
            </Button>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}20` }]}>
      <AppText variant="labelSmall" color={color}>{label}: {value}g</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  stepContent: { gap: Spacing.base },
  stepDesc: { marginBottom: Spacing.sm },
  input: { marginTop: Spacing.sm },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  calPreset: {
    width: 100,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  presetList: { gap: Spacing.md },
  macroPreset: {
    padding: Spacing.base,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
  macroPresetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  nextButton: { flex: 1 },
});
