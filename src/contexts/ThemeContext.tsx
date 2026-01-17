import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeName = 
  | 'default' 
  | 'ocean' 
  | 'sunset' 
  | 'forest' 
  | 'royal' 
  | 'cherry' 
  | 'gold' 
  | 'midnight' 
  | 'neon' 
  | 'rose' 
  | 'ember';

interface Theme {
  name: ThemeName;
  label: string;
  colors: string[];
}

export const themes: Theme[] = [
  { name: 'default', label: 'Indigo', colors: ['#6366f1', '#8b5cf6', '#a855f7'] },
  { name: 'ocean', label: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#14b8a6'] },
  { name: 'sunset', label: 'Sunset', colors: ['#f97316', '#ef4444', '#ec4899'] },
  { name: 'forest', label: 'Forest', colors: ['#22c55e', '#10b981', '#059669'] },
  { name: 'royal', label: 'Royal', colors: ['#8b5cf6', '#a855f7', '#d946ef'] },
  { name: 'cherry', label: 'Cherry', colors: ['#f43f5e', '#ec4899', '#db2777'] },
  { name: 'gold', label: 'Gold', colors: ['#eab308', '#f59e0b', '#d97706'] },
  { name: 'midnight', label: 'Midnight', colors: ['#3b82f6', '#6366f1', '#8b5cf6'] },
  { name: 'neon', label: 'Neon', colors: ['#10b981', '#06b6d4', '#a855f7'] },
  { name: 'rose', label: 'Rose', colors: ['#f43f5e', '#fb7185', '#f472b6'] },
  { name: 'ember', label: 'Ember', colors: ['#f97316', '#ea580c', '#dc2626'] },
];

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeName) || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => {
      if (t.name !== 'default') {
        root.classList.remove(`theme-${t.name}`);
      }
    });
    
    // Add current theme class
    if (currentTheme !== 'default') {
      root.classList.add(`theme-${currentTheme}`);
    }
    
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
