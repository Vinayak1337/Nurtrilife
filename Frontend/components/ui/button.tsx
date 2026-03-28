import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppText } from './text';
import { Colors, Radius, Spacing, FontFamily, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  style,
  textStyle,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.lg },
    lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xxl, borderRadius: Radius.xl },
  };

  const textSizes = { sm: 13, md: 15, lg: 17 };

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.primary, text: '#FFFFFF' },
    secondary: { bg: theme.surface, text: theme.text, border: theme.border },
    ghost: { bg: 'transparent', text: theme.primary },
    danger: { bg: theme.accent, text: '#FFFFFF' },
    outline: { bg: 'transparent', text: theme.primary, border: theme.primary },
  };

  const vs = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={[
        styles.base,
        sizeStyles[size],
        { backgroundColor: vs.bg },
        vs.border && { borderWidth: 1.5, borderColor: vs.border },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && Shadow.primary,
        animatedStyle,
        style,
      ]}
      disabled={isDisabled}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <AppText
          style={[
            {
              fontFamily: FontFamily.semiBold,
              fontSize: textSizes[size],
              color: vs.text,
              textAlign: 'center',
            },
            textStyle,
          ]}
        >
          {children}
        </AppText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
