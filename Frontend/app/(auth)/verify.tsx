import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-expo';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
	Spacing,
	Palette,
	Radius,
	FontFamily,
	FontSize,
	Colors
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setClerkUser, restoreUser } from '@/store/slices/auth.slice';
import { setMeals } from '@/store/slices/meals.slice';
import { setEntries } from '@/store/slices/water.slice';
import { setBadges, setStreaks } from '@/store/slices/gamification.slice';
import {
	fetchUserFromServer,
	fetchMealsFromServer,
	fetchWaterFromServer,
	fetchBadgesFromServer
} from '@/services/sync.service';
import dayjs from 'dayjs';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
	const { flow, email } = useLocalSearchParams<{
		flow: 'sign-in' | 'sign-up';
		email: string;
	}>();
	const {
		signIn,
		setActive: setSignInActive,
		isLoaded: signInLoaded
	} = useSignIn();
	const {
		signUp,
		setActive: setSignUpActive,
		isLoaded: signUpLoaded
	} = useSignUp();
	const clerkLoaded = signInLoaded && signUpLoaded;
	const { isSignedIn } = useAuth();
	const dispatch = useAppDispatch();
	const isOnboarded = useAppSelector(s => s.auth.isOnboarded);

	const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(''));
	const [loading, setLoading] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [error, setError] = useState('');
	const [pendingNavigation, setPendingNavigation] = useState(false);

	// After Clerk confirms isSignedIn, sync data from server then navigate
	useEffect(() => {
		if (!isSignedIn || !pendingNavigation) return;

		if (flow === 'sign-up') {
			// New user — go to setup to create their profile
			router.replace('/(auth)/setup');
			return;
		}

		// Sign-in: fetch all user data from server before going to home
		async function syncAndNavigate() {
			setSyncing(true);
			try {
				const today = dayjs().format('YYYY-MM-DD');
				const thirtyDaysAgo = dayjs().subtract(29, 'day').format('YYYY-MM-DD');

				// GET /api/user now auto-creates with defaults if missing — never returns null
				const serverUser = await fetchUserFromServer();
				if (serverUser) {
					dispatch(restoreUser(serverUser));

					// Restore server streak immediately (before meal recomputation)
					if (serverUser.currentStreak || serverUser.longestStreak) {
						dispatch(
							setStreaks({
								current: serverUser.currentStreak ?? 0,
								longest: serverUser.longestStreak ?? 0
							})
						);
					}

					// Fetch last 30 days of meals + water so streak recomputation is accurate
					const [serverMeals, serverWater, serverBadges] = await Promise.all([
						fetchMealsFromServer(undefined, thirtyDaysAgo, today),
						fetchWaterFromServer(undefined, thirtyDaysAgo, today),
						fetchBadgesFromServer()
					]);
					if (serverMeals.length > 0) dispatch(setMeals(serverMeals));
					if (serverWater.length > 0) dispatch(setEntries(serverWater));
					if (serverBadges.length > 0) dispatch(setBadges(serverBadges));

					router.replace('/(app)/(tabs)/home');
				} else {
					// Fallback (shouldn't happen — findOrCreate always returns a user)
					router.replace('/(auth)/setup');
				}
			} catch {
				// Network error — fall back to whatever is in Redux
				router.replace(isOnboarded ? '/(app)/(tabs)/home' : '/(auth)/setup');
			} finally {
				setSyncing(false);
			}
		}

		syncAndNavigate();
	}, [isSignedIn, pendingNavigation, dispatch, isOnboarded]);
	const inputs = useRef<(TextInput | null)[]>([]);

	function handleChange(text: string, index: number) {
		if (error) setError(''); // Clear error as soon as user starts correcting
		const newCode = [...code];
		// Handle paste of full code
		if (text.length === CODE_LENGTH) {
			const chars = text
				.split('')
				.filter(c => /\d/.test(c))
				.slice(0, CODE_LENGTH);
			if (chars.length === CODE_LENGTH) {
				setCode(chars);
				setTimeout(() => inputs.current[CODE_LENGTH - 1]?.focus(), 0);
			}
			return;
		}
		newCode[index] = text.slice(-1);
		setCode(newCode);
		if (text && index < CODE_LENGTH - 1) {
			// Defer focus so React finishes the current render cycle before
			// moving the cursor — prevents autoFocus on a remounted sibling
			// from stealing it back on iOS.
			setTimeout(() => inputs.current[index + 1]?.focus(), 0);
		}
	}

	function handleKeyPress(key: string, index: number) {
		if (key === 'Backspace' && !code[index] && index > 0) {
			inputs.current[index - 1]?.focus();
			const newCode = [...code];
			newCode[index - 1] = '';
			setCode(newCode);
		}
	}

	async function handleVerify() {
		const fullCode = code.join('');
		if (fullCode.length !== CODE_LENGTH) return;
		if (!clerkLoaded) return;

		try {
			if (flow === 'sign-up' && signUp) {
				const result = await signUp.attemptEmailAddressVerification({
					code: fullCode
				});
				if (result.createdSessionId && setSignUpActive) {
					dispatch(
						setClerkUser({
							clerkUserId: result.createdUserId || '',
							email: email
						})
					);
					await setSignUpActive({ session: result.createdSessionId });
					setPendingNavigation(true);
				} else if (result.status === 'missing_requirements') {
					setError(
						'Account setup incomplete — check your Clerk dashboard configuration.'
					);
				}
			} else if (flow === 'sign-in' && signIn) {
				const result = await signIn.attemptFirstFactor({
					strategy: 'email_code',
					code: fullCode
				});
				if (result.status === 'complete' && setSignInActive) {
					await setSignInActive({ session: result.createdSessionId });

					setPendingNavigation(true);
				}
			}
		} catch (err: any) {
			const msg =
				err?.errors?.[0]?.longMessage ||
				err?.message ||
				'Invalid verification code';
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	const isComplete = code.every(c => c !== '');

	return (
		<LinearGradient colors={['#0A0F1E', '#111827']} style={styles.container}>
			<SafeAreaView style={styles.safe}>
				<KeyboardAvoidingView
					style={styles.inner}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
					{/* Back button */}
					<Pressable onPress={() => router.back()} style={styles.backBtn}>
						<IconSymbol
							name='chevron.left'
							size={20}
							color='rgba(255,255,255,0.6)'
						/>
					</Pressable>

					<Animated.View
						entering={FadeInDown.delay(100).duration(500)}
						style={styles.header}>
						<View style={styles.iconWrap}>
							<IconSymbol
								name='checkmark.circle.fill'
								size={32}
								color={Palette.primary}
							/>
						</View>
						<AppText variant='heading' color='#FFFFFF'>
							Verify Email
						</AppText>
						<AppText
							variant='body'
							color='rgba(255,255,255,0.5)'
							style={{ textAlign: 'center' }}>
							Enter the 6-digit code sent to{'\n'}
							<AppText variant='body' color={Palette.primary}>
								{email}
							</AppText>
						</AppText>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(200).duration(500)}
						style={styles.codeRow}>
						{code.map((digit, i) => (
							<TextInput
								key={`code-input` + i}
								ref={ref => {
									inputs.current[i] = ref;
								}}
								style={[
									styles.codeInput,
									digit ? styles.codeInputFilled : null,
									error ? styles.codeInputError : null
								]}
								value={digit}
								onChangeText={text => handleChange(text, i)}
								onKeyPress={({ nativeEvent }) =>
									handleKeyPress(nativeEvent.key, i)
								}
								keyboardType='number-pad'
								maxLength={i === 0 ? CODE_LENGTH : 1}
								autoFocus={i === 0}
								selectTextOnFocus
							/>
						))}
					</Animated.View>

					{error ? (
						<Animated.View entering={FadeInDown.duration(300)}>
							<AppText
								variant='bodySmall'
								color={Colors.light.accent}
								style={styles.error}>
								{error}
							</AppText>
						</Animated.View>
					) : null}

					<Animated.View
						entering={FadeInDown.delay(300).duration(500)}
						style={styles.actions}>
						<Button
							variant='primary'
							size='lg'
							fullWidth
							loading={loading || syncing || !clerkLoaded}
							onPress={handleVerify}
							disabled={!isComplete || !clerkLoaded || syncing}>
							{syncing ? 'Loading your data...' : 'Verify & Continue'}
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
		justifyContent: 'center'
	},
	backBtn: {
		position: 'absolute',
		top: Spacing.xl,
		left: 0,
		padding: Spacing.md
	},
	header: {
		alignItems: 'center',
		gap: Spacing.sm,
		marginBottom: Spacing.xxxl
	},
	iconWrap: {
		width: 64,
		height: 64,
		borderRadius: Radius.xl,
		backgroundColor: Palette.primary + '18',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: Spacing.sm
	},
	codeRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: Spacing.sm,
		marginBottom: Spacing.lg
	},
	codeInput: {
		width: 48,
		height: 56,
		borderRadius: Radius.lg,
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.15)',
		backgroundColor: 'rgba(255,255,255,0.06)',
		color: '#FFFFFF',
		fontFamily: FontFamily.semiBold,
		fontSize: FontSize.xxl,
		textAlign: 'center'
	},
	codeInputFilled: {
		borderColor: Palette.primary,
		backgroundColor: Palette.primary + '12'
	},
	codeInputError: {
		borderColor: Colors.light.accent
	},
	error: {
		textAlign: 'center',
		marginBottom: Spacing.lg
	},
	actions: {
		marginTop: Spacing.md
	}
});
