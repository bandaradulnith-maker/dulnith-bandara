import React, { useState } from 'react';
import {
  User,
  Shield,
  Download,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
  Globe,
  Settings,
  Share2,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { UserProfile, Observation, Species, AppTheme } from '../types/biodiversity';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { THEME_CONFIGS } from '../utils/theme';

interface ProfileTabProps {
  user: UserProfile;
  observations: Observation[];
  speciesList: Species[];
  currentLang: Language;
  setLang: (lang: Language) => void;
  onSelectObservation: (obs: Observation) => void;
  onUpdatePrivacy: (settings: { hideExactCoordinates: boolean; publicProfile: boolean }) => void;
  theme?: AppTheme;
  setTheme?: (theme: AppTheme) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  observations,
  speciesList,
  currentLang,
  setLang,
  onSelectObservation,
  onUpdatePrivacy,
  theme = 'forest',
  setTheme,
}) => {
  const t = TRANSLATIONS[currentLang];
  const currentTheme = THEME_CONFIGS[theme];
  const [journalFilter, setJournalFilter] = useState<'all' | 'verified' | 'mine'>('all');
  const [hideCoords, setHideCoords] = useState(user.privacySettings.hideExactCoordinates);
  const [publicProf, setPublicProf] = useState(user.privacySettings.publicProfile);

  const myObservations = observations.filter((o) => o.userId === user.id);
  const distinctSpeciesCount = new Set(myObservations.map((o) => o.confirmedSpeciesId || o.suggestedSpecies?.scientificName)).size;

  const handleToggleCoords = () => {
    const nextVal = !hideCoords;
    setHideCoords(nextVal);
    onUpdatePrivacy({ hideExactCoordinates: nextVal, publicProfile: publicProf });
  };

  const handleToggleProfile = () => {
    const nextVal = !publicProf;
    setPublicProf(nextVal);
    onUpdatePrivacy({ hideExactCoordinates: hideCoords, publicProfile: nextVal });
  };

  // Export Journal to CSV
  const handleExportCSV = () => {
    const headers = 'ID,SpeciesCommon,ScientificName,Status,Date,Place,Habitat,Notes\n';
    const rows = myObservations
      .map((o) => {
        const common = `"${o.suggestedSpecies?.commonName || 'Unknown'}"`;
        const sci = `"${o.suggestedSpecies?.scientificName || 'Unknown'}"`;
        const status = `"${o.identificationStatus}"`;
        const date = `"${o.observedAt}"`;
        const place = `"${o.approximateLocation.placeName}"`;
        const habitat = `"${o.habitat}"`;
        const notes = `"${(o.notes || '').replace(/"/g, '""')}"`;
        return `${o.id},${common},${sci},${status},${date},${place},${habitat},${notes}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bioquest_journal_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-4">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="w-18 h-18 rounded-2xl object-cover ring-2 ring-emerald-600/30 shadow-md"
          />
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {user.displayName}
            </h1>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Level {user.level} Naturalist
              </span>
            </div>
          </div>
        </div>

        {/* Observation Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {myObservations.length}
            </span>
            <p className="text-[10px] text-slate-500 font-medium">My Records</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-lg font-bold text-emerald-800 tabular-nums">
              {distinctSpeciesCount}
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Unique Species</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-lg font-bold text-blue-800 tabular-nums">
              {myObservations.filter((o) => o.identificationStatus === 'expert-verified').length}
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Expert Verified</p>
          </div>
        </div>
      </div>

      {/* Observation Journal Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {t.observationJournal}
            </h2>
            <p className="text-[11px] text-slate-500">
              Personal field logs & community evidence
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Journal Entries List */}
        <div className="space-y-2.5 pt-1">
          {myObservations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No observations recorded yet. Use the camera to log your first specimen!
            </p>
          ) : (
            myObservations.map((obs) => (
              <div
                key={obs.id}
                onClick={() => onSelectObservation(obs)}
                className="border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={obs.photoUrl}
                    alt={obs.suggestedSpecies?.commonName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {obs.suggestedSpecies?.commonName || 'Specimen'}
                    </h4>
                    <p className="text-[11px] italic font-serif text-slate-500 truncate mt-0.5">
                      {obs.suggestedSpecies?.scientificName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      {new Date(obs.observedAt).toLocaleDateString()} · {obs.approximateLocation.placeName}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
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
                    {obs.communityReviews.length} reviews
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Field Privacy & Conservation Settings */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>Conservation Privacy & Preferences</span>
        </h3>

        <div className="space-y-3 pt-1 text-xs text-slate-700">
          {/* Mask GPS Coordinates */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                Generalize Coordinates of Vulnerable Species
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Fuzzes GPS to 5km radius to protect threatened wildlife from poaching and disturbance.
              </p>
            </div>
            <button
              onClick={handleToggleCoords}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                hideCoords ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  hideCoords ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Public Profile */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">
                Share Observations with Biodiversity Researchers
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Contribute anonymized sighting records to open citizen-science aggregators.
              </p>
            </div>
            <button
              onClick={handleToggleProfile}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                publicProf ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  publicProf ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">
                Display Language
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Supported: English, Sinhala (සිංහල), Tamil (தமிழ்)
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  currentLang === 'en' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  currentLang === 'si' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                සිං
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  currentLang === 'ta' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                த
              </button>
            </div>
          </div>

          {/* Theme Selector (Forest, Green Ocean, Terra Earth) */}
          {setTheme && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">
                  Visual Nature Theme
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Choose between Deep Forest, Green Ocean, or Terra Earth.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTheme('forest')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    theme === 'forest' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Forest
                </button>
                <button
                  onClick={() => setTheme('ocean')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    theme === 'ocean' ? 'bg-teal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ocean
                </button>
                <button
                  onClick={() => setTheme('earth')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    theme === 'earth' ? 'bg-amber-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Earth
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
