/**
 * ThemeContext — Dark mode support.
 *
 * Provides mode ('light' | 'dark' | 'system'), detects system preference,
 * and persists user choice to AsyncStorage. Ready for screens to adopt.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeCtx = createContext<ThemeContextValue>({
  mode: 'system',
  isDark: false,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light'
  );

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Restore saved preference
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      } catch (e) {
        // Default to system
      }
    })();
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('[ThemeContext] Failed to persist theme preference:', e);
    }
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return (
    <ThemeCtx.Provider value={{ mode, isDark, setMode }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
