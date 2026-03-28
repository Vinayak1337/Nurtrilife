// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'calendar': 'calendar-today',
  'person.fill': 'person',
  'paperplane.fill': 'send',

  // Camera & photo
  'camera.fill': 'camera-alt',
  'photo': 'photo-library',
  'arrow.triangle.2.circlepath.camera': 'flip-camera-ios',
  'bolt.fill': 'flash-on',
  'bolt.slash.fill': 'flash-off',

  // Actions
  'plus.circle.fill': 'add-circle',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'arrow.clockwise': 'refresh',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.down': 'expand-more',
  'chevron.up': 'expand-less',

  // Food / nutrition
  'fork.knife': 'restaurant',
  'flame.fill': 'local-fire-department',
  'heart.fill': 'favorite',
  'dumbbell.fill': 'fitness-center',
  'leaf.fill': 'eco',
  'drop.fill': 'water-drop',
  'chart.bar.fill': 'bar-chart',
  'sparkles': 'auto-awesome',

  // Time / meal type
  'sunrise.fill': 'wb-twilight',
  'sun.max.fill': 'wb-sunny',
  'moon.fill': 'bedtime',
  'clock.fill': 'schedule',

  // Stats
  'fork.knife.circle.fill': 'restaurant',

  // Misc
  'gear': 'settings',
  'trash.fill': 'delete',
  'info.circle': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'bell.fill': 'notifications',
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
