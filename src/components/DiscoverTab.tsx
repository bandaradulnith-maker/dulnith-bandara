import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';
import { Species, OrganismGroup, ConservationStatus, AppTheme } from '../types/biodiversity';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { THEME_CONFIGS } from '../utils/theme';

interface DiscoverTabProps {
  speciesList: Species[];
  currentLang: Language;
  onSelectSpecies: (species: Species) => void;
  onOpenCompare: (speciesA?: Species, speciesB?: Species) => void;
  onOpenFlashcards?: () => void;
  theme?: AppTheme;
}

export const DiscoverTab: React.FC<DiscoverTabProps> = ({
  speciesList,
  currentLang,
  onSelectSpecies,
  onOpenCompare,
  onOpenFlashcards,
  theme = 'forest',
}) => {
  const t = TRANSLATIONS[currentLang];
  const currentTheme = THEME_CONFIGS[theme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const groups: { key: string; label: string }[] = [
    { key: 'all', label: t.allGroups },
    { key: 'marine', label: 'Marine & Ocean' },
    { key: 'bird', label: t.birds },
    { key: 'mammal', label: t.mammals },
    { key: 'insect', label: t.insects },
    { key: 'plant', label: t.plants },
    { key: 'reptile', label: t.reptiles },
    { key: 'amphibian', label: t.amphibians },
  ];

  const statuses: { key: string; label: string }[] = [
    { key: 'all', label: 'All Statuses' },
    { key: 'CR', label: 'CR (Critically Endangered)' },
    { key: 'EN', label: 'EN (Endangered)' },
    { key: 'VU', label: 'VU (Vulnerable)' },
    { key: 'NT', label: 'NT (Near Threatened)' },
    { key: 'LC', label: 'LC (Least Concern)' },
  ];

  const filteredSpecies = useMemo(() => {
    return speciesList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.scientificName.toLowerCase().includes(q) ||
        s.commonNames.en.toLowerCase().includes(q) ||
        (s.commonNames.si && s.commonNames.si.includes(q)) ||
        (s.commonNames.ta && s.commonNames.ta.includes(q)) ||
        s.habitat.toLowerCase().includes(q);

      const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
      const matchStatus = selectedStatus === 'all' || s.conservationStatus === selectedStatus;

      return matchQuery && matchGroup && matchStatus;
    });
  }, [speciesList, searchQuery, selectedGroup, selectedStatus]);

  const getStatusBadgeColor = (status: ConservationStatus) => {
    switch (status) {
      case 'CR':
        return 'bg-red-700 text-white';
      case 'EN':
        return 'bg-orange-600 text-white';
      case 'VU':
        return 'bg-amber-600 text-white';
      case 'NT':
        return 'bg-yellow-600 text-white';
      case 'LC':
        return 'bg-emerald-700 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-4">
      {/* Header and Compare Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Species Encyclopedia
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Search scientifically verified flora and fauna
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenFlashcards && (
            <button
              onClick={onOpenFlashcards}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${currentTheme.badgeBg} ${currentTheme.badgeText} rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
          )}
          <button
            onClick={() => onOpenCompare()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-slate-700" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchSpecies}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Organism Group Segmented Filter Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setSelectedGroup(g.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedGroup === g.key
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Conservation Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 shrink-0 text-[11px] font-medium">IUCN:</span>
        {statuses.map((st) => (
          <button
            key={st.key}
            onClick={() => setSelectedStatus(st.key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedStatus === st.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.key === 'all' ? 'All' : st.key}
          </button>
        ))}
      </div>

      {/* Species Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredSpecies.length}</strong> cataloged species
        </span>
        <span className="text-[11px] text-slate-400">IUCN & GBIF Indexed</span>
      </div>

      {/* Species Card Grid */}
      {filteredSpecies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No matching species found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Try adjusting your search criteria or switching the organism group filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('all');
              setSelectedStatus('all');
            }}
            className="text-xs font-semibold text-emerald-800 hover:underline pt-2 inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSpecies.map((sp) => (
            <div
              key={sp.id}
              onClick={() => onSelectSpecies(sp)}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row group"
            >
              {/* Thumbnail Image */}
              <div className="sm:w-44 aspect-16/10 sm:aspect-square relative overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={sp.image}
                  alt={sp.commonNames.en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeColor(
                    sp.conservationStatus
                  )}`}
                >
                  {sp.conservationStatus}
                </span>
              </div>

              {/* Information Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {currentLang === 'si' && sp.commonNames.si
                          ? sp.commonNames.si
                          : currentLang === 'ta' && sp.commonNames.ta
                          ? sp.commonNames.ta
                          : sp.commonNames.en}
                      </h3>
                      {/* Secondary English / Sinhala subtitle if local lang active */}
                      {currentLang !== 'en' && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {sp.commonNames.en}
                        </p>
                      )}
                      <p className="text-xs italic font-serif text-slate-500 mt-0.5">
                        {sp.scientificName}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-50 px-2 py-0.5 rounded">
                      {sp.taxonomy.family}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {sp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">
                    📍 {sp.geographicRange.split(',')[0]}
                  </span>
                  <span className="text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Field Guide
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
