import React from 'react';
import { Bookmark, MapPin, Navigation, Trash2, ArrowUpRight, ShieldCheck, Clock, FileSearch } from 'lucide-react';
import { SavedPlaceItem, VerifiedCandidate } from '../types/trace';

interface SavedPlacesViewProps {
  savedPlaces: SavedPlaceItem[];
  onRemoveSaved: (id: string) => Promise<void>;
  onInspectEvidence: (candidate: VerifiedCandidate) => void;
  onNavigateHome: () => void;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  savedPlaces,
  onRemoveSaved,
  onInspectEvidence,
  onNavigateHome,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
            <span>Saved Food Trails</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mt-1">
            Your Bookmarked Real Places
          </h2>
          <p className="text-xs text-slate-400">
            Verified food establishments and stalls saved from your previous photo traces.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          {savedPlaces.length} Saved {savedPlaces.length === 1 ? 'Place' : 'Places'}
        </span>
      </div>

      {/* Places List or Empty State */}
      {savedPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPlaces.map((item) => {
            const cand = item.candidate;
            const dateStr = new Date(item.savedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition space-y-3.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {cand.verification_level || 'VERIFIED'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cand.amenity_type?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mt-1">
                      {cand.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => onRemoveSaved(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Dish & Notes */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1">
                  <div className="text-amber-300 font-bold">
                    Dish: {item.dishName || cand.menu_item?.dish_name}
                  </div>
                  {item.userNotes && (
                    <div className="text-slate-400 italic font-sans text-[11px]">
                      "{item.userNotes}"
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="truncate">{cand.address}</span>
                </div>

                {/* Saved At & Match Score */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Saved on {dateStr}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {cand.match_score}% Match
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onInspectEvidence(cand)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition flex items-center space-x-1"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-amber-400" />
                    <span>Evidence</span>
                  </button>

                  <a
                    href={cand.navigation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-md transition flex items-center space-x-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                    <ArrowUpRight className="w-3 h-3 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">
            No Saved Places Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you discover real street food stalls or restaurants through a food trace, click "Save Place" to bookmark them here.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs shadow-md"
            >
              Start a Food Trace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
