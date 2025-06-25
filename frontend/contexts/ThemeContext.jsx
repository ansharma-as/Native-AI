// contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export const lightTheme = {
  primary: '#6366F1', // Indigo 500
  primaryDark: '#4F46E5', // Indigo 600
  primaryLight: '#A5B4FC', // Indigo 300
  secondary: '#F97316', // Orange 500
  background: '#F9FAFB', // Gray 50
  card: '#FFFFFF', 
  surface: '#F3F4F6', // Gray 100
  text: '#1F2937', // Gray 800
  textSecondary: '#6B7280', // Gray 500
  border: '#E5E7EB', // Gray 200
  error: '#EF4444', // Red 500
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6', // Blue 500
  elevation: {
    0: 'transparent',
    1: '#FFFFFF',
    2: '#FFFFFF',
    3: '#FFFFFF',
  },
  shadowColor: '#000000',
};

export const darkTheme = {
  primary: '#818CF8', // Indigo 400
  primaryDark: '#6366F1', // Indigo 500
  primaryLight: '#A5B4FC', // Indigo 300
  secondary: '#FB923C', // Orange 400
  background: '#111827', // Gray 900
  card: '#1F2937', // Gray 800 
  surface: '#374151', // Gray 700
  text: '#F9FAFB', // Gray 50
  textSecondary: '#9CA3AF', // Gray 400
  border: '#4B5563', // Gray 600
  error: '#F87171', // Red 400
  success: '#34D399', // Emerald 400
  warning: '#FBBF24', // Amber 400
  info: '#60A5FA', // Blue 400
  elevation: {
    0: 'transparent',
    1: '#1F2937', // Gray 800
    2: '#374151', // Gray 700
    3: '#4B5563', // Gray 600
  },
  shadowColor: '#000000',
};

export const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  
  // Update theme based on system changes
  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);
  
  const theme = isDark ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};