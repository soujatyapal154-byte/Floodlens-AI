import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Polyline,
  Polygon,
  Rectangle,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  AnalysisRunData,
  InfrastructureFeature,
  SettlementConnectivity,
  FloodPolygonFeature,
} from '../types';
import {
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  AlertTriangle,
  Search,
  X,
  Info,
  Waves,
  Mountain,
  MapPin,
  Route,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface MapViewerProps {
  analysisData: AnalysisRunData;
  activeFeatureId?: string | null;
  onSelectFeature?: (id: string, type: string) => void;
  heightClass?: string;
  showFlowPath?: boolean;
  onMapClickCoordinate?: (coord: [number, number]) => void;
  highlightSettlementId?: string | null;
}

// Controller for camera manipulation
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

// Map click listener for upstream flow path or coordinate queries
const MapClickListener: React.FC<{
  onMapClickCoordinate?: (coord: [number, number]) => void;
  setCursorCoords: (coords: { lat: number; lng: number } | null) => void;
}> = ({ onMapClickCoordinate, setCursorCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener(
      'click',
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = Number(e.latLng.lat().toFixed(4));
        const lng = Number(e.latLng.lng().toFixed(4));
        if (onMapClickCoordinate) {
          onMapClickCoordinate([lat, lng]);
        }
      }
    );

    const mouseListener = map.addListener(
      'mousemove',
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setCursorCoords({
          lat: Number(e.latLng.lat().toFixed(4)),
          lng: Number(e.latLng.lng().toFixed(4)),
        });
      }
    );

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(mouseListener);
    };
  }, [map, onMapClickCoordinate, setCursorCoords]);

  return null;
};

export const MapViewer: React.FC<MapViewerProps> = ({
  analysisData,
  onSelectFeature,
  heightClass = 'h-[580px]',
  showFlowPath = false,
  onMapClickCoordinate,
  highlightSettlementId,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapType, setMapType] = useState<string>('terrain');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Active InfoWindow state
  const [selectedRoad, setSelectedRoad] = useState<InfrastructureFeature | null>(
    null
  );
  const [selectedBridge, setSelectedBridge] = useState<InfrastructureFeature | null>(
    null
  );
  const [
    selectedSettlement,
    setSelectedSettlement,
  ] = useState<SettlementConnectivity | null>(null);
  const [
    selectedPolygon,
    setSelectedPolygon,
  ] = useState<FloodPolygonFeature | null>(null);

  // Layer visibility toggles
  const [layersVisible, setLayersVisible] = useState({
    flood: true,
    debris: true,
    roads: true,
    bridges: true,
    buildings: true,
    settlements: true,
    flowPath: true,
    extent: true,
  });

  const defaultCenter = {
    lat: analysisData.center ? analysisData.center[0] : 28.1,
    lng: analysisData.center ? analysisData.center[1] : 85.27,
  };
  const [cameraCenter, setCameraCenter] = useState(defaultCenter);
  const [cameraZoom, setCameraZoom] = useState(analysisData.zoom || 11);

  // Focus on highlighted settlement if passed as prop
  useEffect(() => {
    if (highlightSettlementId) {
      const s = analysisData.settlements.find(
        (item) => item.id === highlightSettlementId
      );
      if (s) {
        setCameraCenter({ lat: s.coordinates[0], lng: s.coordinates[1] });
        setCameraZoom(13);
        setSelectedSettlement(s);
      }
    }
  }, [highlightSettlementId, analysisData.settlements]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();

    // Check settlements in analysis
    const matchSettlement = analysisData.settlements.find((s) =>
      s.name.toLowerCase().includes(q)
    );
    if (matchSettlement) {
      setCameraCenter({
        lat: matchSettlement.coordinates[0],
        lng: matchSettlement.coordinates[1],
      });
      setCameraZoom(13);
      setSelectedSettlement(matchSettlement);
      setSearchQuery('');
      return;
    }

    // Check coordinates
    const coordMatch = q.match(/([0-9]+\.?[0-9]*)[,\s]+([0-9]+\.?[0-9]*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setCameraCenter({ lat, lng });
      setCameraZoom(12);
      setSearchQuery('');
      return;
    }
  };

  const handleZoomIn = () => setCameraZoom((z) => Math.min(18, z + 1));
  const handleZoomOut = () => setCameraZoom((z) => Math.max(6, z - 1));

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

  // Convert coordinate tuples to Google Maps LatLngLiterals
  const toLatLng = (c: [number, number]): { lat: number; lng: number } => ({
    lat: c[0],
    lng: c[1],
  });

  const toPath = (coords: [number, number][]): { lat: number; lng: number }[] =>
    coords.map(toLatLng);

  // If developer has not configured the key, show exact required developer message
  if (!isConfigured) {
    return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 my-8 shadow-2xl">
        <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider">
          Developer Configuration Required
        </h3>
        <p className="text-xs font-mono text-amber-300 bg-amber-950/60 p-4 rounded-xl border border-amber-800/60 select-all leading-relaxed">
          Google Maps is not configured. Add GOOGLE_MAPS_API_KEY to the application environment.
        </p>
        <p className="text-xs text-slate-400">
          Set <code className="text-cyan-400">VITE_GOOGLE_MAPS_API_KEY</code> in your environment to render the interactive flood analysis map.
        </p>
      </div>
    );
  }

  // Bounding box bounds for analysis extent
  const extentBounds = {
    north: analysisData.bbox.maxLat,
    south: analysisData.bbox.minLat,
    east: analysisData.bbox.maxLng,
    west: analysisData.bbox.minLng,
  };

  const roads = analysisData.infrastructure.filter((i) => i.type === 'road');
  const bridges = analysisData.infrastructure.filter((i) => i.type === 'bridge');
  const buildings = analysisData.infrastructure.filter(
    (i) => i.type === 'building'
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${
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
          defaultCenter={defaultCenter}
          defaultZoom={analysisData.zoom || 11}
          mapTypeId={mapType}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapCameraController center={cameraCenter} zoom={cameraZoom} />

          <MapClickListener
            onMapClickCoordinate={onMapClickCoordinate}
            setCursorCoords={setCursorCoords}
          />

          {/* 1. 🔲 Analysis Bounding Box Extent Overlay */}
          {layersVisible.extent && (
            <Rectangle
              bounds={extentBounds}
              strokeColor="#38bdf8"
              strokeOpacity={0.7}
              strokeWeight={2}
              fillColor="#0284c7"
              fillOpacity={0.06}
            />
          )}

          {/* 2. 🌊 Flood and Debris Inundation Polygons (Sentinel-1 SAR) */}
          {analysisData.floodSummary.polygons.map((poly) => {
            if (poly.type === 'flood' && !layersVisible.flood) return null;
            if (poly.type === 'debris' && !layersVisible.debris) return null;

            const isFlood = poly.type === 'flood';
            const fillColor = isFlood ? '#06b6d4' : '#f59e0b';
            const strokeColor = isFlood ? '#0891b2' : '#d97706';

            return (
              <Polygon
                key={poly.id}
                paths={toPath(poly.coordinates)}
                fillColor={fillColor}
                fillOpacity={0.48}
                strokeColor={strokeColor}
                strokeOpacity={0.9}
                strokeWeight={2}
                onClick={() => {
                  setSelectedPolygon(poly);
                  if (onSelectFeature) onSelectFeature(poly.id, poly.type);
                }}
              />
            );
          })}

          {/* 3. 🛣️ Pre-Event OpenStreetMap Road Network Overlays */}
          {layersVisible.roads &&
            roads.map((road) => {
              if (!Array.isArray(road.coordinates[0])) return null;
              const path = toPath(road.coordinates as [number, number][]);

              const isAffected =
                road.status === 'Potentially affected' ||
                road.overlapDegree === 'High';
              const isPossibleDamage =
                road.status === 'Possible damage' ||
                road.overlapDegree === 'Medium';

              const strokeColor = isAffected
                ? '#ef4444' // Blocked (Red)
                : isPossibleDamage
                ? '#f59e0b' // Detour / Caution (Amber)
                : '#10b981'; // Clear (Green)

              const strokeWeight = isAffected ? 5 : isPossibleDamage ? 4 : 3;

              return (
                <Polyline
                  key={road.id}
                  path={path}
                  strokeColor={strokeColor}
                  strokeOpacity={0.95}
                  strokeWeight={strokeWeight}
                  onClick={() => {
                    setSelectedRoad(road);
                    if (onSelectFeature) onSelectFeature(road.id, 'road');
                  }}
                />
              );
            })}

          {/* 4. 🌉 Affected Bridges */}
          {layersVisible.bridges &&
            bridges.map((bridge) => {
              const coord = Array.isArray(bridge.coordinates[0])
                ? (bridge.coordinates as [number, number][])[0]
                : (bridge.coordinates as [number, number]);

              const isHigh =
                bridge.status === 'Potentially affected' ||
                bridge.overlapDegree === 'High';

              return (
                <AdvancedMarker
                  key={bridge.id}
                  position={toLatLng(coord)}
                  onClick={() => {
                    setSelectedBridge(bridge);
                    if (onSelectFeature) onSelectFeature(bridge.id, 'bridge');
                  }}
                >
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border shadow-lg flex items-center gap-1 cursor-pointer transition-transform hover:scale-110 ${
                      isHigh
                        ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                        : 'bg-amber-950/90 border-amber-500 text-amber-200'
                    }`}
                  >
                    <span>🌉</span>
                    <span className="truncate max-w-[80px]">{bridge.name}</span>
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* 5. 🏠 Affected Buildings */}
          {layersVisible.buildings &&
            buildings.map((bld) => {
              const coord = Array.isArray(bld.coordinates[0])
                ? (bld.coordinates as [number, number][])[0]
                : (bld.coordinates as [number, number]);

              return (
                <AdvancedMarker
                  key={bld.id}
                  position={toLatLng(coord)}
                  onClick={() => {
                    setSelectedRoad(bld);
                    if (onSelectFeature) onSelectFeature(bld.id, 'building');
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white shadow-md animate-pulse cursor-pointer" />
                </AdvancedMarker>
              );
            })}

          {/* 6. 🏘️ Settlements (Connectivity & Isolation Status) */}
          {layersVisible.settlements &&
            analysisData.settlements.map((settlement) => {
              const isCutOff =
                settlement.connectivityStatus === 'NO ROUTE FOUND';
              const isDetour =
                settlement.connectivityStatus === 'POSSIBLY CUT OFF';

              const pinBg = isCutOff
                ? '#ef4444' // Red (Cut off)
                : isDetour
                ? '#f59e0b' // Amber (Detour required)
                : '#10b981'; // Green (Connected)

              const borderCol = isCutOff ? '#7f1d1d' : isDetour ? '#78350f' : '#064e3b';

              return (
                <AdvancedMarker
                  key={settlement.id}
                  position={toLatLng(settlement.coordinates)}
                  onClick={() => {
                    setSelectedSettlement(settlement);
                    if (onSelectFeature)
                      onSelectFeature(settlement.id, 'settlement');
                  }}
                >
                  <div className="flex flex-col items-center cursor-pointer group">
                    <Pin
                      background={pinBg}
                      borderColor={borderCol}
                      glyphColor="#ffffff"
                      scale={isCutOff ? 1.25 : 1.0}
                    />
                    <div
                      className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold shadow-md border whitespace-nowrap transition-all ${
                        isCutOff
                          ? 'bg-rose-950/95 border-rose-500 text-rose-200'
                          : isDetour
                          ? 'bg-amber-950/95 border-amber-500 text-amber-200'
                          : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                      }`}
                    >
                      {settlement.name}
                      {isCutOff && ' ⛔'}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* 7. 〰️ Copernicus DEM Estimated Terrain Flow Path */}
          {layersVisible.flowPath && showFlowPath && analysisData.flowPath && (
            <>
              <Polyline
                path={toPath(
                  analysisData.flowPath.points.map((p) => p.coordinates)
                )}
                strokeColor="#0284c7"
                strokeOpacity={0.95}
                strokeWeight={4}
              />

              {/* Start Point Marker */}
              <AdvancedMarker
                position={toLatLng(analysisData.flowPath.startPoint.coordinates)}
              >
                <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 shadow-md">
                  ▲ Origin: {analysisData.flowPath.startPoint.elevationMeters}m
                </div>
              </AdvancedMarker>
            </>
          )}

          {/* ----------------- INFOWINDOWS ----------------- */}

          {/* Road InfoWindow */}
          {selectedRoad && (
            <InfoWindow
              position={toLatLng(
                Array.isArray(selectedRoad.coordinates[0])
                  ? (selectedRoad.coordinates as [number, number][])[0]
                  : (selectedRoad.coordinates as [number, number])
              )}
              onCloseClick={() => setSelectedRoad(null)}
            >
              <div className="p-1 max-w-[260px] text-slate-900 font-sans">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    🛣️ {selectedRoad.name}
                  </span>
                </div>
                <div className="pt-1.5 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`font-bold ${
                        selectedRoad.status === 'Potentially affected'
                          ? 'text-rose-600'
                          : selectedRoad.status === 'Possible damage'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedRoad.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overlap Degree:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRoad.overlapDegree}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {selectedRoad.whyExplanation || selectedRoad.notes}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Bridge InfoWindow */}
          {selectedBridge && (
            <InfoWindow
              position={toLatLng(
                Array.isArray(selectedBridge.coordinates[0])
                  ? (selectedBridge.coordinates as [number, number][])[0]
                  : (selectedBridge.coordinates as [number, number])
              )}
              onCloseClick={() => setSelectedBridge(null)}
            >
              <div className="p-1 max-w-[260px] text-slate-900 font-sans">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    🌉 {selectedBridge.name}
                  </span>
                </div>
                <div className="pt-1.5 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Condition:</span>
                    <span className="font-bold text-rose-600">
                      {selectedBridge.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {selectedBridge.whyExplanation || selectedBridge.notes}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Settlement InfoWindow */}
          {selectedSettlement && (
            <InfoWindow
              position={toLatLng(selectedSettlement.coordinates)}
              onCloseClick={() => setSelectedSettlement(null)}
            >
              <div className="p-1 max-w-[280px] text-slate-900 font-sans space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    🏘️ {selectedSettlement.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      selectedSettlement.connectivityStatus ===
                      'NO ROUTE FOUND'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedSettlement.connectivityStatus ===
                          'POSSIBLY CUT OFF'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedSettlement.connectivityStatus}
                  </span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Population:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSettlement.populationEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Elevation:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSettlement.elevationMeters}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hospital Connection:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSettlement.nearestTownOrHospital}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-100">
                    {selectedSettlement.whyExplanation}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Polygon InfoWindow */}
          {selectedPolygon && (
            <InfoWindow
              position={toLatLng(selectedPolygon.coordinates[0])}
              onCloseClick={() => setSelectedPolygon(null)}
            >
              <div className="p-1 max-w-[240px] text-slate-900 font-sans">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">
                    {selectedPolygon.type === 'flood'
                      ? '🌊 Inundated Water Surface'
                      : '🪨 Debris / Landslide Deposit'}
                  </span>
                </div>
                <div className="pt-1.5 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Area:</span>
                    <span className="font-bold text-slate-800">
                      {selectedPolygon.areaHectares} ha
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Radar Backscatter:</span>
                    <span className="font-mono text-cyan-700 font-bold">
                      {selectedPolygon.sarBackscatterDiffDb} dB
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 pt-1 leading-tight">
                    {selectedPolygon.notes}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* TOP CONTROLS OVERLAY: [ Search ] [ Layers ] [ Basemap ] [ + ] [ − ] [ Full screen ] */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
        {/* Search Input [ Search ] */}
        <div className="pointer-events-auto w-64 sm:w-80">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search settlement or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-xl"
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

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl">
          {/* Basemap Switcher */}
          <button
            type="button"
            onClick={() =>
              setMapType((prev) =>
                prev === 'terrain'
                  ? 'satellite'
                  : prev === 'satellite'
                  ? 'roadmap'
                  : 'terrain'
              )
            }
            title={`Basemap: ${mapType}. Click to toggle.`}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 capitalize"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{mapType}</span>
          </button>

          {/* Layers Toggle [ Layers ] */}
          <button
            type="button"
            onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
            title="Toggle data layers"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isLayerPanelOpen
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Legend Toggle [ Legend ] */}
          <button
            type="button"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            title="Toggle map legend"
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isLegendOpen
                ? 'bg-slate-700 text-cyan-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Legend
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

          {/* Full Screen [ Full screen ] */}
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
      </div>

      {/* FLOATING LAYERS PANEL */}
      {isLayerPanelOpen && (
        <div className="absolute top-16 right-3 z-20 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Visible Overlays</span>
            </span>
            <button
              onClick={() => setIsLayerPanelOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Flood Inundation (SAR)</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.flood}
                onChange={(e) =>
                  setLayersVisible((v) => ({ ...v, flood: e.target.checked }))
                }
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Debris / Silt Scars</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.debris}
                onChange={(e) =>
                  setLayersVisible((v) => ({ ...v, debris: e.target.checked }))
                }
                className="rounded accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Pre-Event OSM Roads</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.roads}
                onChange={(e) =>
                  setLayersVisible((v) => ({ ...v, roads: e.target.checked }))
                }
                className="rounded accent-rose-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span>🌉</span>
                <span>Affected Bridges</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.bridges}
                onChange={(e) =>
                  setLayersVisible((v) => ({ ...v, bridges: e.target.checked }))
                }
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                <span>Building Clusters</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.buildings}
                onChange={(e) =>
                  setLayersVisible((v) => ({
                    ...v,
                    buildings: e.target.checked,
                  }))
                }
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span>🏘️</span>
                <span>Settlements (Cut-off)</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.settlements}
                onChange={(e) =>
                  setLayersVisible((v) => ({
                    ...v,
                    settlements: e.target.checked,
                  }))
                }
                className="rounded accent-rose-500"
              />
            </label>

            {showFlowPath && (
              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>DEM Flow Path</span>
                </span>
                <input
                  type="checkbox"
                  checked={layersVisible.flowPath}
                  onChange={(e) =>
                    setLayersVisible((v) => ({
                      ...v,
                      flowPath: e.target.checked,
                    }))
                  }
                  className="rounded accent-sky-500"
                />
              </label>
            )}

            <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded border border-sky-400" />
                <span>Satellite Extent</span>
              </span>
              <input
                type="checkbox"
                checked={layersVisible.extent}
                onChange={(e) =>
                  setLayersVisible((v) => ({ ...v, extent: e.target.checked }))
                }
                className="rounded accent-sky-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* FLOATING LEGEND PANEL [ Legend ] */}
      {isLegendOpen && (
        <div className="absolute bottom-10 left-3 z-10 max-w-[280px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <span>Map Legend</span>
            </span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-500/80 border border-cyan-300 shrink-0" />
              <span className="text-slate-300">
                Flood Inundation (SAR Drop &lt; -18 dB)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500/80 border border-amber-300 shrink-0" />
              <span className="text-slate-300">Debris / Landslide Silt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-rose-500 shrink-0" />
              <span className="text-slate-300">Road Blocked (Pre-event OSM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-amber-400 shrink-0" />
              <span className="text-slate-300">Detour Required Road</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🌉</span>
              <span className="text-slate-300">Affected Bridge Crossing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-300">
                Cut-off Settlement (No Road Access)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-slate-300">Settlement with Detour</span>
            </div>
            {showFlowPath && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-sky-400 shrink-0" />
                <span className="text-slate-300">Copernicus DEM Flow Path</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM COORDINATES BAR */}
      <div className="absolute bottom-2 left-3 right-3 sm:right-auto z-10 flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 pointer-events-none">
        {cursorCoords ? (
          <span>
            {cursorCoords.lat.toFixed(4)}°N, {cursorCoords.lng.toFixed(4)}°E
          </span>
        ) : (
          <span>Himalayan Mountain Corridor</span>
        )}
        <span className="text-slate-600">•</span>
        <span className="text-cyan-400">Google Maps JavaScript API</span>
      </div>
    </div>
  );
};
