import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { VerifiedCandidate, SearchLocation } from '../types/trace';

interface MapViewerProps {
  location: SearchLocation;
  radiusKm: number;
  candidates: VerifiedCandidate[];
  selectedCandidate: VerifiedCandidate | null;
  onSelectCandidate: (candidate: VerifiedCandidate) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  location,
  radiusKm,
  candidates,
  selectedCandidate,
  onSelectCandidate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lon],
        zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12,
        zoomControl: true,
      });

      // OpenStreetMap standard tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Update map center & zoom
    map.setView([location.lat, location.lon], radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12);

    // Update radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }
    radiusCircleRef.current = L.circle([location.lat, location.lon], {
      radius: radiusKm * 1000,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 6',
    }).addTo(map);

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Add user/search location marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 22px;
          height: 22px;
          background: #3b82f6;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([location.lat, location.lon], { icon: userIcon })
      .bindPopup(`<b>Search Origin</b><br/>${location.displayName}`)
      .addTo(markersLayerRef.current!);

    // Add candidate markers
    candidates.forEach((cand, idx) => {
      const isTop = cand.match_tier === 'BEST MATCH';
      const isGood = cand.match_tier === 'GOOD MATCH';
      const pinColor = isTop ? '#10b981' : isGood ? '#f59e0b' : '#6366f1';

      const candidateIcon = L.divIcon({
        className: 'custom-cand-marker',
        html: `
          <div style="
            background: ${pinColor};
            color: #0f172a;
            font-weight: 700;
            font-size: 11px;
            font-family: monospace;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>#${idx + 1}</span>
            <span>${cand.match_score}%</span>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = L.marker([cand.lat, cand.lon], { icon: candidateIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px;">
          <div style="font-size: 10px; font-weight: bold; color: ${pinColor}; text-transform: uppercase;">
            ${cand.match_tier} • ${cand.match_score}% MATCH
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
            ${cand.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            ${cand.address}
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
            <b>Distance:</b> ${cand.distance_km} km
          </div>
          <div style="margin-top: 8px;">
            <a href="${cand.navigation_url}" target="_blank" style="
              display: inline-block;
              background: #f59e0b;
              color: #0f172a;
              font-size: 11px;
              font-weight: bold;
              padding: 4px 10px;
              border-radius: 6px;
              text-decoration: none;
            ">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectCandidate(cand);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Invalidate map size to prevent gray tiles on container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [location, radiusKm, candidates]);

  // Focus on selected candidate when updated
  useEffect(() => {
    if (selectedCandidate && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedCandidate.lat, selectedCandidate.lon], 15, {
        animate: true,
      });
    }
  }, [selectedCandidate]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-3 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>You</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Best</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Good</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Possible</span>
        </div>
      </div>
    </div>
  );
};
