import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Returns the current color scheme, defaulting to 'light'.
 * Narrows the return type from ColorSchemeName (includes null) to 'light' | 'dark'
 * so it can safely index theme objects like Colors[colorScheme].
 */
export function useColorScheme(): 'light' | 'dark' {
  const scheme = useRNColorScheme();
  if (scheme === 'dark') return 'dark';
  return 'light';
}
