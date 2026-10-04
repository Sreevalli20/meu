import React from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  AlertCircle,
  FileSearch,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Star,
  MessageSquarePlus,
} from 'lucide-react';
import { VerifiedCandidate } from '../types/trace';

interface CandidateCardProps {
  candidate: VerifiedCandidate;
  rank: number;
  isSaved?: boolean;
  onInspectEvidence: (candidate: VerifiedCandidate) => void;
  onFocusOnMap?: (candidate: VerifiedCandidate) => void;
  onToggleSave?: (candidate: VerifiedCandidate) => void;
  onOpenReviewModal?: (candidate: VerifiedCandidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  rank,
  isSaved = false,
  onInspectEvidence,
  onFocusOnMap,
  onToggleSave,
  onOpenReviewModal,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BEST MATCH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'GOOD MATCH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'VERIFIED':
        return (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>VERIFIED</span>
          </span>
        );
      case 'PARTIALLY VERIFIED':
        return (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>PARTIALLY VERIFIED</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 82) return 'from-emerald-500 to-teal-600 text-white';
    if (score >= 68) return 'from-amber-500 to-orange-600 text-white';
    return 'from-blue-500 to-indigo-600 text-white';
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-200 hover:shadow-2xl">
      {/* Top Bar: Rank, Name, Tier, Score, Verification Level */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 flex-shrink-0 mt-0.5">
            #{rank}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getTierColor(
                  candidate.match_tier
                )}`}
              >
                {candidate.match_tier}
              </span>
              {getVerificationBadge(candidate.verification_level || 'PARTIALLY VERIFIED')}
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {candidate.amenity_type?.replace('_', ' ')}
              </span>
            </div>
            <h4 className="font-heading font-bold text-lg sm:text-xl text-white mt-1 group-hover:text-amber-300 transition">
              {candidate.name}
            </h4>
          </div>
        </div>

        {/* Right Header Badges: Match Score & Save Bookmark */}
        <div className="flex items-start space-x-2 flex-shrink-0">
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1 rounded-xl bg-gradient-to-r ${getScoreBadgeColor(
                candidate.match_score
              )} shadow-md flex items-center space-x-1.5`}
            >
              <span className="text-xs font-mono font-bold">{candidate.match_score}%</span>
              <span className="text-[10px] uppercase font-mono opacity-90">Match</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1">
              {candidate.distance_km} km away
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(candidate)}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isSaved ? 'Saved to bookmarks' : 'Save place'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Address & Physical Location */}
      <div className="mt-4 flex items-start space-x-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">{candidate.address}</span>
      </div>

      {/* Menu / Dish Verification Status + Community Rating */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Dish Verification Status:
          </span>
          <div className="flex items-center space-x-1.5 text-slate-200">
            {candidate.menu_item.listing_status === 'explicitly_listed' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="font-medium text-emerald-300">Explicit Specialty</span>
              </>
            ) : candidate.menu_item.listing_status === 'inferred_cuisine_specialty' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-medium text-amber-300">Cuisine Alignment</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-400">Unindexed Dish</span>
              </>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Community Rating:
            </span>
            {candidate.community_rating ? (
              <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{candidate.community_rating}</span>
                <span className="text-slate-400 font-normal text-[11px]">
                  ({candidate.review_count} visits)
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No reviews yet</span>
            )}
            </div>
          </div>

          {onOpenReviewModal && (
            <button
              onClick={() => onOpenReviewModal(candidate)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition flex items-center space-x-1"
            >
              <MessageSquarePlus className="w-3 h-3 text-amber-400" />
              <span>Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Evidence Checklist Summary */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-800/80">
        <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
          Verifiable Evidence Signals:
        </p>
        <div className="space-y-1">
          {candidate.evidence.verification_notes.slice(0, 2).map((note, i) => (
            <div key={i} className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
              <span className="truncate">{note}</span>
            </div>
          ))}
          {candidate.evidence.unverified_warnings.slice(0, 1).map((warning, i) => (
            <div key={i} className="flex items-center space-x-2 text-xs text-amber-400/80 font-mono">
              <span className="truncate">{warning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={() => onInspectEvidence(candidate)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono border border-slate-700 transition flex items-center space-x-1.5"
        >
          <FileSearch className="w-3.5 h-3.5 text-amber-400" />
          <span>Audit Evidence Chain</span>
        </button>

        <div className="flex items-center space-x-2">
          {onFocusOnMap && (
            <button
              onClick={() => onFocusOnMap(candidate)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition hidden sm:inline-flex items-center space-x-1"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Map</span>
            </button>
          )}

          <a
            href={candidate.navigation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-heading font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate</span>
            <ArrowUpRight className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
