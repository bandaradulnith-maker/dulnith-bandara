import React from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Scale,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Species, ConservationStatus } from '../types/biodiversity';
import { Language } from '../utils/i18n';

interface SpeciesDetailModalProps {
  species: Species | null;
  onClose: () => void;
  onOpenCompare: (species: Species) => void;
  onOpenBioGuideWithContext: (speciesName: string) => void;
  currentLang: Language;
}

export const SpeciesDetailModal: React.FC<SpeciesDetailModalProps> = ({
  species,
  onClose,
  onOpenCompare,
  onOpenBioGuideWithContext,
  currentLang,
}) => {
  if (!species) return null;

  const getStatusBadge = (status: ConservationStatus) => {
    switch (status) {
      case 'CR':
        return { label: 'Critically Endangered (CR)', bg: 'bg-red-700 text-white' };
      case 'EN':
        return { label: 'Endangered (EN)', bg: 'bg-orange-600 text-white' };
      case 'VU':
        return { label: 'Vulnerable (VU)', bg: 'bg-amber-600 text-white' };
      case 'NT':
        return { label: 'Near Threatened (NT)', bg: 'bg-yellow-600 text-white' };
      case 'LC':
        return { label: 'Least Concern (LC)', bg: 'bg-emerald-700 text-white' };
      default:
        return { label: 'Data Deficient (DD)', bg: 'bg-slate-700 text-white' };
    }
  };

  const statusInfo = getStatusBadge(species.conservationStatus);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Sticky Header with image hero */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={species.image}
            alt={species.commonNames.en}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${statusInfo.bg}`}
            >
              {statusInfo.label}
            </span>
            <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
              {currentLang === 'si' && species.commonNames.si
                ? species.commonNames.si
                : currentLang === 'ta' && species.commonNames.ta
                ? species.commonNames.ta
                : species.commonNames.en}
            </h2>
            <p className="text-xs italic font-serif text-white/90 drop-shadow-sm mt-0.5">
              {species.scientificName}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Localized Names (English, Sinhala, Tamil) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Regional Vernacular Names
              </span>
              <p className="font-semibold text-slate-900">
                EN: {species.commonNames.en}
              </p>
              {species.commonNames.si && (
                <p className="text-slate-600">සිංහල: {species.commonNames.si}</p>
              )}
              {species.commonNames.ta && (
                <p className="text-slate-600">தமிழ்: {species.commonNames.ta}</p>
              )}
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Taxon Group</span>
              <p className="capitalize font-bold text-emerald-800">{species.group}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenCompare(species);
                onClose();
              }}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>Compare Species</span>
            </button>
            <button
              onClick={() => {
                onOpenBioGuideWithContext(species.commonNames.en);
                onClose();
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Ask BioGuide AI</span>
            </button>
          </div>

          {/* Taxonomic Hierarchy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>Linnaean Taxonomic Classification</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Kingdom</span>
                <span className="font-semibold text-slate-800">{species.taxonomy.kingdom}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phylum</span>
                <span className="font-semibold text-slate-800">{species.taxonomy.phylum}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Class</span>
                <span className="font-semibold text-slate-800">{species.taxonomy.class}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Family</span>
                <span className="font-semibold text-slate-800">{species.taxonomy.family}</span>
              </div>
            </div>
          </div>

          {/* Description & Identifying Features */}
          <div className="space-y-2 text-xs text-slate-700">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Diagnostic Field Identification
            </h3>
            <p className="leading-relaxed">{species.description}</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 mt-2">
              <p className="font-bold text-slate-900 text-[11px]">
                Key Morphological Identifiers:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {species.identifyingFeatures.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Habitat, Geographic Range & Diet */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs text-slate-600">
            <div className="space-y-1">
              <strong className="text-slate-900">Habitat & Elevation: </strong>
              <span>{species.habitat}</span>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900">Protected Habitats: </strong>
              <span>{species.geographicRange}</span>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900">Diet & Trophic Behavior: </strong>
              <span>{species.typicalDiet}</span>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-900">Ecological Role: </strong>
              <span>{species.ecologicalRole}</span>
            </div>
          </div>

          {/* Conservation Status & Threats */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>IUCN Red List Status & Assessment</span>
              </h3>
              <span className="text-[10px] text-amber-800">{species.assessmentDate}</span>
            </div>
            <p className="text-amber-900 font-medium">{species.statusLabel}</p>

            <div className="space-y-1 pt-1">
              <p className="font-bold text-amber-950 text-[11px]">Primary Threats:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900/90 text-[11px]">
                {species.threats.map((threat, i) => (
                  <li key={i}>{threat}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 pt-1">
              <p className="font-bold text-amber-950 text-[11px]">Conservation Actions:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900/90 text-[11px]">
                {species.conservationActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reliable Source Citations */}
          <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-400">
            <span className="font-bold text-slate-600 block">
              Verified Scientific Citations & Repositories:
            </span>
            {species.sourceCitations.map((src, i) => (
              <p key={i}>
                · {src.title} ({src.organization})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
