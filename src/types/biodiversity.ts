export type AppTheme = 'forest' | 'ocean' | 'earth';

export type OrganismGroup =
  | 'mammal'
  | 'bird'
  | 'reptile'
  | 'amphibian'
  | 'insect'
  | 'plant'
  | 'fungi'
  | 'marine';

export type ConservationStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

export interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Species {
  id: string;
  scientificName: string;
  commonNames: {
    en: string;
    si?: string; // Sinhala
    ta?: string; // Tamil
  };
  group: OrganismGroup;
  taxonomy: Taxonomy;
  description: string;
  identifyingFeatures: string[];
  habitat: string;
  geographicRange: string;
  typicalDiet: string;
  behavior: string;
  reproduction?: string;
  ecologicalRole: string;
  conservationStatus: ConservationStatus;
  statusLabel: string;
  assessmentDate: string;
  threats: string[];
  conservationActions: string[];
  image: string;
  additionalImages?: string[];
  sourceCitations: { title: string; url: string; organization: string }[];
  verifiedNearby?: boolean;
}

export type IdentificationStatus =
  | 'unreviewed'
  | 'ai-suggested'
  | 'community-supported'
  | 'expert-verified'
  | 'disputed';

export interface CommunityReview {
  id: string;
  observationId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole:
    | 'community'
    | 'expert_naturalist'
    | 'botanist'
    | 'ornithologist'
    | 'citizen_scientist'
    | 'amateur_naturalist'
    | 'field_researcher';
  isExpert: boolean;
  suggestedSpeciesName: string;
  reviewStatus: 'approved' | 'request_evidence' | 'disputed';
  evidence: string;
  comments: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  photoUrl: string;
  additionalPhotos?: string[];
  suggestedSpecies?: {
    scientificName: string;
    commonName: string;
    confidence: number;
    alternativeCandidates?: {
      scientificName: string;
      commonName: string;
      distinction: string;
    }[];
  };
  confirmedSpeciesId?: string;
  identificationStatus: IdentificationStatus;
  observedAt: string;
  approximateLocation: {
    placeName: string;
    lat: number;
    lng: number;
    generalized: boolean; // Protect vulnerable species coordinates
  };
  habitat: string;
  organismGroup: OrganismGroup;
  notes: string;
  visibility: 'public' | 'community' | 'private';
  communityReviews: CommunityReview[];
  dataSource: string;
  isOfflineDraft?: boolean;
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'birds' | 'pollinators' | 'flora' | 'habitats' | 'ethics';
  difficulty: 'Explorer' | 'Naturalist' | 'Master Tracker';
  instructions: string;
  educationalObjective: string;
  safetyGuidelines: string;
  completionCriteria: string;
  targetCount: number;
  currentCount?: number;
  rewardPoints: number;
  rewardBadgeId?: string;
  iconName: string;
  isCompleted?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earnedAt?: string;
}

export interface IdentificationResult {
  outcome: 'strong_candidate' | 'multiple_candidates' | 'unable_to_identify';
  leadCandidate?: {
    commonName: string;
    scientificName: string;
    confidenceEstimate: number; // e.g. 0.92
    confidenceLabel: string; // "High confidence visual match"
    visibleFeatures: string[];
    habitat: string;
    geographicRange: string;
    diet: string;
    behavior: string;
    conservationStatus: ConservationStatus;
    statusLabel: string;
    ecologicalRole: string;
    similarSpecies: {
      name: string;
      distinguishingKeys: string;
    }[];
    sources: { title: string; organization: string }[];
  };
  alternativeCandidates?: {
    commonName: string;
    scientificName: string;
    distinguishingTraits: string;
    suggestedVerificationAngle: string;
  }[];
  uncertaintyExplanation?: string;
  insufficientEvidenceNotice?: string;
  photographAdvice?: string[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatar: string;
  role: 'field_researcher' | 'expert_naturalist' | 'citizen_scientist' | 'amateur_naturalist';
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  preferredLanguage: 'en' | 'si' | 'ta';
  privacySettings: {
    hideExactCoordinates: boolean;
    publicProfile: boolean;
  };
  earnedBadges: Badge[];
  favoriteSpeciesIds: string[];
}
