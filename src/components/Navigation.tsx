import React from 'react';
import {
  Compass,
  MapPin,
  Award,
  User,
  Camera,
  Sparkles,
  Leaf,
  Globe2,
  Layers,
  Palette,
  Droplets,
  Mountain,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { AppTheme } from '../types/biodiversity';
import { THEME_CONFIGS } from '../utils/theme';

interface NavigationProps {
  activeTab: 'home' | 'discover' | 'map' | 'missions' | 'profile';
  setActiveTab: (tab: 'home' | 'discover' | 'map' | 'missions' | 'profile') => void;
  onOpenIdentify: () => void;
  onOpenBioGuide: () => void;
  onOpenFlashcards: () => void;
  currentLang: Language;
  setLang: (lang: Language) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenIdentify,
  onOpenBioGuide,
  onOpenFlashcards,
  currentLang,
  setLang,
  theme,
  setTheme,
}) => {
  const t = TRANSLATIONS[currentLang];
  const currentTheme = THEME_CONFIGS[theme];

  const cycleLanguage = () => {
    if (currentLang === 'en') setLang('si');
    else if (currentLang === 'si') setLang('ta');
    else setLang('en');
  };

  const getLangBadge = () => {
    if (currentLang === 'en') return 'EN';
    if (currentLang === 'si') return 'සිං';
    return 'த';
  };

  const cycleTheme = () => {
    if (theme === 'forest') setTheme('ocean');
    else if (theme === 'ocean') setTheme('earth');
    else setTheme('forest');
  };

  const getThemeIcon = () => {
    if (theme === 'forest') return <Leaf className="w-3.5 h-3.5 text-emerald-400" />;
    if (theme === 'ocean') return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
    return <Mountain className="w-3.5 h-3.5 text-amber-400" />;
  };

  const getThemeGradient = () => {
    if (theme === 'forest') return { stop1: '#a7f3d0', stop2: '#34d399' };
    if (theme === 'ocean') return { stop1: '#a5f3fc', stop2: '#06b6d4' };
    return { stop1: '#fde68a', stop2: '#f59e0b' };
  };

  const grad = getThemeGradient();

  return (
    <>
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between transition-colors">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          {/* Custom Elegant Biodiversity Emblem */}
          <div className={`w-8 h-8 rounded-xl ${currentTheme.primaryBg} text-white flex items-center justify-center shadow-sm`}>
            <svg
              className="w-5 h-5 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="BioQuest emblem"
            >
              <defs>
                <linearGradient id="bioquest-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={grad.stop1} />
                  <stop offset="100%" stopColor={grad.stop2} />
                </linearGradient>
              </defs>
              {/* Organic leaf blade & oceanic wave contour */}
              <path
                d="M20.5 3.5C14 4 8.5 7.8 5.6 13C4.2 15.5 3.8 18 3.5 20.5C6.2 19 9.2 17 12.2 14.2C16.5 10.2 19 6.8 20.5 3.5Z"
                fill="url(#bioquest-logo-grad)"
                fillOpacity="0.32"
              />
              {/* Central fluid spine / oceanic current */}
              <path
                d="M3.5 20.5C6 16.5 9.5 13.2 14 10.8C17.5 9 19.8 5.6 20.5 3.5"
                stroke="url(#bioquest-logo-grad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Outer sculpted biological contour */}
              <path
                d="M20.5 3.5C13.5 4.2 8.2 8.2 5.5 13.2C4.2 15.6 3.8 18 3.5 20.5C6.2 19 9.2 17 12.2 14.2C16.8 10 19.2 6.6 20.5 3.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Delicate branch veins */}
              <path
                d="M11.5 11C13.4 9 15.8 8 18 7.3"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M8.8 14.2C10.6 12.8 12.8 12.2 14.8 12.2"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base leading-none">
                BIOQUEST
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                {theme}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95"
            title={`Switch Theme (Current: ${currentTheme.label})`}
          >
            {getThemeIcon()}
            <span className="hidden md:inline capitalize">{theme}</span>
          </button>

          {/* Flashcards Deck Trigger */}
          <button
            onClick={onOpenFlashcards}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${currentTheme.cardBg} ${currentTheme.accentText} border border-slate-200/80 hover:brightness-95 text-xs font-semibold transition-all active:scale-95 shadow-xs`}
            title="Open Wildlife Species Flashcards"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flashcards</span>
          </button>

          {/* BioGuide AI trigger */}
          <button
            onClick={onOpenBioGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all active:scale-95 shadow-xs"
            title="Ask BioGuide AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">BioGuide</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={cycleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all active:scale-95"
            title="Switch Language (English / Sinhala / Tamil)"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-[11px]">{getLangBadge()}</span>
          </button>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe">
        <div className="max-w-xl mx-auto px-3 h-16 flex items-center justify-between relative">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'home' ? currentTheme.accentText : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{t.home}</span>
          </button>

          {/* 2. Discover */}
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'discover' ? currentTheme.accentText : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Leaf className={`w-5 h-5 ${activeTab === 'discover' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{t.discover}</span>
          </button>

          {/* Center Floating Action Button: IDENTIFY SPECIES */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={onOpenIdentify}
              className={`w-13 h-13 rounded-full ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white flex flex-col items-center justify-center shadow-lg shadow-black/20 ring-4 ring-white active:scale-95 transition-all`}
              title="Auto-Identify Species on Insert"
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* 3. Map */}
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'map' ? currentTheme.accentText : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{t.map}</span>
          </button>

          {/* 4. Missions */}
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'missions' ? currentTheme.accentText : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Award className={`w-5 h-5 ${activeTab === 'missions' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{t.missions}</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'profile' ? currentTheme.accentText : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{t.profile}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
