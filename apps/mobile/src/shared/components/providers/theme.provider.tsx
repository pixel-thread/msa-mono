import React, { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';
import { useThemeStore } from '../../store/theme.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useThemeStore((state) => state.themePreference);
  const systemTheme = useRNColorScheme();
  const { setColorScheme } = useTailwindColorScheme();

  useEffect(() => {
    let activeTheme: 'light' | 'dark' = 'light'; // Fallback

    if (themePreference === 'system') {
      activeTheme = systemTheme === 'dark' ? 'dark' : 'light';
    } else {
      activeTheme = themePreference;
    }

    // setColorScheme(activeTheme);
  }, [themePreference, systemTheme, setColorScheme]);

  return <>{children}</>;
};
