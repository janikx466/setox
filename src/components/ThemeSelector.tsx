import React from 'react';
import { useTheme, themes } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ disabled, onDisabledClick }) => {
  const { currentTheme, setTheme } = useTheme();

  const handleClick = (themeName: string) => {
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    setTheme(themeName as any);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {themes.map((theme) => (
        <motion.button
          key={theme.name}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => handleClick(theme.name)}
          className={`relative p-4 rounded-xl border-2 transition-all ${
            currentTheme === theme.name
              ? 'border-primary shadow-lg'
              : 'border-border hover:border-primary/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex gap-1 mb-3 justify-center">
            {theme.colors.map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-center">{theme.label}</p>
          {currentTheme === theme.name && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="w-3 h-3" />
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
};
