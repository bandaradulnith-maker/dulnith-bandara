import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  User,
} from 'lucide-react';
import { Observation, CommunityReview, UserProfile } from '../types/biodiversity';

interface ObservationModalProps {
  observation: Observation | null;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitReview: (obsId: string, reviewData: any) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  observation,
  onClose,
  currentUser,
  onSubmitReview,
}) => {
  if (!observation) return null;

  const [reviewStatus, setReviewStatus] = useState<'approved' | 'request_evidence' | 'disputed'>('approved');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceNotes.trim()) return;

    setIsSubmitting(true);
    onSubmitReview(observation.id, {
      reviewerName: currentUser.displayName,
      reviewerRole: currentUser.role,
      isExpert: currentUser.role === 'field_researcher' || currentUser.role === 'expert_naturalist',
      suggestedSpeciesName: observation.suggestedSpecies?.scientificName || 'Verified Specimen',
      reviewStatus,
      evidence: evidenceNotes,
      comments: evidenceNotes,
    });

    setEvidenceNotes('');
    setShowReviewForm(false);
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expert-verified':
        return { label: 'Expert-Verified', bg: 'bg-emerald-100 text-emerald-800' };
      case 'community-supported':
        return { label: 'Community-Supported', bg: 'bg-blue-100 text-blue-800' };
      case 'disputed':
        return { label: 'Identification Disputed', bg: 'bg-red-100 text-red-800' };
      default:
        return { label: 'AI-Suggested', bg: 'bg-amber-100 text-amber-800' };
    }
  };

  const statusBadge = getStatusBadge(observation.identificationStatus);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={observation.photoUrl}
            alt={observation.suggestedSpecies?.commonName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${statusBadge.bg}`}
            >
              {statusBadge.label}
            </span>
            <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
              {observation.suggestedSpecies?.commonName || 'Unclassified Specimen'}
            </h2>
            <p className="text-xs italic font-serif text-white/90 drop-shadow-sm mt-0.5">
              {observation.suggestedSpecies?.scientificName}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Observer: {observation.userName}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(observation.observedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                {observation.approximateLocation.placeName}{' '}
                {observation.approximateLocation.generalized && (
                  <strong className="text-emerald-800 font-medium">
                    (Coordinate Masked for Taxon Safety)
                  </strong>
                )}
              </span>
            </div>

            <div className="text-[11px] text-slate-600">
              <strong className="text-slate-800">Habitat: </strong>
              <span>{observation.habitat}</span>
            </div>

            {observation.notes && (
              <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/60 mt-1">
                "{observation.notes}"
              </p>
            )}
          </div>

          {/* AI Evidence Summary if present */}
          {observation.suggestedSpecies?.confidence && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>AI Computer Vision Confidence</span>
                </span>
                <span className="tabular-nums">
                  {Math.round(observation.suggestedSpecies.confidence * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-snug">
                Based on diagnostic morphological features. Verified by community naturalists below.
              </p>
            </div>
          )}

          {/* Community Reviews & Expert Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>Community & Expert Reviews ({observation.communityReviews.length})</span>
              </h3>

              {!showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  + Add Peer Review
                </button>
              )}
            </div>

            {/* Review List */}
            {observation.communityReviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                No reviews yet. Be the first field naturalist to confirm or provide evidence!
              </p>
            ) : (
              <div className="space-y-2.5">
                {observation.communityReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.reviewerName}</span>
                        {rev.isExpert && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Expert
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          rev.reviewStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : rev.reviewStatus === 'disputed'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {rev.reviewStatus}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium text-[11px]">
                      Suggested Identification: <em>{rev.suggestedSpeciesName}</em>
                    </p>

                    <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded-xl">
                      "{rev.evidence}"
                    </p>

                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Peer Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Submit Verification Evidence</span>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Your Assessment
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('approved')}
                      className={`p-2 rounded-xl font-semibold text-[11px] border transition-all ${
                        reviewStatus === 'approved'
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Confirm Match
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('request_evidence')}
                      className={`p-2 rounded-xl font-semibold text-[11px] border transition-all ${
                        reviewStatus === 'request_evidence'
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Need Evidence
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('disputed')}
                      className={`p-2 rounded-xl font-semibold text-[11px] border transition-all ${
                        reviewStatus === 'disputed'
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Dispute ID
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Diagnostic Morphological Key or Notes
                  </label>
                  <textarea
                    rows={3}
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Provide specific plumage, leaf, or body markings supporting your determination..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !evidenceNotes.trim()}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Publish Review
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
