import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { FontFamily, FontSize, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TextVariant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'bodySmall' | 'caption' | 'label' | 'labelSmall';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

const variantStyles: Record<TextVariant, { fontSize: number; fontFamily: string; lineHeight?: number }> = {
  display: { fontSize: FontSize.display, fontFamily: FontFamily.bold, lineHeight: 50 },
  title: { fontSize: FontSize.xxxl, fontFamily: FontFamily.bold, lineHeight: 42 },
  heading: { fontSize: FontSize.xxl, fontFamily: FontFamily.bold, lineHeight: 34 },
  subheading: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold, lineHeight: 30 },
  body: { fontSize: FontSize.base, fontFamily: FontFamily.regular, lineHeight: 24 },
  bodySmall: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, lineHeight: 20 },
  caption: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, lineHeight: 16 },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, lineHeight: 20 },
  labelSmall: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, lineHeight: 16 },
};

export function AppText({
  variant = 'body',
  color,
  align,
  weight,
  style,
  ...props
}: AppTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const variantStyle = variantStyles[variant];
  const fontFamily = weight ? FontFamily[weight] : variantStyle.fontFamily;

  return (
    <Text
      style={[
        variantStyle,
        { fontFamily, color: color ?? theme.text },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
}

export default AppText;
