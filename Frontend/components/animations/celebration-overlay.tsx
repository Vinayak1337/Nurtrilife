import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, FontFamily } from '@/constants/theme';
import { BADGES, BadgeDefinition } from '@/constants/badges';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

function Confetti({ delay, color }: { delay: number; color: string }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * SCREEN_WIDTH);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(SCREEN_HEIGHT + 50, { duration: 2500 }));
    rotate.value = withDelay(delay, withTiming(360 * 3, { duration: 2500 }));
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 1000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

interface CelebrationOverlayProps {
  badgeId: string;
  onDismiss: () => void;
}

export function CelebrationOverlay({ badgeId, onDismiss }: CelebrationOverlayProps) {
  const badge = BADGES.find((b) => b.id === badgeId);

  // Hooks must always be called unconditionally (Rules of Hooks).
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!badge) return;
    scale.value = withSpring(1, { damping: 8, stiffness: 120 });
  }, [badge]);

  if (!badge) return null;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.overlay}>
      {/* Confetti */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Confetti
          key={i}
          delay={i * 80}
          color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
        />
      ))}

      {/* Badge card */}
      <Animated.View style={[styles.card, cardStyle]}>
        <AppText variant="label" color={Palette.secondary} style={styles.unlocked}>
          BADGE UNLOCKED!
        </AppText>

        <View style={[styles.badgeIcon, { backgroundColor: `${badge.color}18` }]}>
          <IconSymbol name={badge.icon} size={48} color={badge.color} />
        </View>

        <AppText variant="heading" color="#FFFFFF" style={styles.badgeName}>
          {badge.name}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.6)" style={styles.badgeDesc}>
          {badge.description}
        </AppText>

        <Button variant="primary" size="md" onPress={onDismiss} style={styles.button}>
          Awesome!
        </Button>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    alignItems: 'center',
    padding: Spacing.xxl,
    paddingHorizontal: Spacing.xxxl,
  },
  unlocked: {
    letterSpacing: 2,
    marginBottom: Spacing.xl,
  },
  badgeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  badgeName: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  badgeDesc: {
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  button: {
    minWidth: 160,
  },
});
