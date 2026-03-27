import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  
  Alert,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAppDispatch } from '@/store/hooks';
import { analyzeImageRequest, setCapturedImage } from '@/store/slices/analysis.slice';
import { useAppSelector } from '@/store/hooks';

export default function CameraScreen() {
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const isAnalyzing = useAppSelector((s: import('@/store').RootState) => s.analysis.isAnalyzing);

  const captureScale = useSharedValue(1);
  const captureAnim = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    captureScale.value = withSpring(0.85, { damping: 12 }, () => {
      captureScale.value = withSpring(1, { damping: 12 });
    });

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
        setCapturedUri(photo.uri);
        dispatch(setCapturedImage(photo.uri));
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, []);

  const handleGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to select images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setCapturedUri(uri);
      dispatch(setCapturedImage(uri));
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!capturedUri) return;
    dispatch(analyzeImageRequest(capturedUri));
  }, [capturedUri]);

  const handleRetake = useCallback(() => {
    setCapturedUri(null);
    dispatch(setCapturedImage(''));
  }, []);

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Palette.primary} size="large" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: '#0A0F1E' }]}>
        <AppText style={styles.permissionEmoji}>📷</AppText>
        <AppText variant="heading" color="#FFF" align="center" style={{ marginBottom: Spacing.sm }}>
          Camera Access Required
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.6)" align="center" style={styles.permissionDesc}>
          NutriLife needs camera access to photograph your food for AI nutrition analysis.
        </AppText>
        <View style={styles.permissionButtons}>
          <Button variant="primary" size="lg" onPress={requestPermission}>
            Allow Camera Access
          </Button>
          <Button variant="ghost" size="md" onPress={() => Linking.openSettings()}>
            Open Settings
          </Button>
          <Button variant="ghost" size="md" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  // Photo captured — show preview
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </Animated.View>

        {/* Dark overlay */}
        <View style={styles.previewOverlay} />

        {/* Top bar */}
        <SafeAreaView>
          <Pressable onPress={handleRetake} style={styles.backButton}>
            <IconSymbol name="xmark" size={22} color="#FFF" />
          </Pressable>
        </SafeAreaView>

        {/* Bottom actions */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.previewActions}>
          <AppText variant="heading" color="#FFF" align="center" style={{ marginBottom: Spacing.base }}>
            Looks good!
          </AppText>
          <AppText variant="body" color="rgba(255,255,255,0.7)" align="center" style={{ marginBottom: Spacing.xl }}>
            Our AI will analyze the nutritional content of your food
          </AppText>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isAnalyzing}
            onPress={handleAnalyze}
          >
            {isAnalyzing ? 'Analyzing...' : '✨ Analyze Nutrition'}
          </Button>
          <Button variant="ghost" size="md" onPress={handleRetake} style={{ marginTop: Spacing.sm }}>
            Retake Photo
          </Button>
        </Animated.View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* Top controls */}
      <SafeAreaView>
        <View style={styles.topControls}>
          <Pressable onPress={() => router.back()} style={styles.controlButton}>
            <IconSymbol name="xmark" size={22} color="#FFF" />
          </Pressable>

          <Pressable
            onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
            style={[styles.controlButton, flash === 'on' && styles.controlActive]}
          >
            <IconSymbol
              name={flash === 'on' ? 'bolt.fill' : 'bolt.slash.fill'}
              size={22}
              color="#FFF"
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Center guide */}
      <View style={styles.guide}>
        <View style={styles.guideCorner} />
        <View style={[styles.guideCorner, styles.guideCornerTR]} />
        <View style={[styles.guideCorner, styles.guideCornerBL]} />
        <View style={[styles.guideCorner, styles.guideCornerBR]} />
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <Pressable onPress={handleGallery} style={styles.controlButton}>
          <IconSymbol name="photo" size={26} color="#FFF" />
        </Pressable>

        <Animated.View style={captureAnim}>
          <Pressable onPress={handleCapture} style={styles.captureButton}>
            <View style={styles.captureInner} />
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={styles.controlButton}
        >
          <IconSymbol name="arrow.triangle.2.circlepath.camera" size={26} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginBottom: 88, // TAB_BAR_HEIGHT (68) + bottom offset (20) — keeps camera above tab bar
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.base,
  },
  permissionEmoji: {
    fontSize: 80,
    marginBottom: Spacing.base,
  },
  permissionDesc: {
    lineHeight: 26,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  permissionButtons: {
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.base,
    paddingTop: Spacing.sm,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlActive: {
    backgroundColor: Palette.secondary,
  },
  guide: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    bottom: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'rgba(255,255,255,0.7)',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
    borderTopLeftRadius: 6,
  },
  guideCornerTR: {
    top: 0,
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
    borderTopLeftRadius: 0,
  },
  guideCornerBL: {
    top: undefined,
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 0,
  },
  guideCornerBR: {
    top: undefined,
    bottom: 0,
    left: undefined,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 0,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    margin: Spacing.base,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
});
