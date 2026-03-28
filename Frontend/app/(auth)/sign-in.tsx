import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SignInScreen() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!isLoaded || !email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({ identifier: email.trim() });
      const emailFactor = result.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code',
      );

      if (emailFactor && 'emailAddressId' in emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailFactor.emailAddressId,
        });
        router.push({ pathname: '/(auth)/verify', params: { flow: 'sign-in', email: email.trim() } });
      } else {
        setError('Email sign-in is not available for this account');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0A0F1E', '#111827']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <View style={styles.iconWrap}>
              <IconSymbol name="fork.knife" size={32} color={Palette.primary} />
            </View>
            <AppText variant="heading" color="#FFFFFF">
              Welcome Back
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.5)">
              Sign in with your email to continue
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={error || undefined}
              containerStyle={styles.inputWrap}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleSignIn}
              disabled={!email.trim()}
            >
              Send Sign-In Code
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
            <AppText variant="bodySmall" color="rgba(255,255,255,0.4)">
              Don't have an account?{' '}
            </AppText>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.replace('/(auth)/sign-up')}
              textStyle={{ color: Palette.primary }}
            >
              Sign Up
            </Button>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Palette.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
  inputWrap: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
});
