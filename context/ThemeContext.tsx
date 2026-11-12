import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeColors } from '../constants/colors';

type ThemeMode = 'dark' | 'light';
type UnitSystem = 'sqft' | 'sqm';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  unitSystem: UnitSystem;
  toggleTheme: () => void;
  setUnitSystem: (unit: UnitSystem) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: Colors as any,
  unitSystem: 'sqft',
  toggleTheme: () => {},
  setUnitSystem: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('sqft');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      const savedUnit = await AsyncStorage.getItem('unit_system');
      if (savedTheme === 'light' || savedTheme === 'dark') setMode(savedTheme);
      if (savedUnit === 'sqft' || savedUnit === 'sqm') setUnitSystemState(savedUnit);
    } catch (e) {
      // Use defaults
    }
  };

  const toggleTheme = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    await AsyncStorage.setItem('theme_mode', next);
  };

  const setUnitSystem = async (unit: UnitSystem) => {
    setUnitSystemState(unit);
    await AsyncStorage.setItem('unit_system', unit);
  };

  const colors = Colors as any;

  return (
    <ThemeContext.Provider value={{ mode, colors, unitSystem, toggleTheme, setUnitSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
