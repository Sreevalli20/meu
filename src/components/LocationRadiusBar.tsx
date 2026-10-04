import React, { useState } from 'react';
import { MapPin, Navigation, Search, Sliders, Check, Loader2 } from 'lucide-react';
import { SearchLocation } from '../types/trace';
import { geocodeLocation } from '../services/api';

interface LocationRadiusBarProps {
  location: SearchLocation | null;
  radiusKm: number;
  onLocationChange: (loc: SearchLocation) => void;
  onRadiusChange: (radius: number) => void;
  onRefreshSearch: () => void;
  isSearching: boolean;
}

export const LocationRadiusBar: React.FC<LocationRadiusBarProps> = ({
  location,
  radiusKm,
  onLocationChange,
  onRadiusChange,
  onRefreshSearch,
  isSearching,
}) => {
  const [query, setQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeocoding(false);
        onLocationChange({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          displayName: `GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`,
          source: 'browser_gps',
        });
      },
      (err) => {
        setIsGeocoding(false);
        alert(`Location permission denied or unavailable: ${err.message}. You can search manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsGeocoding(true);
    try {
      const results = await geocodeLocation(query);
      setSuggestions(results);
      setShowSuggestions(true);
      if (results.length > 0) {
        const top = results[0];
        onLocationChange({
          lat: parseFloat(top.lat),
          lon: parseFloat(top.lon),
          displayName: top.display_name.split(',').slice(0, 2).join(','),
          source: 'manual_search',
        });
      }
    } catch (err) {
      console.error('Geocode search failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const selectSuggestion = (item: any) => {
    onLocationChange({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name.split(',').slice(0, 2).join(','),
      source: 'manual_search',
    });
    setQuery(item.display_name.split(',').slice(0, 2).join(','));
    setShowSuggestions(false);
  };

  if (!location) {
    return (
      <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-semibold text-white text-sm">
              Location Required
            </p>
            <p className="text-xs text-slate-400">
              Please enable GPS or search manually to find nearby places.
            </p>
          </div>
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGeocoding}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center space-x-2"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Use GPS</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Current Active Location Display */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Active Search Area
              </span>
              {location && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {location.source === 'browser_gps' ? 'Live GPS' : 'Geocoded City'}
                </span>
              )}
            </div>
            <p className="font-heading font-semibold text-white text-base truncate max-w-xs">
              {location ? location.displayName : 'Location not set'}
            </p>
          </div>
        </div>

        {/* Manual Geocode Search Form */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={handleSearchAddress} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, district, or landmark..."
              className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <div className="absolute right-1.5 top-1.5 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGeocoding}
                title="Use Current Device Location"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                {isGeocoding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
              >
                Go
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 max-h-56 overflow-y-auto">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(item)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition flex items-center space-x-2 truncate"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Radius Selector */}
        <div className="flex items-center space-x-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono px-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Radius:</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 3, 5, 10, 20].map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  radiusKm === r
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
