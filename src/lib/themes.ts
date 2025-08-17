export type ThemeKey = 'ironMan' | 'hulk' | 'captainAmerica' | 'spiderMan' | 'blackPanther' | 'doctorStrange' | 'thor';

export interface ThemeTokens {
  name: string;
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  font: string;
  pattern: string;
}

export const themes: Record<ThemeKey, ThemeTokens> = {
  ironMan: {
    name: 'Iron Man',
    primary: '#D32F2F',
    background: '#0A0E13',
    surface: '#1A1F26',
    text: '#EEF2F6',
    accent: '#FFC107',
    font: '"Orbitron", system-ui, sans-serif',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(211, 47, 47, 0.1) 0%, transparent 50%)'
  },
  hulk: {
    name: 'Hulk',
    primary: '#2E7D32',
    background: '#0A0F0B',
    surface: '#151B16',
    text: '#E6F2E7',
    accent: '#A5D6A7',
    font: '"Teko", system-ui, sans-serif',
    pattern: 'radial-gradient(circle at 75% 25%, rgba(46, 125, 50, 0.1) 0%, transparent 50%)'
  },
  captainAmerica: {
    name: 'Captain America',
    primary: '#1565C0',
    background: '#0A0E15',
    surface: '#151B28',
    text: '#EAF2FF',
    accent: '#D32F2F',
    font: '"Montserrat", system-ui, sans-serif',
    pattern: 'linear-gradient(45deg, rgba(21, 101, 192, 0.05) 0%, rgba(211, 47, 47, 0.05) 100%)'
  },
  spiderMan: {
    name: 'Spider-Man',
    primary: '#C62828',
    background: '#0B0B10',
    surface: '#1A1A25',
    text: '#F4F5FF',
    accent: '#1565C0',
    font: '"Bangers", system-ui, sans-serif',
    pattern: 'conic-gradient(from 0deg at 50% 50%, rgba(198, 40, 40, 0.1) 0deg, transparent 120deg, rgba(21, 101, 192, 0.1) 240deg, transparent 360deg)'
  },
  blackPanther: {
    name: 'Black Panther',
    primary: '#6A1B9A',
    background: '#08080C',
    surface: '#16161F',
    text: '#EEE9FF',
    accent: '#00BFA6',
    font: '"Rajdhani", system-ui, sans-serif',
    pattern: 'radial-gradient(ellipse at center, rgba(106, 27, 154, 0.1) 0%, transparent 70%)'
  },
  doctorStrange: {
    name: 'Doctor Strange',
    primary: '#8E24AA',
    background: '#0C0A13',
    surface: '#1B1828',
    text: '#F2E9FF',
    accent: '#FF7043',
    font: '"Cinzel", system-ui, serif',
    pattern: 'conic-gradient(from 45deg at 30% 70%, rgba(142, 36, 170, 0.1) 0deg, rgba(255, 112, 67, 0.1) 120deg, transparent 240deg)'
  },
  thor: {
    name: 'Thor',
    primary: '#B71C1C',
    background: '#0B0B0E',
    surface: '#1A1A1F',
    text: '#F2F2F2',
    accent: '#90CAF9',
    font: '"Cinzel Decorative", system-ui, serif',
    pattern: 'linear-gradient(135deg, rgba(183, 28, 28, 0.1) 0%, rgba(144, 202, 249, 0.1) 100%)'
  }
};

export function applyTheme(theme: ThemeKey) {
  const tokens = themes[theme];
  const root = document.documentElement;
  
  root.style.setProperty('--theme-primary', tokens.primary);
  root.style.setProperty('--theme-background', tokens.background);
  root.style.setProperty('--theme-surface', tokens.surface);
  root.style.setProperty('--theme-text', tokens.text);
  root.style.setProperty('--theme-accent', tokens.accent);
  root.style.setProperty('--theme-font', tokens.font);
  root.style.setProperty('--theme-pattern', tokens.pattern);
  root.setAttribute('data-theme', theme);
  
  // Store in localStorage
  localStorage.setItem('akhilgpt-theme', theme);
}

export function getStoredTheme(): ThemeKey {
  if (typeof window === 'undefined') return 'ironMan';
  return (localStorage.getItem('akhilgpt-theme') as ThemeKey) || 'ironMan';
}

export function loadGoogleFonts() {
  const fonts = [
    'Orbitron:400,700',
    'Teko:400,700',
    'Montserrat:400,600,700',
    'Bangers:400',
    'Rajdhani:400,600,700',
    'Cinzel:400,600',
    'Cinzel+Decorative:400,700'
  ];
  
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}