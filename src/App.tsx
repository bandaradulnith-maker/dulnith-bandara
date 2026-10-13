/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/HomeTab';
import { DiscoverTab } from './components/DiscoverTab';
import { MapTab } from './components/MapTab';
import { MissionsTab } from './components/MissionsTab';
import { ProfileTab } from './components/ProfileTab';
import { IdentifyModal } from './components/IdentifyModal';
import { SpeciesDetailModal } from './components/SpeciesDetailModal';
import { CompareModal } from './components/CompareModal';
import { BioGuideDrawer } from './components/BioGuideDrawer';
import { ObservationModal } from './components/ObservationModal';
import { ManualObservationModal } from './components/ManualObservationModal';
import { FlashcardsModal } from './components/FlashcardsModal';

import {
  Species,
  Observation,
  Mission,
  UserProfile,
  OrganismGroup,
  AppTheme,
} from './types/biodiversity';
import {
  INITIAL_SPECIES_LIST,
  INITIAL_OBSERVATIONS,
  INITIAL_MISSIONS,
  INITIAL_USER,
} from './data/mockBiodiversityData';
import { Language } from './utils/i18n';
import { THEME_CONFIGS } from './utils/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'map' | 'missions' | 'profile'>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [theme, setTheme] = useState<AppTheme>('forest');

  // App Data
  const [speciesList, setSpeciesList] = useState<Species[]>(INITIAL_SPECIES_LIST);
  const [observations, setObservations] = useState<Observation[]>(INITIAL_OBSERVATIONS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Modals & Drawers State
  const [isIdentifyOpen, setIsIdentifyOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareInitialA, setCompareInitialA] = useState<Species | null>(null);
  const [compareInitialB, setCompareInitialB] = useState<Species | null>(null);
  const [isBioGuideOpen, setIsBioGuideOpen] = useState(false);
  const [bioGuideContextSpecies, setBioGuideContextSpecies] = useState<string | null>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  // Global window paste & drag-drop listener for Auto-Identify Mode
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          setIsIdentifyOpen(true);
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // Load backend data if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spRes, obsRes, misRes, usrRes] = await Promise.all([
          fetch('/api/species').catch(() => null),
          fetch('/api/observations').catch(() => null),
          fetch('/api/missions').catch(() => null),
          fetch('/api/user').catch(() => null),
        ]);

        if (spRes && spRes.ok) {
          const spData = await spRes.json();
          if (Array.isArray(spData) && spData.length > 0) setSpeciesList(spData);
        }
        if (obsRes && obsRes.ok) {
          const obsData = await obsRes.json();
          if (Array.isArray(obsData) && obsData.length > 0) setObservations(obsData);
        }
        if (misRes && misRes.ok) {
          const misData = await misRes.json();
          if (Array.isArray(misData) && misData.length > 0) setMissions(misData);
        }
        if (usrRes && usrRes.ok) {
          const usrData = await usrRes.json();
          if (usrData && usrData.id) setUser(usrData);
        }
      } catch (err) {
        console.warn('Backend data sync initialized with local state:', err);
      }
    };

    fetchData();
  }, []);

  // Save new observation
  const handleSaveObservation = async (data: {
    photoUrl: string;
    organismGroup: OrganismGroup;
    suggestedSpecies: any;
    notes: string;
    placeName: string;
  }) => {
    const newObs: Observation = {
      id: `obs_${Date.now()}`,
      userId: user.id,
      userName: user.displayName,
      userAvatar: user.avatar,
      photoUrl: data.photoUrl,
      suggestedSpecies: data.suggestedSpecies,
      identificationStatus: 'ai-suggested',
      observedAt: new Date().toISOString(),
      approximateLocation: {
        placeName: data.placeName || 'Field Location',
        lat: 6.4 + Math.random() * 0.2,
        lng: 80.4 + Math.random() * 0.2,
        generalized: user.privacySettings.hideExactCoordinates,
      },
      habitat: 'Wet Evergreen Sub-canopy',
      organismGroup: data.organismGroup,
      notes: data.notes || '',
      visibility: 'public',
      communityReviews: [],
      dataSource: 'BIOQUEST Field App',
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately
    setObservations((prev) => [newObs, ...prev]);
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      streakDays: prev.streakDays,
    }));

    // Update mission counts
    setMissions((prev) =>
      prev.map((m) => {
        const isMatch =
          (m.category === 'birds' && data.organismGroup === 'bird') ||
          (m.category === 'pollinators' && data.organismGroup === 'insect') ||
          (m.category === 'flora' && data.organismGroup === 'plant');
        if (isMatch) {
          const count = (m.currentCount || 0) + 1;
          return {
            ...m,
            currentCount: count,
            isCompleted: count >= m.targetCount,
          };
        }
        return m;
      })
    );

    // Persist to server
    try {
      await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObs),
      });
    } catch (err) {
      console.warn('Failed to sync observation to server:', err);
    }
  };

  // Submit community review
  const handleSubmitReview = async (obsId: string, reviewData: any) => {
    try {
      const res = await fetch(`/api/observations/${obsId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      if (res.ok) {
        const { observation: updatedObs } = await res.json();
        setObservations((prev) =>
          prev.map((o) => (o.id === obsId ? updatedObs : o))
        );
        setSelectedObservation(updatedObs);
      }
    } catch (err) {
      console.warn('Review submission error:', err);
      // Fallback local update
      setObservations((prev) =>
        prev.map((o) => {
          if (o.id === obsId) {
            const rev = {
              id: `rev_${Date.now()}`,
              observationId: obsId,
              reviewerId: user.id,
              reviewerName: user.displayName,
              reviewerRole: user.role,
              isExpert: reviewData.isExpert,
              suggestedSpeciesName: reviewData.suggestedSpeciesName,
              reviewStatus: reviewData.reviewStatus,
              evidence: reviewData.evidence,
              comments: reviewData.comments,
              createdAt: new Date().toISOString(),
            };
            const updated = {
              ...o,
              identificationStatus:
                reviewData.isExpert && reviewData.reviewStatus === 'approved'
                  ? ('expert-verified' as const)
                  : ('community-supported' as const),
              communityReviews: [...o.communityReviews, rev],
            };
            setSelectedObservation(updated);
            return updated;
          }
          return o;
        })
      );
    }
  };

  // Claim mission reward
  const handleClaimReward = async (missionId: string) => {
    const mis = missions.find((m) => m.id === missionId);
    if (!mis) return;

    setUser((prev) => ({
      ...prev,
      xp: prev.xp + mis.rewardPoints,
    }));

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, isCompleted: true } : m))
    );

    try {
      await fetch(`/api/missions/${missionId}/claim`, { method: 'POST' });
    } catch (err) {
      console.warn('Server mission claim sync failed:', err);
    }
  };

  const handleOpenBioGuideWithContext = (speciesName: string) => {
    setBioGuideContextSpecies(speciesName);
    setIsBioGuideOpen(true);
  };

  const handleOpenCompare = (speciesA?: Species, speciesB?: Species) => {
    setCompareInitialA(speciesA || null);
    setCompareInitialB(speciesB || null);
    setIsCompareOpen(true);
  };

  const currentTheme = THEME_CONFIGS[theme];

  return (
    <div
      className="min-h-screen text-slate-800 antialiased font-sans selection:bg-emerald-200 transition-colors duration-300"
      style={{ backgroundColor: currentTheme.bodyBg }}
    >
      {/* Navigation Top Header & Bottom Tab Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIdentify={() => setIsIdentifyOpen(true)}
        onOpenBioGuide={() => {
          setBioGuideContextSpecies(null);
          setIsBioGuideOpen(true);
        }}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        currentLang={currentLang}
        setLang={setCurrentLang}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Tab Content */}
      <main className="w-full">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            speciesList={speciesList}
            observations={observations}
            missions={missions}
            currentLang={currentLang}
            onOpenIdentify={() => setIsIdentifyOpen(true)}
            onOpenFlashcards={() => setIsFlashcardsOpen(true)}
            onSelectSpecies={(sp) => setSelectedSpecies(sp)}
            onSelectObservation={(obs) => setSelectedObservation(obs)}
            onGoToTab={(tab) => setActiveTab(tab)}
            theme={theme}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverTab
            speciesList={speciesList}
            currentLang={currentLang}
            onSelectSpecies={(sp) => setSelectedSpecies(sp)}
            onOpenCompare={handleOpenCompare}
            onOpenFlashcards={() => setIsFlashcardsOpen(true)}
            theme={theme}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            observations={observations}
            currentLang={currentLang}
            onSelectObservation={(obs) => setSelectedObservation(obs)}
            onOpenIdentify={() => setIsIdentifyOpen(true)}
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsTab
            missions={missions}
            user={user}
            currentLang={currentLang}
            onClaimReward={handleClaimReward}
            onOpenIdentify={() => setIsIdentifyOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            observations={observations}
            speciesList={speciesList}
            currentLang={currentLang}
            setLang={setCurrentLang}
            onSelectObservation={(obs) => setSelectedObservation(obs)}
            onUpdatePrivacy={(settings) =>
              setUser((prev) => ({ ...prev, privacySettings: settings }))
            }
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <IdentifyModal
        isOpen={isIdentifyOpen}
        onClose={() => setIsIdentifyOpen(false)}
        onSaveObservation={handleSaveObservation}
        onOpenCompare={handleOpenCompare}
        onOpenBioGuideWithContext={handleOpenBioGuideWithContext}
        currentLang={currentLang}
        theme={theme}
      />

      <SpeciesDetailModal
        species={selectedSpecies}
        onClose={() => setSelectedSpecies(null)}
        onOpenCompare={(sp) => handleOpenCompare(sp)}
        onOpenBioGuideWithContext={handleOpenBioGuideWithContext}
        currentLang={currentLang}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        speciesList={speciesList}
        initialSpeciesA={compareInitialA}
        initialSpeciesB={compareInitialB}
      />

      <BioGuideDrawer
        isOpen={isBioGuideOpen}
        onClose={() => setIsBioGuideOpen(false)}
        contextSpecies={bioGuideContextSpecies}
      />

      <ObservationModal
        observation={selectedObservation}
        onClose={() => setSelectedObservation(null)}
        currentUser={user}
        onSubmitReview={handleSubmitReview}
      />

      <ManualObservationModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSubmit={handleSaveObservation}
      />

      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        speciesList={speciesList}
        theme={theme}
        onSelectSpecies={(sp) => setSelectedSpecies(sp)}
        onAddMasteryXP={(xp) => setUser((prev) => ({ ...prev, xp: prev.xp + xp }))}
      />
    </div>
  );
}
