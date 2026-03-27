import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { AppText } from './text';
import { Colors, Radius, Spacing, FontFamily, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.accent
    : focused
    ? theme.borderFocused
    : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText
          variant="label"
          color={theme.textSecondary}
          style={styles.label}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor,
            borderWidth: focused || error ? 1.5 : 1,
          },
        ]}
      >
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              fontFamily: FontFamily.regular,
              fontSize: FontSize.base,
            },
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>
      {(error || hint) && (
        <AppText
          variant="caption"
          color={error ? theme.accent : theme.textTertiary}
          style={styles.helperText}
        >
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.base,
  },
  prefix: {
    marginRight: Spacing.sm,
  },
  suffix: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  helperText: {
    marginTop: 2,
  },
});

export default Input;
