import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Bird,
  Leaf,
  Flame,
  Info,
} from 'lucide-react';
import { Mission, Badge, UserProfile } from '../types/biodiversity';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface MissionsTabProps {
  missions: Mission[];
  user: UserProfile;
  currentLang: Language;
  onClaimReward: (missionId: string) => void;
  onOpenIdentify: () => void;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  missions,
  user,
  currentLang,
  onClaimReward,
  onOpenIdentify,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedMission, setSelectedMission] = useState<Mission | null>(missions[0] || null);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handleClaim = (mission: Mission) => {
    onClaimReward(mission.id);
    setClaimedNotice(`+${mission.rewardPoints} XP claimed for completing "${mission.title}"!`);
    setTimeout(() => setClaimedNotice(null), 4000);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Explorer':
        return 'bg-emerald-100 text-emerald-800';
      case 'Naturalist':
        return 'bg-blue-100 text-blue-800';
      case 'Master Tracker':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 leading-tight">
          BioQuest Field Missions
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Participate in ethical nature surveys and citizen-science expeditions
        </p>
      </div>

      {/* Claimed Toast Alert */}
      {claimedNotice && (
        <div className="bg-emerald-800 text-white p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{claimedNotice}</span>
        </div>
      )}

      {/* Level Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
            Current Standing
          </span>
          <h2 className="text-base font-bold text-white">
            Level {user.level}: {user.levelTitle}
          </h2>
          <p className="text-xs text-emerald-200">
            Total {user.xp} Discovery XP Earned
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-amber-300 shadow-inner">
          <Award className="w-6 h-6" />
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Field Expedition Badges ({user.earnedBadges.length})
          </h3>
          <span className="text-[11px] text-emerald-800 font-semibold">Verified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {user.earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-2.5 text-center flex flex-col items-center justify-between space-y-1"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <h4 className="font-bold text-[11px] text-slate-800 leading-tight line-clamp-1">
                {badge.name}
              </h4>
              <p className="text-[9px] text-slate-500 line-clamp-2 leading-tight">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Expedition Objectives
        </h3>

        {missions.map((m) => {
          const isFinished = (m.currentCount || 0) >= m.targetCount;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMission(m)}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all cursor-pointer space-y-3 ${
                selectedMission?.id === m.id
                  ? 'border-emerald-700 ring-2 ring-emerald-600/10'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      m.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getDifficultyBadge(
                          m.difficulty
                        )}`}
                      >
                        {m.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        +{m.rewardPoints} XP
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {m.currentCount || 0}/{m.targetCount}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    m.isCompleted ? 'bg-emerald-600' : 'bg-emerald-700'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      ((m.currentCount || 0) / m.targetCount) * 100
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {m.description}
              </p>

              {/* Expanded details when selected */}
              {selectedMission?.id === m.id && (
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                    <p className="font-bold text-slate-800 text-[11px]">
                      🔬 Educational Objective:
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {m.educationalObjective}
                    </p>
                    <p className="font-bold text-slate-800 text-[11px] pt-1">
                      🛡️ Safe Wildlife Guidelines:
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {m.safetyGuidelines}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFinished && !m.isCompleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(m);
                        }}
                        className="flex-1 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all text-xs"
                      >
                        Claim {m.rewardPoints} XP Reward
                      </button>
                    ) : m.isCompleted ? (
                      <div className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-200 py-2 rounded-xl text-center font-semibold text-xs">
                        ✓ Mission Completed
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenIdentify();
                        }}
                        className="flex-1 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Log Field Observation</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
