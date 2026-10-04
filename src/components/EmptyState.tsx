import React from 'react';
import { SearchX, ShieldAlert, ArrowRight, RefreshCw, Sliders } from 'lucide-react';

interface EmptyStateProps {
  dishName: string;
  locationName: string;
  radiusKm: number;
  onExpandRadius: () => void;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  dishName,
  locationName,
  radiusKm,
  onExpandRadius,
  onReset,
}) => {
  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-8 text-center shadow-xl backdrop-blur-md">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="font-heading font-bold text-xl text-white">
        No Verified Places Found in {radiusKm}km Radius
      </h3>

      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        We searched real OpenStreetMap business registries around <span className="text-slate-200 font-medium">"{locationName}"</span> for <span className="text-amber-300 font-medium">{dishName}</span>, but no verified listings match this exact radius.
      </p>

      {/* Trust Rule Disclaimer */}
      <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-400">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Anti-Hallucination Policy: We will never invent fake restaurants to fill this screen.</span>
      </div>

      {/* Recommendations */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onExpandRadius}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs shadow-md transition flex items-center space-x-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Expand Radius to 15km</span>
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Search Another Location / Photo</span>
        </button>
      </div>
    </div>
  );
};
