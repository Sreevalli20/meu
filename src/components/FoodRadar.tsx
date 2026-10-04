import React, { useState } from 'react';
import { Compass, Radio, MapPin, Navigation, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { VerifiedCandidate, SearchLocation } from '../types/trace';

interface FoodRadarProps {
  location: SearchLocation;
  radiusKm: number;
  candidates: VerifiedCandidate[];
  dishName: string;
  onSelectCandidate: (candidate: VerifiedCandidate) => void;
}

export const FoodRadar: React.FC<FoodRadarProps> = ({
  location,
  radiusKm,
  candidates,
  dishName,
  onSelectCandidate,
}) => {
  const [hoveredCandidate, setHoveredCandidate] = useState<VerifiedCandidate | null>(
    candidates[0] || null
  );

  // Calculate polar coordinates for radar projection based on real lat/lon relative to user center
  const getRadarPosition = (c: VerifiedCandidate, idx: number) => {
    const dLat = c.lat - location.lat;
    const dLon = c.lon - location.lon;
    
    // Bearing angle in radians
    let angle = Math.atan2(dLon, dLat);
    if (isNaN(angle)) {
      angle = (idx * (2 * Math.PI)) / Math.max(candidates.length, 1);
    }

    // Distance normalized to radar radius (80% max to stay inside outer ring)
    const normalizedDist = Math.min(c.distance_km / (radiusKm || 5), 0.95);
    const radiusPercent = Math.max(12, normalizedDist * 42); // 12% to 42% from center

    const x = 50 + radiusPercent * Math.sin(angle);
    const y = 50 - radiusPercent * Math.cos(angle);

    return { x, y };
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Gadget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Futuristic Food Radar Scanner</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mt-1">
            Real Food Radar: <span className="text-amber-300">"{dishName}"</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Scanning real registered establishments within {radiusKm}km of {location.displayName}.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>{candidates.length} Real Blips Verified</span>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Radar Canvas/Display */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-slate-950 border-2 border-amber-500/40 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Concentric Range Rings */}
            <div className="absolute inset-0 rounded-full border border-slate-800 pointer-events-none" />
            <div className="absolute w-[75%] h-[75%] rounded-full border border-slate-800/80 pointer-events-none" />
            <div className="absolute w-[50%] h-[50%] rounded-full border border-amber-500/20 pointer-events-none" />
            <div className="absolute w-[25%] h-[25%] rounded-full border border-amber-500/30 pointer-events-none" />

            {/* Radar Crosshairs */}
            <div className="absolute w-full h-[1px] bg-slate-800/60 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-slate-800/60 pointer-events-none" />

            {/* Animated Rotating Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div
                className="w-full h-full animate-radar origin-center"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(245, 158, 11, 0.03) 300deg, rgba(245, 158, 11, 0.3) 360deg)',
                }}
              />
            </div>

            {/* Center User Location Blip */}
            <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
              <span className="text-[9px] font-mono text-blue-300 font-bold mt-1 bg-slate-950/80 px-1 rounded">
                YOU
              </span>
            </div>

            {/* Real Business Radar Blips */}
            {candidates.map((cand, idx) => {
              const pos = getRadarPosition(cand, idx);
              const isHovered = hoveredCandidate?.id === cand.id;
              const isTop = cand.match_tier === 'BEST MATCH';
              const blipColor = isTop
                ? 'bg-emerald-400 border-emerald-200 shadow-emerald-500/50'
                : 'bg-amber-400 border-amber-200 shadow-amber-500/50';

              return (
                <div
                  key={cand.id}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => onSelectCandidate(cand)}
                  onMouseEnter={() => setHoveredCandidate(cand)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer transition-transform duration-200 group ${
                    isHovered ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${blipColor} shadow-lg flex items-center justify-center`}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-950">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Pulsing ring around blip */}
                  <div
                    className={`absolute -inset-1 rounded-full border border-amber-400/40 animate-ping opacity-60 pointer-events-none`}
                  />
                </div>
              );
            })}

            {/* Distance Marker Badges */}
            <span className="absolute top-2 font-mono text-[9px] text-slate-500 pointer-events-none">
              N • {radiusKm}km
            </span>
            <span className="absolute right-2 font-mono text-[9px] text-slate-500 pointer-events-none">
              E
            </span>
            <span className="absolute bottom-2 font-mono text-[9px] text-slate-500 pointer-events-none">
              S
            </span>
            <span className="absolute left-2 font-mono text-[9px] text-slate-500 pointer-events-none">
              W
            </span>
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-4 text-center">
            Click any radar blip to inspect its verifiable evidence chain.
          </p>
        </div>

        {/* Right Column: Active Radar Target Telemetry Card */}
        <div className="lg:col-span-5">
          {hoveredCandidate ? (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Target Acquired • {hoveredCandidate.match_tier}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {hoveredCandidate.match_score}% MATCH
                </span>
              </div>

              <div>
                <h4 className="font-heading font-bold text-xl text-white">
                  {hoveredCandidate.name}
                </h4>
                <div className="flex items-start space-x-2 text-xs text-slate-300 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{hoveredCandidate.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Distance</span>
                  <span className="font-bold text-white">{hoveredCandidate.distance_km} km</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Dish Status</span>
                  <span className="font-bold text-amber-300">
                    {hoveredCandidate.menu_item.listing_status === 'explicitly_listed'
                      ? 'Explicit Specialty'
                      : 'Cuisine Match'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                <p className="font-sans italic leading-relaxed">
                  "{hoveredCandidate.explanation}"
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => onSelectCandidate(hoveredCandidate)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
                >
                  View Evidence Chain
                </button>
                <a
                  href={hoveredCandidate.navigation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-md transition flex items-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                  <ArrowUpRight className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-mono">
                Move cursor over radar blips to lock onto a food target.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
