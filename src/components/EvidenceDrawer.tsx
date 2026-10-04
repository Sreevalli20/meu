import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  MapPin,
  Building,
  Utensils,
  Navigation,
  ArrowUpRight,
  Bookmark,
  Star,
  MessageSquare,
  MessageSquarePlus,
  Clock,
} from 'lucide-react';
import { VerifiedCandidate, UserReview } from '../types/trace';
import { fetchReviews } from '../services/api';

interface EvidenceDrawerProps {
  candidate: VerifiedCandidate | null;
  isSaved?: boolean;
  onClose: () => void;
  onOpenReviewModal?: (candidate: VerifiedCandidate) => void;
  onToggleSave?: (candidate: VerifiedCandidate) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  candidate,
  isSaved = false,
  onClose,
  onOpenReviewModal,
  onToggleSave,
}) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (candidate) {
      setLoadingReviews(true);
      fetchReviews(candidate.name)
        .then((res) => setReviews(res))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [candidate]);

  if (!candidate) return null;

  const { score_breakdown } = candidate.evidence;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                Verifiable Audit Trail
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                OSM ID: {candidate.osm_type}/{candidate.osm_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                {candidate.verification_level || 'VERIFIED'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mt-0.5">
              {candidate.name}
            </h3>
          </div>
        </div>

        {/* Match Score Banner & Actions */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">TOTAL EVIDENCE SCORE</p>
            <p className="text-2xl font-heading font-bold text-emerald-400">
              {candidate.match_score}<span className="text-sm text-slate-500"> / 100</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(candidate)}
                className={`p-2 rounded-xl border text-xs font-mono transition flex items-center space-x-1.5 ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            {onOpenReviewModal && (
              <button
                onClick={() => onOpenReviewModal(candidate)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition flex items-center space-x-1"
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                <span>Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs font-mono uppercase text-amber-400 tracking-wider mb-1">
            Why did we recommend this place?
          </p>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {candidate.explanation}
          </p>
        </div>

        {/* 5-Point Proof Matrix Score Breakdown */}
        <div className="mt-6">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
            5-Point Explainable Score Breakdown:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
            {/* 1. Business Found */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Registry Verification</span>
              </div>
              <span className="font-bold text-emerald-400">{score_breakdown.business_score} / 20</span>
            </div>

            {/* 2. Address Verified */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Physical Coordinates</span>
              </div>
              <span className="font-bold text-emerald-400">{score_breakdown.address_score} / 20</span>
            </div>

            {/* 3. Relevance */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Dish/Cuisine Match</span>
              </div>
              <span className="font-bold text-amber-400">{score_breakdown.relevance_score} / 25</span>
            </div>

            {/* 4. Menu Evidence */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Menu Verification</span>
              </div>
              <span className="font-bold text-amber-400">{score_breakdown.menu_score} / 20</span>
            </div>

            {/* 5. Proximity */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Geographic Proximity ({candidate.distance_km} km)</span>
              </div>
              <span className="font-bold text-cyan-400">{score_breakdown.proximity_score} / 15</span>
            </div>
          </div>
        </div>

        {/* Verified Signals vs Unverified Warnings */}
        <div className="mt-6 space-y-4">
          <div>
            <h5 className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-2">
              Confirmed Evidence Signals:
            </h5>
            <div className="space-y-1.5">
              {candidate.evidence.verification_notes.map((note, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-emerald-300/90 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-mono uppercase text-amber-400 tracking-wider mb-2">
              Unverified / Unavailable Flags (Anti-Fabrication Policy):
            </h5>
            <div className="space-y-1.5">
              {candidate.evidence.unverified_warnings.map((warn, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-amber-300/90 font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Reviews & Ratings Section */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h5 className="text-xs font-mono uppercase text-white font-bold tracking-wider">
                Community Food Trace Reviews ({reviews.length})
              </h5>
            </div>
            {onOpenReviewModal && (
              <button
                onClick={() => onOpenReviewModal(candidate)}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono underline"
              >
                + Leave Your Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-2.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{rev.userName}</span>
                      <span className="flex items-center text-amber-400 text-[11px] font-mono">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {rev.rating}/5
                      </span>
                      {rev.exactDishFound === 'yes' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                          ✓ Exact Dish Found
                        </span>
                      )}
                    </div>
                    {rev.pricePaid && (
                      <span className="font-mono text-slate-400 text-[11px]">
                        Paid: {rev.pricePaid}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">{rev.reviewText}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400 font-mono">
              No community reviews submitted yet for this venue. Visit and be the first to verify!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 italic">
            Backed by live OpenStreetMap data. Zero hallucinated menus.
          </p>

          <a
            href={candidate.navigation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Directions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
