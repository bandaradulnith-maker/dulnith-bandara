import React from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  Eye,
  Layers,
  Zap,
} from 'lucide-react';
import { Species, Observation, Mission, UserProfile, AppTheme } from '../types/biodiversity';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { DAILY_NATURE_FACTS } from '../data/mockBiodiversityData';
import { THEME_CONFIGS } from '../utils/theme';

interface HomeTabProps {
  user: UserProfile;
  speciesList: Species[];
  observations: Observation[];
  missions: Mission[];
  currentLang: Language;
  onOpenIdentify: () => void;
  onOpenFlashcards?: () => void;
  onSelectSpecies: (species: Species) => void;
  onSelectObservation: (obs: Observation) => void;
  onGoToTab: (tab: 'discover' | 'map' | 'missions' | 'profile') => void;
  theme?: AppTheme;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  speciesList,
  observations,
  missions,
  currentLang,
  onOpenIdentify,
  onOpenFlashcards,
  onSelectSpecies,
  onSelectObservation,
  onGoToTab,
  theme = 'forest',
}) => {
  const t = TRANSLATIONS[currentLang];
  const currentTheme = THEME_CONFIGS[theme];
  const featured = speciesList.slice(0, 2);
  const recentObs = observations.slice(0, 3);
  const activeMissions = missions.filter((m) => !m.isCompleted).slice(0, 2);
  const fact = DAILY_NATURE_FACTS[0];

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 pt-4">
      {/* 1. Naturalist Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative leaf pattern in background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-6 translate-y-6">
          <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C70 30 100 50 100 100 C50 100 30 70 0 50 C30 50 50 20 50 0 Z" />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-400/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-emerald-50 leading-tight">
                  {user.displayName}
                </h1>
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{user.streakDays}d Streak</span>
                </div>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                Level {user.level} · {user.levelTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-800/40">
          <div className="flex justify-between text-xs text-emerald-200/80 mb-1.5 font-medium">
            <span>Exploration XP</span>
            <span className="tabular-nums font-semibold">
              {user.xp} / {user.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full bg-emerald-950/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (user.xp / user.nextLevelXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Large Prominent "Identify Species" Hero CTA */}
      <div className={`${currentTheme.cardBg} border border-slate-200/90 rounded-3xl p-5 shadow-sm relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Auto-Scan on Photo Insert</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Discovered something wild?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Insert, drag-and-drop, or paste any photo for instant AI species identification, visible morphometrics, and IUCN status.
            </p>
          </div>
          <button
            onClick={onOpenIdentify}
            className={`flex items-center justify-center gap-2 ${currentTheme.primaryBg} ${currentTheme.primaryHover} active:scale-95 text-white font-semibold text-sm px-5 py-3.5 rounded-2xl shadow-md transition-all shrink-0`}
          >
            <Camera className="w-5 h-5" />
            <span>Identify Species</span>
          </button>
        </div>
      </div>

      {/* 2b. Interactive Flashcards Collection Banner */}
      {onOpenFlashcards && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-4.5 shadow-sm flex items-center justify-between gap-4 border border-slate-700/60">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Species Flashcards Study Deck
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Animal & Plant Collections
            </h3>
            <p className="text-[11px] text-slate-300 max-w-xs leading-snug">
              Master 8+ species across terrestrial, avian, and oceanic biomes with 3D tactile flip cards & voice audio guide!
            </p>
          </div>
          <button
            onClick={onOpenFlashcards}
            className={`px-4 py-2.5 rounded-2xl ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white font-bold text-xs shrink-0 active:scale-95 transition-all shadow-md flex items-center gap-1.5`}
          >
            <span>Study Decks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Daily Nature Fact */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-800">
            <BookOpen className="w-3.5 h-3.5" />
            {t.dailyFact}
          </span>
          <span className="text-[11px] text-slate-400">{fact.category}</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900">{fact.title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{fact.fact}</p>
        <p className="text-[10px] text-slate-400 italic">Source: {fact.source}</p>
      </div>

      {/* 4. Quick Discovery KPI Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div
          onClick={() => onGoToTab('profile')}
          className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-xl font-extrabold text-emerald-950 tabular-nums">
            {observations.length}
          </span>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Observations
          </p>
        </div>
        <div
          onClick={() => onGoToTab('discover')}
          className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-xl font-extrabold text-emerald-950 tabular-nums">
            {speciesList.length}
          </span>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Species Catalog
          </p>
        </div>
        <div
          onClick={() => onGoToTab('missions')}
          className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-xl font-extrabold text-emerald-950 tabular-nums">
            {missions.filter((m) => m.isCompleted).length}/{missions.length}
          </span>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            Missions Done
          </p>
        </div>
      </div>

      {/* 5. Featured Wildlife Species */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {t.featuredSpecies}
          </h2>
          <button
            onClick={() => onGoToTab('discover')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featured.map((sp) => (
            <div
              key={sp.id}
              onClick={() => onSelectSpecies(sp)}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={sp.image}
                  alt={sp.commonNames.en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-semibold text-white tracking-wide">
                  {sp.conservationStatus} · {sp.statusLabel.split(' ')[0]}
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {currentLang === 'si' && sp.commonNames.si
                      ? sp.commonNames.si
                      : currentLang === 'ta' && sp.commonNames.ta
                      ? sp.commonNames.ta
                      : sp.commonNames.en}
                  </h3>
                  <p className="text-xs italic text-slate-500 font-serif mt-0.5">
                    {sp.scientificName}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span className="capitalize">{sp.group}</span>
                  <span className="text-emerald-800 font-medium">View Guide →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recent Community Observations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {t.recentObservations}
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live Feed</span>
          </div>
          <button
            onClick={() => onGoToTab('map')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>View Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentObs.map((obs) => (
            <div
              key={obs.id}
              onClick={() => onSelectObservation(obs)}
              className="bg-white border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-emerald-300 transition-all cursor-pointer"
            >
              <img
                src={obs.photoUrl}
                alt={obs.suggestedSpecies?.commonName || 'Observation'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {obs.suggestedSpecies?.commonName || 'Specimen'}
                  </h4>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      obs.identificationStatus === 'expert-verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : obs.identificationStatus === 'community-supported'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {obs.identificationStatus.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-[11px] italic text-slate-500 font-serif truncate mt-0.5">
                  {obs.suggestedSpecies?.scientificName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {obs.approximateLocation.placeName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Active Nature Missions Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {t.activeMissions}
          </h2>
          <button
            onClick={() => onGoToTab('missions')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>All Missions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activeMissions.map((m) => (
            <div
              key={m.id}
              onClick={() => onGoToTab('missions')}
              className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{m.title}</h4>
                    <span className="text-[10px] text-slate-500">
                      {m.difficulty} · +{m.rewardPoints} XP
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 tabular-nums">
                  {m.currentCount || 0}/{m.targetCount}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((m.currentCount || 0) / m.targetCount) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Ethics & Leave-No-Trace Guardian Notice */}
      <div className="bg-slate-100/90 rounded-2xl p-3.5 flex items-start gap-3 text-slate-700 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">
            {t.leaveNoTrace}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Never approach, bait, or touch wild animals. Precise GPS coordinates of vulnerable and endangered flora & fauna are automatically masked to safeguard against poaching.
          </p>
        </div>
      </div>
    </div>
  );
};
