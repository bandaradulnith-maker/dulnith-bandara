import { AppTheme } from '../types/biodiversity';

export interface ThemeConfig {
  name: AppTheme;
  label: string;
  sublabel: string;
  primaryBg: string;
  primaryHover: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  cardBg: string;
  headerFrom: string;
  headerTo: string;
  bodyBg: string;
  borderFocus: string;
  iconColor: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeConfig> = {
  forest: {
    name: 'forest',
    label: 'Deep Forest',
    sublabel: 'Rainforest Canopy',
    primaryBg: 'bg-emerald-800',
    primaryHover: 'hover:bg-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accentText: 'text-emerald-800',
    cardBg: 'bg-emerald-50',
    headerFrom: 'from-emerald-900',
    headerTo: 'to-slate-900',
    bodyBg: '#f7f9f6',
    borderFocus: 'focus:ring-emerald-600/30 focus:border-emerald-600',
    iconColor: 'text-emerald-600',
  },
  ocean: {
    name: 'ocean',
    label: 'Green Ocean',
    sublabel: 'Marine & Reef Waters',
    primaryBg: 'bg-teal-800',
    primaryHover: 'hover:bg-teal-700',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    accentText: 'text-teal-800',
    cardBg: 'bg-teal-50',
    headerFrom: 'from-teal-950',
    headerTo: 'to-slate-900',
    bodyBg: '#f0f9fa',
    borderFocus: 'focus:ring-teal-600/30 focus:border-teal-600',
    iconColor: 'text-teal-600',
  },
  earth: {
    name: 'earth',
    label: 'Terra Earth',
    sublabel: 'Clay, Sand & Savannah',
    primaryBg: 'bg-amber-900',
    primaryHover: 'hover:bg-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentText: 'text-amber-900',
    cardBg: 'bg-amber-50',
    headerFrom: 'from-stone-900',
    headerTo: 'to-amber-950',
    bodyBg: '#faf7f2',
    borderFocus: 'focus:ring-amber-700/30 focus:border-amber-700',
    iconColor: 'text-amber-700',
  },
};
