import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, RefreshCw, X, CheckCircle2, Sliders, Wand2, MapPin, Navigation, Search, Loader2, AlertCircle } from 'lucide-react';
import { ImageAdjustment, SearchLocation, LocationState } from '../types/trace';
import { ImageAdjustmentStudio } from './ImageAdjustmentStudio';
import { geocodeLocation } from '../services/api';

interface GadgetUploaderProps {
  onTrace: (payload: {
    imageBase64?: string;
    mimeType?: string;
    filenameHint?: string;
    location?: SearchLocation;
  }) => void;
  isTracing: boolean;
}

export const GadgetUploader: React.FC<GadgetUploaderProps> = ({ onTrace, isTracing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [filenameHint, setFilenameHint] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [showAdjustmentStudio, setShowAdjustmentStudio] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  // Location state
  const [location, setLocation] = useState<SearchLocation | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Content = result.split(',')[1];
      setSelectedImage(base64Content);
      setSelectedMimeType(file.type);
      setFilenameHint(file.name);
      setIsEnhanced(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied or unavailable in this browser.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl.split(',')[1]);
      setSelectedMimeType('image/jpeg');
      setFilenameHint('camera_capture.jpg');
      setIsEnhanced(false);
    }
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const openAdjustmentForCurrent = async () => {
    if (selectedImage) {
      setShowAdjustmentStudio(true);
    }
  };

  const handleApplyAdjustment = (enhancedBase64: string, adjustment: ImageAdjustment) => {
    setSelectedImage(enhancedBase64);
    setIsEnhanced(true);
    setShowAdjustmentStudio(false);
  };

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
      console.warn('[GPS] Reverse geocoding failed:', err);
    }
    return `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  };

  const handleGetCurrentLocation = () => {
    console.log('[GPS BUTTON CLICK] User clicked Locate Me button');

    if (!navigator.geolocation) {
      console.error('[GPS ERROR] navigator.geolocation not supported');
      setLocationState('gps_unavailable');
      setLocationError('Geolocation is not supported by your browser. Please search manually.');
      return;
    }

    console.log('[GPS REQUEST STARTED] Calling navigator.geolocation.getCurrentPosition');
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

        const newLocation: SearchLocation = {
          lat,
          lon,
          displayName,
          source: 'browser_gps',
        };
        setLocation(newLocation);

        console.log('[GPS LOCATION STATE UPDATED] Location set:', { lat, lon, displayName, source: 'browser_gps' });
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

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    console.log('[MANUAL LOCATION SEARCH] Querying:', locationQuery);
    setLocationState('manual_search');
    setLocationError(null);
    setIsGeocoding(true);

    try {
      const results = await geocodeLocation(locationQuery);
      console.log('[MANUAL LOCATION SEARCH] Results:', results.length);

      setLocationSuggestions(results);
      setShowLocationSuggestions(true);

      if (results.length > 0) {
        const top = results[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);
        const displayName = top.display_name.split(',').slice(0, 2).join(',');

        console.log('[MANUAL LOCATION SUCCESS] Geocoded:', { lat, lon, displayName });

        setLocationState('manual_success');
        const newLocation: SearchLocation = {
          lat,
          lon,
          displayName,
          source: 'manual_search',
        };
        setLocation(newLocation);
        setLocationQuery(displayName);
      } else {
        setLocationState('error');
        setLocationError('No results found for that address. Try a different search term.');
      }
    } catch (err) {
      console.error('[MANUAL LOCATION ERROR]', err);
      setLocationState('error');
      setLocationError('Geocoding service temporarily unavailable. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const selectLocationSuggestion = (item: any) => {
    const newLocation: SearchLocation = {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name.split(',').slice(0, 2).join(','),
      source: 'manual_search',
    };
    setLocation(newLocation);
    setLocationQuery(item.display_name.split(',').slice(0, 2).join(','));
    setShowLocationSuggestions(false);
  };

  const handleStartTrace = () => {
    if (!selectedImage) {
      alert('Please upload a food image first.');
      return;
    }

    if (!location) {
      alert('Location is required. Please click "Locate Me" or search for a location manually.');
      return;
    }

    console.log('[TRACE START] Calling onTrace with location:', {
      lat: location.lat,
      lon: location.lon,
      displayName: location.displayName,
      source: location.source,
    });

    onTrace({
      imageBase64: selectedImage,
      mimeType: selectedMimeType,
      filenameHint: isEnhanced ? `enhanced_${filenameHint}` : filenameHint,
      location,
    });
  };

  return (
    <div className="w-full">
      {/* Gadget Shell Box */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Futuristic Background Reticle & Glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title inside Gadget */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Multi-Agent Food Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
              "Show us the food. We'll find where it may actually exist."
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Upload an Instagram photo, friend's snapshot, or street food picture. Our vision agent extracts visual features, queries verified geospatial registries, and builds an audit-backed evidence chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={startCamera}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Use Camera</span>
            </button>
          </div>
        </div>

        {/* Live Camera View Modal/Area */}
        {showCamera && (
          <div className="mb-6 relative rounded-xl overflow-hidden border border-amber-500/40 bg-black aspect-video max-h-80 flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 flex items-center space-x-4">
              <button
                onClick={capturePhoto}
                className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-lg flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  if (stream) stream.getTracks().forEach((t) => t.stop());
                  setShowCamera(false);
                }}
                className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Drop Zone Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[220px] cursor-pointer ${
            dragActive
              ? 'border-amber-400 bg-amber-500/10'
              : selectedImage
              ? 'border-slate-700 bg-slate-950/60'
              : 'border-slate-700/80 hover:border-amber-500/60 bg-slate-950/40'
          }`}
        >
          {/* Futuristic Corner Reticles */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />

          {selectedImage ? (
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-xl group">
              <img
                src={`data:${selectedMimeType};base64,${selectedImage}`}
                alt="Uploaded food"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-mono truncate max-w-[180px]">{filenameHint || 'custom_upload.jpg'}</span>
                <div className="flex items-center space-x-1.5">
                  {isEnhanced && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                      ✨ Enhanced
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                    Ready to Trace
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                  setIsEnhanced(false);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500/80 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="font-heading font-semibold text-slate-200 text-base">
                Drop your food photograph here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WEBP (photos, reels screenshots, menu crops)
              </p>
            </div>
          )}
        </div>

        {/* Photo Enhancement Toolbar */}
        {selectedImage && (
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={openAdjustmentForCurrent}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono border border-slate-700 hover:border-amber-500/40 transition flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnhanced ? 'Adjust Filters (Active)' : 'Filter & Enhance Photo (Brightness, Contrast, Sharpness)'}</span>
            </button>
          </div>
        )}

        {/* Location Selection Section - Appears when image is selected */}
        {selectedImage && (
          <div className="mt-6 rounded-xl bg-slate-950/60 border border-slate-800 p-5">
            <div className="flex flex-col gap-4">
              {/* Error message if GPS failed */}
              {locationError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{locationError}</p>
                </div>
              )}

              {/* Current Location Display */}
              {location ? (
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">
                        Location Set
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {location.source === 'browser_gps' ? 'GPS' : 'Manual / Geocoded'}
                      </span>
                    </div>
                    <p className="font-heading font-semibold text-white text-sm truncate">
                      {location.displayName}
                    </p>
                  </div>
                  <button
                    onClick={() => setLocation(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Clear location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {/* GPS Button */}
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
                          <span>Locate Me</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Manual Search */}
                  <div className="relative">
                    <form onSubmit={handleSearchLocation} className="relative">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
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
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-12 z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 max-h-56 overflow-y-auto">
                        {locationSuggestions.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => selectLocationSuggestion(item)}
                            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition flex items-center space-x-2 truncate"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{item.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Button: Trace This Food */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Verifies real OpenStreetMap businesses & physical addresses</span>
          </div>

          <button
            onClick={handleStartTrace}
            disabled={isTracing}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2.5 shadow-xl ${
              isTracing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/25 cursor-pointer transform hover:-translate-y-0.5'
            }`}
          >
            {isTracing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Agents Tracing Food...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Find This Food Near Me</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Filter Studio Modal */}
      {showAdjustmentStudio && selectedImage && (
        <ImageAdjustmentStudio
          originalImageBase64={selectedImage}
          mimeType={selectedMimeType}
          onApplyAdjustment={handleApplyAdjustment}
          onCancel={() => setShowAdjustmentStudio(false)}
        />
      )}
    </div>
  );
};
