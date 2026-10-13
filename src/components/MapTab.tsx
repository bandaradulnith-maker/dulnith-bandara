import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Filter,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  List,
  Map as MapIcon,
  Navigation,
  Compass,
} from 'lucide-react';
import { Observation, IdentificationStatus, OrganismGroup } from '../types/biodiversity';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface MapTabProps {
  observations: Observation[];
  currentLang: Language;
  onSelectObservation: (obs: Observation) => void;
  onOpenIdentify: () => void;
  onOpenManualEntry: () => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  observations,
  currentLang,
  onSelectObservation,
  onOpenIdentify,
  onOpenManualEntry,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activePin, setActivePin] = useState<Observation | null>(observations[0] || null);

  const statuses: { key: string; label: string; icon: any }[] = [
    { key: 'all', label: 'All Statuses', icon: Layers },
    { key: 'expert-verified', label: 'Expert-Verified', icon: CheckCircle2 },
    { key: 'community-supported', label: 'Community-Supported', icon: ShieldCheck },
    { key: 'ai-suggested', label: 'AI-Suggested', icon: HelpCircle },
    { key: 'unreviewed', label: 'Unreviewed', icon: AlertCircle },
  ];

  const filteredObservations = observations.filter((obs) => {
    const matchStatus = selectedStatus === 'all' || obs.identificationStatus === selectedStatus;
    const matchGroup = selectedGroup === 'all' || obs.organismGroup === selectedGroup;
    return matchStatus && matchGroup;
  });

  const getMarkerColor = (group: OrganismGroup) => {
    switch (group) {
      case 'bird':
        return 'bg-blue-600 ring-blue-200 text-white';
      case 'mammal':
        return 'bg-amber-600 ring-amber-200 text-white';
      case 'insect':
        return 'bg-emerald-600 ring-emerald-200 text-white';
      case 'plant':
        return 'bg-lime-700 ring-lime-200 text-white';
      case 'reptile':
        return 'bg-purple-600 ring-purple-200 text-white';
      default:
        return 'bg-teal-600 ring-teal-200 text-white';
    }
  };

  // Convert lat/lng coordinates to relative percentage on our Sri Lanka & regional biodiversity map view
  // Latitude: 5.9°N to 9.8°N -> top 90% to 10%
  // Longitude: 79.5°E to 82.0°E -> left 15% to 85%
  const getMapPosition = (lat: number, lng: number) => {
    const top = Math.max(12, Math.min(88, 100 - ((lat - 5.8) / (9.8 - 5.8)) * 100));
    const left = Math.max(12, Math.min(88, ((lng - 79.5) / (82.0 - 79.5)) * 100));
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-4">
      {/* Top Header & View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Community Biodiversity Map
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live field observations and species hotspots
          </p>
        </div>

        {/* Map / List View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Verification Status Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {statuses.map((st) => (
          <button
            key={st.key}
            onClick={() => setSelectedStatus(st.key)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === st.key
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            <st.icon className="w-3 h-3" />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Sensitive Species Privacy Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-[11px] font-medium leading-snug">
            {t.generalizeCoordinatesNotice} (CITES & IUCN Protocol)
          </span>
        </div>
        <button
          onClick={onOpenManualEntry}
          className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0 whitespace-nowrap"
        >
          + Add Field Log
        </button>
      </div>

      {viewMode === 'map' ? (
        <div className="space-y-3">
          {/* Map Canvas Card */}
          <div className="relative w-full aspect-4/3 rounded-3xl bg-slate-900 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Topographic Forest Satellite Simulation Canvas */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage: `radial-gradient(ellipse at 50% 65%, #183e28 0%, #0d2618 45%, #08170f 85%)`,
              }}
            />

            {/* Simulated Geographic Island & Topographic Contour Lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 300"
            >
              {/* Regional island contour */}
              <path
                d="M170 40 Q210 50 220 90 Q240 140 230 190 Q210 240 170 260 Q130 240 140 180 Q130 110 170 40 Z"
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <path
                d="M175 60 Q200 70 210 100 Q225 140 215 180 Q195 220 175 235 Q145 220 150 170 Q145 110 175 60 Z"
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="1"
              />
              {/* Mountain ridge elevation (Central Highlands) */}
              <circle cx="180" cy="150" r="30" fill="none" stroke="#6ee7b7" strokeWidth="0.8" />
              <circle cx="180" cy="150" r="16" fill="none" stroke="#6ee7b7" strokeWidth="0.8" />
            </svg>

            {/* Hotspot labels */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400/80 tracking-widest uppercase pointer-events-none">
              Sinharaja Biosphere
            </div>
            <div className="absolute bottom-1/4 right-1/4 text-[9px] font-bold text-emerald-400/80 tracking-widest uppercase pointer-events-none">
              Yala Plains
            </div>
            <div className="absolute top-1/3 right-1/3 text-[9px] font-bold text-emerald-400/80 tracking-widest uppercase pointer-events-none">
              Knuckles Range
            </div>

            {/* Observations Pins */}
            {filteredObservations.map((obs) => {
              const pos = getMapPosition(
                obs.approximateLocation.lat,
                obs.approximateLocation.lng
              );
              const isSelected = activePin?.id === obs.id;

              return (
                <button
                  key={obs.id}
                  onClick={() => setActivePin(obs)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all cursor-pointer z-10 active:scale-125 ${
                    isSelected
                      ? 'scale-125 ring-4 ring-white shadow-xl z-20'
                      : 'hover:scale-110 shadow-md ring-2 ring-white/80'
                  } ${getMarkerColor(obs.organismGroup)}`}
                  title={`${obs.suggestedSpecies?.commonName} (${obs.identificationStatus})`}
                >
                  <MapPin className="w-4 h-4 stroke-[2.5]" />
                </button>
              );
            })}

            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
              <div className="bg-black/70 backdrop-blur-md rounded-xl p-2 text-white/90 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Birds</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Mammals</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Insects</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-lime-500" />
                  <span>Flora</span>
                </div>
              </div>
            </div>

            {/* Scale indicator */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-mono px-2 py-1 rounded-lg">
              Grid: 5km (Generalized)
            </div>
          </div>

          {/* Active Pin Detail Card Drawer */}
          {activePin && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activePin.photoUrl}
                    alt={activePin.suggestedSpecies?.commonName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {activePin.suggestedSpecies?.commonName || 'Specimen'}
                    </h3>
                    <p className="text-xs italic font-serif text-slate-500">
                      {activePin.suggestedSpecies?.scientificName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Observed by {activePin.userName}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    activePin.identificationStatus === 'expert-verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activePin.identificationStatus === 'community-supported'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activePin.identificationStatus.replace('-', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">📍 Location:</span>
                  <span>{activePin.approximateLocation.placeName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">🌿 Habitat:</span>
                  <span>{activePin.habitat}</span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 line-clamp-2">
                  "{activePin.notes}"
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onSelectObservation(activePin)}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                >
                  View Observation & Review ({activePin.communityReviews.length})
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredObservations.map((obs) => (
            <div
              key={obs.id}
              onClick={() => onSelectObservation(obs)}
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={obs.photoUrl}
                  alt={obs.suggestedSpecies?.commonName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-slate-900 truncate">
                    {obs.suggestedSpecies?.commonName || 'Specimen'}
                  </h3>
                  <p className="text-[11px] italic font-serif text-slate-500 truncate mt-0.5">
                    {obs.suggestedSpecies?.scientificName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {obs.approximateLocation.placeName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    obs.identificationStatus === 'expert-verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : obs.identificationStatus === 'community-supported'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {obs.identificationStatus.replace('-', ' ')}
                </span>
                <span className="text-[10px] text-slate-400">
                  {obs.communityReviews.length} Reviews
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
