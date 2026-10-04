import React, { useState } from 'react';
import { MapPin, Navigation, Search, Sliders, Check, Loader2, AlertCircle } from 'lucide-react';
import { SearchLocation, LocationState } from '../types/trace';
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
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Reverse geocode GPS coordinates to get address
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PANI-PATH/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.display_name;
        const parts = addr.split(',').slice(0, 3).join(',');
        return parts || `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }
    return `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('gps_unavailable');
      setLocationError('Geolocation is not supported by your browser. Please search manually.');
      return;
    }

    setLocationState('requesting_gps');
    setLocationError(null);
    setIsGeocoding(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        console.log('[GPS SUCCESS] Coordinates obtained:', { lat, lon });

        // Reverse geocode to get address
        const displayName = await reverseGeocode(lat, lon);

        setLocationState('gps_success');
        setIsGeocoding(false);

        onLocationChange({
          lat,
          lon,
          displayName,
          source: 'browser_gps',
        });

        console.log('[GPS SUCCESS] Location set:', { lat, lon, displayName });
      },
      (err) => {
        setIsGeocoding(false);
        console.error('[GPS ERROR]', err);

        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationState('permission_denied');
          setLocationError('Browser location permission was denied. Please search manually using the address search box.');
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setLocationState('gps_unavailable');
          setLocationError('Location is unavailable. Please search manually.');
        } else if (err.code === 3) {
          // TIMEOUT
          setLocationState('gps_unavailable');
          setLocationError('Location request timed out. Please search manually.');
        } else {
          setLocationState('error');
          setLocationError(`Location error: ${err.message}. Please search manually.`);
        }
      },
      {
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 0, // Force fresh GPS reading
      }
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLocationState('manual_search');
    setLocationError(null);
    setIsGeocoding(true);

    try {
      console.log('[MANUAL SEARCH] Querying:', query);
      const results = await geocodeLocation(query);
      console.log('[MANUAL SEARCH] Results:', results.length);

      setSuggestions(results);
      setShowSuggestions(true);

      if (results.length > 0) {
        const top = results[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);
        const displayName = top.display_name.split(',').slice(0, 2).join(',');

        console.log('[MANUAL SUCCESS] Geocoded:', { lat, lon, displayName });

        setLocationState('manual_success');
        onLocationChange({
          lat,
          lon,
          displayName,
          source: 'manual_search',
        });
      } else {
        setLocationState('error');
        setLocationError('No results found for that address. Try a different search term.');
      }
    } catch (err) {
      console.error('[MANUAL ERROR]', err);
      setLocationState('error');
      setLocationError('Geocoding service temporarily unavailable. Please try again.');
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
        <div className="flex flex-col gap-4">
          {/* Error message if GPS failed */}
          {locationError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{locationError}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-white text-sm">
                Location Required
              </p>
              <p className="text-xs text-slate-400">
                Enable GPS or search manually to find nearby places.
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

          {/* Manual search always available */}
          <div className="relative">
            <form onSubmit={handleSearchAddress} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Or search: city, district, or landmark..."
                className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <div className="absolute right-1.5 top-1.5 flex items-center space-x-1">
                <button
                  type="submit"
                  disabled={isGeocoding}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
                >
                  Search
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
                  {location.source === 'browser_gps' ? 'GPS' : 'Manual / Geocoded'}
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
