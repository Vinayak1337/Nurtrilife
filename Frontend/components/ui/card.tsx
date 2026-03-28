import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: number | false;
  style?: StyleProp<ViewStyle>;
}

export function Card({ elevated = true, padding, style, children, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const paddingValue = padding === false ? 0 : padding ?? Spacing.base;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, padding: paddingValue },
        elevated && Shadow.md,
        elevated && { shadowColor: colorScheme === 'dark' ? '#000' : '#94A3B8' },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
});

export default Card;
