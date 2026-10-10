import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  Rectangle,
  useMap,
} from '@vis.gl/react-google-maps';
import { BoundingBox } from '../types';
import {
  Search,
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface AreaPickerMapProps {
  selectedBbox: BoundingBox;
  selectedAreaName: string;
  onAreaChange: (name: string, bbox: BoundingBox) => void;
  heightClass?: string;
}

// Controller for camera panning & zooming
const MapCameraController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  return null;
};

// Internal map controls and interaction layer
const AreaPickerContent: React.FC<{
  selectedBbox: BoundingBox;
  selectedAreaName: string;
  onAreaChange: (name: string, bbox: BoundingBox) => void;
  mapType: string;
  setMapType: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}> = ({
  selectedBbox,
  selectedAreaName,
  onAreaChange,
  mapType,
  setMapType,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const map = useMap();

  // Handle click on map to set new center & box
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = Number(e.latLng.lat().toFixed(4));
      const lng = Number(e.latLng.lng().toFixed(4));
      const latSpan = 0.35;
      const lngSpan = 0.30;

      const newBbox: BoundingBox = {
        minLat: Number((lat - latSpan / 2).toFixed(4)),
        maxLat: Number((lat + latSpan / 2).toFixed(4)),
        minLng: Number((lng - lngSpan / 2).toFixed(4)),
        maxLng: Number((lng + lngSpan / 2).toFixed(4)),
      };

      onAreaChange(`Custom Selected Area (${lat}°N, ${lng}°E)`, newBbox);
    },
    [onAreaChange]
  );

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', handleMapClick);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, handleMapClick]);

  const centerLat = (selectedBbox.minLat + selectedBbox.maxLat) / 2;
  const centerLng = (selectedBbox.minLng + selectedBbox.maxLng) / 2;

  const bounds = {
    north: selectedBbox.maxLat,
    south: selectedBbox.minLat,
    east: selectedBbox.maxLng,
    west: selectedBbox.minLng,
  };

  return (
    <>
      {/* Visual Bounding Box Rectangle Overlay */}
      <Rectangle
        bounds={bounds}
        strokeColor="#06b6d4"
        strokeOpacity={0.9}
        strokeWeight={2}
        fillColor="#0891b2"
        fillOpacity={0.18}
      />

      {/* Center Marker */}
      <AdvancedMarker position={{ lat: centerLat, lng: centerLng }}>
        <Pin
          background="#06b6d4"
          borderColor="#083344"
          glyphColor="#ffffff"
          scale={1.1}
        />
      </AdvancedMarker>
    </>
  );
};

export const AreaPickerMap: React.FC<AreaPickerMapProps> = ({
  selectedBbox,
  selectedAreaName,
  onAreaChange,
  heightClass = 'h-[360px] sm:h-[420px]',
}) => {
  const rawKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof window !== 'undefined' &&
      ((window as any).VITE_GOOGLE_MAPS_API_KEY ||
        (window as any).GOOGLE_MAPS_API_KEY)) ||
    '';

  const isConfigured = Boolean(
    rawKey &&
      rawKey !== 'MY_GOOGLE_MAPS_API_KEY' &&
      !rawKey.includes('PLACEHOLDER')
  );

  const [mapType, setMapType] = useState<string>('terrain');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const centerLat = (selectedBbox.minLat + selectedBbox.maxLat) / 2;
  const centerLng = (selectedBbox.minLng + selectedBbox.maxLng) / 2;

  const [cameraCenter, setCameraCenter] = useState({
    lat: centerLat,
    lng: centerLng,
  });
  const [cameraZoom, setCameraZoom] = useState(10);

  // Sync camera when selectedBbox changes
  useEffect(() => {
    setCameraCenter({ lat: centerLat, lng: centerLng });
  }, [centerLat, centerLng]);

  // Quick preset locations in Himalayan valleys
  const quickLocations: Record<
    string,
    { name: string; bbox: BoundingBox; zoom: number }
  > = {
    trishuli: {
      name: 'Trishuli River Corridor (Rasuwa / Nuwakot)',
      bbox: { minLat: 27.9, minLng: 85.12, maxLat: 28.25, maxLng: 85.42 },
      zoom: 11,
    },
    melamchi: {
      name: 'Melamchi Catchment (Sindhupalchok)',
      bbox: { minLat: 27.8, minLng: 85.5, maxLat: 28.05, maxLng: 85.7 },
      zoom: 11,
    },
    bhotekoshi: {
      name: 'Bhote Koshi Valley (Tatopani Gorge)',
      bbox: { minLat: 27.85, minLng: 85.85, maxLat: 28.0, maxLng: 86.0 },
      zoom: 11,
    },
    kaligandaki: {
      name: 'Kali Gandaki Basin (Mustang / Myagdi)',
      bbox: { minLat: 28.3, minLng: 83.5, maxLat: 28.8, maxLng: 83.9 },
      zoom: 10,
    },
    rasuwagadhi: {
      name: 'Rasuwagadhi Border Pass & Gorge',
      bbox: { minLat: 28.24, minLng: 85.34, maxLat: 28.32, maxLng: 85.42 },
      zoom: 12,
    },
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();
    for (const [key, loc] of Object.entries(quickLocations)) {
      if (loc.name.toLowerCase().includes(q) || key.includes(q)) {
        onAreaChange(loc.name, loc.bbox);
        setCameraCenter({
          lat: (loc.bbox.minLat + loc.bbox.maxLat) / 2,
          lng: (loc.bbox.minLng + loc.bbox.maxLng) / 2,
        });
        setCameraZoom(loc.zoom);
        setSearchQuery('');
        return;
      }
    }

    // Check if coordinates were entered e.g. "28.1, 85.3"
    const coordMatch = q.match(/([0-9]+\.?[0-9]*)[,\s]+([0-9]+\.?[0-9]*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= 26 && lat <= 31 && lng >= 80 && lng <= 89) {
        const newBbox: BoundingBox = {
          minLat: Number((lat - 0.15).toFixed(4)),
          maxLat: Number((lat + 0.15).toFixed(4)),
          minLng: Number((lng - 0.15).toFixed(4)),
          maxLng: Number((lng + 0.15).toFixed(4)),
        };
        onAreaChange(`Coordinates (${lat}°N, ${lng}°E)`, newBbox);
        setCameraCenter({ lat, lng });
        setCameraZoom(11);
        setSearchQuery('');
        return;
      }
    }

    // If not matched to a verified area, pass the entered query name
    onAreaChange(searchQuery.trim(), {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
    });
  };

  const handleZoomIn = () => setCameraZoom((z) => Math.min(18, z + 1));
  const handleZoomOut = () => setCameraZoom((z) => Math.max(5, z - 1));
  const handleReset = () => {
    setCameraCenter({ lat: centerLat, lng: centerLng });
    setCameraZoom(11);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  // If developer has not configured the key, show exact required developer message
  if (!isConfigured) {
    return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wide">
          Developer Configuration Required
        </h3>
        <p className="text-xs font-mono text-amber-300 bg-amber-950/60 p-3 rounded-xl border border-amber-800/60 select-all">
          Google Maps is not configured. Add GOOGLE_MAPS_API_KEY to the application environment.
        </p>
        <p className="text-[11px] text-slate-400">
          Configure <code className="text-cyan-400">VITE_GOOGLE_MAPS_API_KEY</code> or <code className="text-cyan-400">GOOGLE_MAPS_API_KEY</code> to enable the interactive map.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : heightClass
      }`}
    >
      <APIProvider
        apiKey={rawKey}
        language="en"
        region="NP"
      >
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={11}
          mapTypeId={mapType}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapCameraController center={cameraCenter} zoom={cameraZoom} />

          <AreaPickerContent
            selectedBbox={selectedBbox}
            selectedAreaName={selectedAreaName}
            onAreaChange={onAreaChange}
            mapType={mapType}
            setMapType={setMapType}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleReset}
          />
        </Map>
      </APIProvider>

      {/* Top Search Overlay */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-10">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search place, valley, or click map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Map Control Buttons: [ + ] [ − ] [ Layers ] [ Full screen ] */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
        {/* Map Type Switcher */}
        <button
          type="button"
          onClick={() =>
            setMapType((prev) =>
              prev === 'terrain' ? 'satellite' : prev === 'satellite' ? 'roadmap' : 'terrain'
            )
          }
          title={`Current: ${mapType}. Click to change basemap.`}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-200 hover:text-white capitalize"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{mapType}</span>
        </button>

        {/* Zoom In [ + ] */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold"
        >
          +
        </button>

        {/* Zoom Out [ − ] */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold"
        >
          −
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullScreen}
          title="Toggle fullscreen"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white"
        >
          {isFullScreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">
          Click anywhere on the Google Map to reposition the analysis area.
        </span>
      </div>
    </div>
  );
};
