import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import { Species } from '../types/biodiversity';
import { AppTheme } from '../types/biodiversity';
import { THEME_CONFIGS } from '../utils/theme';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: Species[];
  theme: AppTheme;
  onSelectSpecies: (sp: Species) => void;
  onAddMasteryXP: (xp: number) => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  speciesList,
  theme,
  onSelectSpecies,
  onAddMasteryXP,
}) => {
  if (!isOpen) return null;

  const currentTheme = THEME_CONFIGS[theme];

  // Decks filtering
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedHint, setRevealedHint] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const decks = [
    { id: 'all', label: 'All Collections' },
    { id: 'marine', label: 'Ocean & Coral Reefs' },
    { id: 'bird', label: 'Avian Jewels' },
    { id: 'mammal', label: 'Mammals & Primates' },
    { id: 'reptile', label: 'Reptiles & Amphibians' },
    { id: 'insects_flora', label: 'Flora & Pollinators' },
  ];

  const filteredSpecies = speciesList.filter((s) => {
    if (selectedDeck === 'all') return true;
    if (selectedDeck === 'insects_flora') return s.group === 'insect' || s.group === 'plant';
    return s.group === selectedDeck;
  });

  const activeSpecies = filteredSpecies[currentIndex] || filteredSpecies[0];

  const handleNext = () => {
    setIsFlipped(false);
    setRevealedHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredSpecies.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setRevealedHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredSpecies.length) % filteredSpecies.length);
  };

  const handleMarkMastered = () => {
    if (!activeSpecies) return;
    if (!masteredIds.has(activeSpecies.id)) {
      setMasteredIds((prev) => new Set(prev).add(activeSpecies.id));
      onAddMasteryXP(25);
    }
    handleNext();
  };

  // Browser SpeechSynthesis audio voice reading of species description & field guide
  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window) || !activeSpecies) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${activeSpecies.commonNames.en}, scientifically cataloged as ${activeSpecies.scientificName}. ${activeSpecies.description} Status on the IUCN Red List is ${activeSpecies.statusLabel}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${currentTheme.primaryBg} text-white flex items-center justify-center shadow-sm`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                BioQuest Species Flashcards
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Active Recall & Field Identification Training
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingAudio) window.speechSynthesis?.cancel();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deck Category Selector */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeck(deck.id);
                setCurrentIndex(0);
                setIsFlipped(false);
                setRevealedHint(false);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedDeck === deck.id
                  ? `${currentTheme.primaryBg} text-white shadow-sm`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {deck.label}
            </button>
          ))}
        </div>

        {/* Deck Progress Bar */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Card <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-900">{filteredSpecies.length}</strong>
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>{masteredIds.size} Mastered</span>
          </div>
        </div>

        {/* Main Flashcard View */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          {activeSpecies ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-sm aspect-3/4 rounded-3xl bg-slate-900 text-white relative shadow-xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:shadow-2xl"
              style={{
                perspective: '1000px',
              }}
            >
              {!isFlipped ? (
                /* FRONT OF FLASHCARD: Challenge Image & Morphology Hints */
                <div className="w-full h-full relative flex flex-col justify-between p-5 bg-gradient-to-t from-black/90 via-black/40 to-black/20">
                  <img
                    src={activeSpecies.image}
                    alt="Mystery Species"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover -z-10"
                  />

                  {/* Top front bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-emerald-300 border border-white/10">
                      {activeSpecies.group} Collection
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white">
                      Tap card to flip ↻
                    </span>
                  </div>

                  {/* Bottom challenge prompt */}
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Field Identification Challenge
                      </p>
                      <h3 className="text-xl font-extrabold text-white leading-tight">
                        Can you identify this specimen?
                      </h3>
                    </div>

                    {revealedHint ? (
                      <div className="bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs text-slate-200 space-y-1 animate-in fade-in">
                        <strong className="text-emerald-300 block text-[11px]">
                          🔎 Diagnostic Key Clue:
                        </strong>
                        <p className="text-[11px] leading-relaxed">
                          {activeSpecies.identifyingFeatures[0]}
                        </p>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          Habitat: {activeSpecies.habitat.split('.')[0]}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRevealedHint(true);
                        }}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Reveal Field Clue</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* BACK OF FLASHCARD: Scientific Classification, Audio, & Ecology */
                <div className="w-full h-full p-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col justify-between text-white overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                          Verified Species
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {activeSpecies.commonNames.en}
                        </h3>
                        <p className="text-xs italic font-serif text-emerald-200/90 mt-0.5">
                          {activeSpecies.scientificName}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-amber-300 shrink-0">
                        {activeSpecies.conservationStatus}
                      </span>
                    </div>

                    {/* Regional local names */}
                    <div className="text-[11px] text-slate-300 flex items-center gap-3">
                      {activeSpecies.commonNames.si && (
                        <span>සිං: {activeSpecies.commonNames.si}</span>
                      )}
                      {activeSpecies.commonNames.ta && (
                        <span>த: {activeSpecies.commonNames.ta}</span>
                      )}
                    </div>

                    {/* Identifying Keys */}
                    <div className="space-y-1">
                      <strong className="text-[11px] text-emerald-300 block uppercase font-bold tracking-wider">
                        Field Identification Keys:
                      </strong>
                      <ul className="text-[11px] text-slate-200 space-y-0.5 list-disc pl-3.5 leading-snug">
                        {activeSpecies.identifyingFeatures.slice(0, 2).map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Ecological Role */}
                    <div className="bg-white/10 p-2.5 rounded-xl text-[11px] text-slate-200 space-y-0.5">
                      <strong className="text-emerald-300 block text-[10px] uppercase font-bold">
                        Ecological Niche:
                      </strong>
                      <p className="leading-snug">{activeSpecies.ecologicalRole}</p>
                    </div>
                  </div>

                  {/* Actions on Card Back */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoice();
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                      title="Audio Field Guide Voice"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Voice Guide</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSpecies(activeSpecies);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Full Guide</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No species in this collection.</p>
          )}

          {/* Card Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-sm mt-4 gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleMarkMastered}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 text-white ${
                activeSpecies && masteredIds.has(activeSpecies.id)
                  ? 'bg-emerald-600'
                  : currentTheme.primaryBg
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {activeSpecies && masteredIds.has(activeSpecies.id)
                  ? 'Mastered'
                  : 'Master (+25 XP)'}
              </span>
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
