import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { themes, type ThemeKey, applyTheme } from '../lib/themes';
import useStore from '../lib/state';

export default function ThemeSwitcher() {
  const { settings, updateSettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeKey: ThemeKey) => {
    updateSettings({ theme: themeKey });
    applyTheme(themeKey);
    setIsOpen(false);
  };

  const currentTheme = themes[settings.theme];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="btn btn-secondary">
          <Palette size={16} />
          <span className="font-medium">{currentTheme.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 p-4 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        align="start"
      >
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key as ThemeKey)}
              className="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left backdrop-blur-sm hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: theme.surface,
                borderColor: settings.theme === key ? theme.accent : 'rgba(255, 255, 255, 0.1)',
                color: theme.text,
                fontFamily: theme.font,
              }}
            >
              {settings.theme === key && (
                <Check 
                  size={16} 
                  className="absolute top-2 right-2" 
                  style={{ color: theme.accent }} 
                />
              )}
              <div className="text-sm font-semibold mb-1">{theme.name}</div>
              <div className="flex gap-1 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: theme.primary }} 
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: theme.accent }} 
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: theme.background }} 
                />
              </div>
              <div className="text-xs opacity-75 truncate">
                {theme.font.split(',')[0].replace(/"/g, '')}
              </div>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}