import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Path,
  Line,
  Rect,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spacing, Palette, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
//  SVG Illustrations
// ─────────────────────────────────────────────────────────────

function ScanIllustration({ color }: { color: string }) {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="110" cy="110" r="100" fill="url(#glow1)" />
      <Circle cx="110" cy="110" r="95" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 8" opacity="0.35" />
      <Circle cx="110" cy="110" r="72" fill="none" stroke={color} strokeWidth="1.5" opacity="0.55" />
      <Circle cx="110" cy="110" r="52" fill={color + '18'} stroke={color} strokeWidth="2" />
      {/* Scanner corner brackets */}
      <Path d="M28,62 L28,28 L62,28" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M158,28 L192,28 L192,62" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M28,158 L28,192 L62,192" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M158,192 L192,192 L192,158" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Fork */}
      <Line x1="97" y1="80" x2="97" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <Line x1="92" y1="80" x2="92" y2="93" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="102" y1="80" x2="102" y2="93" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M92,93 Q97,102 102,93" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Knife */}
      <Line x1="123" y1="80" x2="123" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <Path d="M123,80 Q131,90 123,104" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function ChartIllustration({ color }: { color: string }) {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="110" cy="110" r="100" fill="url(#glow2)" />
      {/* Grid lines */}
      <Line x1="35" y1="55" x2="185" y2="55" stroke="white" strokeWidth="0.5" opacity="0.15" />
      <Line x1="35" y1="85" x2="185" y2="85" stroke="white" strokeWidth="0.5" opacity="0.15" />
      <Line x1="35" y1="115" x2="185" y2="115" stroke="white" strokeWidth="0.5" opacity="0.15" />
      <Line x1="35" y1="145" x2="185" y2="145" stroke="white" strokeWidth="0.5" opacity="0.15" />
      {/* Bars */}
      <Rect x="42" y="115" width="26" height="45" rx="5" fill={color} opacity="0.4" />
      <Rect x="81" y="92" width="26" height="68" rx="5" fill={color} opacity="0.6" />
      <Rect x="120" y="68" width="26" height="92" rx="5" fill={color} opacity="0.82" />
      <Rect x="159" y="50" width="26" height="110" rx="5" fill={color} />
      {/* Trend line */}
      <Path d="M55,138 L94,112 L133,84 L172,66" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="55" cy="138" r="4.5" fill="white" />
      <Circle cx="94" cy="112" r="4.5" fill="white" />
      <Circle cx="133" cy="84" r="4.5" fill="white" />
      <Circle cx="172" cy="66" r="4.5" fill="white" />
      {/* X-axis */}
      <Line x1="35" y1="160" x2="185" y2="160" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </Svg>
  );
}

function TargetIllustration({ color }: { color: string }) {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow3" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="110" cy="110" r="100" fill="url(#glow3)" />
      {/* Target rings */}
      <Circle cx="110" cy="110" r="88" fill="none" stroke={color} strokeWidth="1.5" opacity="0.22" />
      <Circle cx="110" cy="110" r="68" fill="none" stroke={color} strokeWidth="1.5" opacity="0.42" />
      <Circle cx="110" cy="110" r="48" fill={color + '18'} stroke={color} strokeWidth="2" opacity="0.65" />
      <Circle cx="110" cy="110" r="28" fill={color + '28'} stroke={color} strokeWidth="2.5" />
      <Circle cx="110" cy="110" r="10" fill={color} />
      {/* Crosshair lines */}
      <Line x1="110" y1="14" x2="110" y2="50" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <Line x1="110" y1="170" x2="110" y2="206" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <Line x1="14" y1="110" x2="50" y2="110" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <Line x1="170" y1="110" x2="206" y2="110" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      {/* Checkmark */}
      <Path d="M96,110 L106,120 L126,96" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  Slide data
// ─────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    Illustration: ScanIllustration,
    title: 'Track Every Bite',
    subtitle: 'Point your camera at any food and our AI instantly identifies it and calculates the exact nutritional content.',
    colors: ['#061220', '#0D1B2A', '#0E2D3D'] as [string, string, string],
    accent: Palette.primary,
  },
  {
    id: '2',
    Illustration: ChartIllustration,
    title: 'See Your Progress',
    subtitle: 'Beautiful charts and a calendar view help you understand your eating patterns and stay on track with your goals.',
    colors: ['#0A0618', '#130B2C', '#1C1050'] as [string, string, string],
    accent: '#8B5CF6',
  },
  {
    id: '3',
    Illustration: TargetIllustration,
    title: 'Reach Your Goals',
    subtitle: 'Set personalized calorie and macro targets. NutriLife gives you the insights to achieve the health you want.',
    colors: ['#160E02', '#201504', '#2C1E06'] as [string, string, string],
    accent: Palette.secondary,
  },
] as const;

// ─────────────────────────────────────────────────────────────
//  Screen
// ─────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== undefined && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push('/(auth)/sign-up');
    }
  }

  const slide = SLIDES[currentIndex];

  return (
    <LinearGradient colors={slide.colors} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={({ item }) => <Slide slide={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={viewableItemsChanged.current}
          viewabilityConfig={viewConfig.current}
          onScroll={(e) => { scrollX.value = e.nativeEvent.contentOffset.x; }}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        <View style={styles.controls}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <DotIndicator
                key={s.id}
                index={i}
                currentIndex={currentIndex}
                color={slide.accent}
                scrollX={scrollX}
              />
            ))}
          </View>
          <View style={styles.buttons}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleNext}
              style={{ backgroundColor: slide.accent }}
            >
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Button>
            {currentIndex < SLIDES.length - 1 ? (
              <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.skipBtn}>
                <AppText variant="body" color="rgba(255,255,255,0.4)">Skip</AppText>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push('/(auth)/sign-in')} style={styles.skipBtn}>
                <AppText variant="body" color="rgba(255,255,255,0.5)">
                  Already have an account? <AppText variant="body" color={Palette.primary}>Sign In</AppText>
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
//  Slide
// ─────────────────────────────────────────────────────────────

function Slide({ slide }: { slide: typeof SLIDES[number] }) {
  const { Illustration, accent, title, subtitle } = slide;
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.illustrationWrap}>
        <Illustration color={accent} />
      </View>
      <View style={styles.textBlock}>
        <View style={[styles.pill, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
          <View style={[styles.pillDot, { backgroundColor: accent }]} />
          <AppText variant="label" color={accent} style={{ letterSpacing: 1.5 }}>
            NUTRILENS
          </AppText>
        </View>
        <AppText variant="title" color="#FFFFFF" align="center" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.58)" align="center" style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  Dot indicator
// ─────────────────────────────────────────────────────────────

function DotIndicator({
  index,
  currentIndex,
  color,
  scrollX,
}: {
  index: number;
  currentIndex: number;
  color: string;
  scrollX: SharedValue<number>;
}) {
  const isActive = index === currentIndex;
  const animStyle = useAnimatedStyle(() => {
    const position = scrollX.value / SCREEN_WIDTH;
    const inputRange = [index - 1, index, index + 1];
    const width = interpolate(position, inputRange, [6, 22, 6], 'clamp');
    const opacity = interpolate(position, inputRange, [0.32, 1, 0.32], 'clamp');
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: isActive ? color : 'rgba(255,255,255,0.32)' },
        animStyle,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flatList: { flex: 1 },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  title: { marginBottom: 2 },
  subtitle: { lineHeight: 26 },

  controls: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: { height: 6, borderRadius: Radius.full },
  buttons: { gap: Spacing.sm, alignItems: 'center' },
  skipBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});
