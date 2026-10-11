import React, { useState, useRef } from 'react';
import { PageId, BoundingBox } from '../types';
import {
  MapPin,
  Calendar,
  Play,
  Waves,
  AlertTriangle,
  GitFork,
  Check,
  X,
  CalendarDays,
  Compass,
  Radio,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { AreaPickerMap } from '../components/AreaPickerMap';

interface HomePageProps {
  onStartAnalysis: (areaName: string, bbox: BoundingBox, floodDate: string) => void;
  onSelectPage: (page: PageId) => void;
  isAnalyzing: boolean;
}

const isValidIsoDate = (str: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};

const formatDisplayDate = (str: string): string => {
  try {
    const [y, m, d] = str.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return str;
  }
};

const normalizeDate = (input: string): string => {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return trimmed;
};

export const HomePage: React.FC<HomePageProps> = ({
  onStartAnalysis,
  onSelectPage,
  isAnalyzing,
}) => {
  // Predefined easy-to-click Himalayan areas
  const quickAreas = [
    {
      name: 'Trishuli River Corridor (Rasuwa / Nuwakot)',
      shortName: 'Trishuli Corridor',
      district: 'Rasuwa / Nuwakot',
      bbox: { minLat: 27.90, minLng: 85.12, maxLat: 28.25, maxLng: 85.42 },
      recommendedDate: '2026-08-12',
    },
    {
      name: 'Melamchi Catchment (Sindhupalchok)',
      shortName: 'Melamchi Catchment',
      district: 'Sindhupalchok',
      bbox: { minLat: 27.80, minLng: 85.50, maxLat: 28.05, maxLng: 85.70 },
      recommendedDate: '2026-07-30',
    },
    {
      name: 'Bhote Koshi Valley (Tatopani Gorge)',
      shortName: 'Bhote Koshi Valley',
      district: 'Tatopani Gorge',
      bbox: { minLat: 27.85, minLng: 85.85, maxLat: 28.00, maxLng: 86.00 },
      recommendedDate: '2026-08-08',
    },
    {
      name: 'Kali Gandaki Basin (Mustang / Myagdi)',
      shortName: 'Kali Gandaki Basin',
      district: 'Mustang / Myagdi',
      bbox: { minLat: 28.30, minLng: 83.50, maxLat: 28.80, maxLng: 83.90 },
      recommendedDate: '2026-08-15',
    },
  ];

  const [selectedAreaName, setSelectedAreaName] = useState(quickAreas[0].name);
  const [selectedBbox, setSelectedBbox] = useState<BoundingBox>(quickAreas[0].bbox);
  const [floodDate, setFloodDate] = useState('2026-08-12');
  const [showPipelineDetails, setShowPipelineDetails] = useState(false);

  const textInputRef = useRef<HTMLInputElement>(null);
  const nativeDatePickerRef = useRef<HTMLInputElement>(null);

  const handleSelectArea = (area: typeof quickAreas[0]) => {
    setSelectedAreaName(area.name);
    setSelectedBbox(area.bbox);
    if (area.recommendedDate) {
      setFloodDate(area.recommendedDate);
    }
  };

  const handleMapAreaChange = (name: string, bbox: BoundingBox) => {
    setSelectedAreaName(name);
    setSelectedBbox(bbox);
  };

  const handleOpenPicker = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (nativeDatePickerRef.current) {
      try {
        if (typeof nativeDatePickerRef.current.showPicker === 'function') {
          nativeDatePickerRef.current.showPicker();
        } else {
          nativeDatePickerRef.current.focus();
          nativeDatePickerRef.current.click();
        }
      } catch {
        nativeDatePickerRef.current.focus();
        nativeDatePickerRef.current.click();
      }
    }
  };

  const handleStart = () => {
    const cleanDate = normalizeDate(floodDate);
    if (!selectedAreaName || !cleanDate) return;
    onStartAnalysis(selectedAreaName, selectedBbox, cleanDate);
  };

  // Quick event dates for convenient selection
  const commonFloodDates = [
    { label: '2026-08-12 (Trishuli Peak)', date: '2026-08-12' },
    { label: '2026-07-30 (Melamchi Surge)', date: '2026-07-30' },
    { label: '2026-08-08 (Bhote Koshi)', date: '2026-08-08' },
    { label: '2026-08-15 (Kali Gandaki)', date: '2026-08-15' },
    { label: '2021-06-15 (Melamchi 2021)', date: '2021-06-15' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Official Enterprise Hero Section */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Operational Disaster Decision Support</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
          Himalayan Flood &amp; Connectivity
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Cloud-penetrating Sentinel-1 SAR change detection, DEM flow modeling, and topological road isolation assessment for rugged mountain terrain.
        </p>
      </div>

      {/* Main Two-Input Form Card with Enterprise Glow & Elevation */}
      <div className="enterprise-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-7 shadow-2xl">
        {/* INPUT 1: ASSESSMENT AREA */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-2 uppercase">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[11px] font-black">
                1
              </span>
              <span>Impact Assessment Area</span>
            </label>
            <span className="text-[11px] text-cyan-400 font-medium">
              Search, select preset, or draw on map
            </span>
          </div>

          {/* Area Text Input with Search Icon */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={selectedAreaName}
              onChange={(e) => setSelectedAreaName(e.target.value)}
              placeholder="Search or enter area name (e.g. Trishuli, Melamchi, Bhote Koshi)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />
          </div>

          {/* Google Maps Visual Area Selector Container */}
          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
            <AreaPickerMap
              selectedBbox={selectedBbox}
              selectedAreaName={selectedAreaName}
              onAreaChange={handleMapAreaChange}
              heightClass="h-[300px] sm:h-[360px]"
            />
          </div>

          {/* Quick Area Preset Cards with Monospace Telemetry Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {quickAreas.map((area) => {
              const isSelected = selectedAreaName === area.name;
              return (
                <button
                  key={area.name}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className={`field-touch-target p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group touch-manipulation active:scale-[0.99] ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{area.shortName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {area.district}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400/80 mt-1">
                      {area.bbox.minLat.toFixed(2)}°N, {area.bbox.minLng.toFixed(2)}°E
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Compass className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Area Confirmation Bar */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Target Region:</span>
            </span>
            <span className="font-bold text-cyan-300 truncate max-w-[240px] sm:max-w-md text-right">
              {selectedAreaName}
            </span>
          </div>
        </div>

        {/* INPUT 2: FLOOD DATE */}
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="flood-date-input"
              className="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-2 uppercase"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[11px] font-black">
                2
              </span>
              <span>Flood Event Date</span>
            </label>
            <span className="text-[11px] text-blue-400 font-medium">
              Editable date field (YYYY-MM-DD)
            </span>
          </div>

          {/* Interactive Date Field with Keyboard Typing & Calendar Trigger */}
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={textInputRef}
              id="flood-date-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={floodDate}
              onChange={(e) => setFloodDate(e.target.value)}
              onBlur={() => {
                const norm = normalizeDate(floodDate);
                if (norm && norm !== floodDate) {
                  setFloodDate(norm);
                }
              }}
              placeholder="YYYY-MM-DD (e.g. 2026-08-12)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-32 py-2.5 sm:py-3 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all cursor-text touch-manipulation"
            />

            {/* Hidden native date input synced for standard browser calendar popups */}
            <input
              ref={nativeDatePickerRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              value={isValidIsoDate(floodDate) ? floodDate : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setFloodDate(e.target.value);
                  textInputRef.current?.focus();
                }
              }}
              className="sr-only"
              style={{ colorScheme: 'dark' }}
            />

            {/* Action buttons inside the right side of the input */}
            <div className="absolute right-2 flex items-center gap-1.5">
              {floodDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFloodDate('');
                    textInputRef.current?.focus();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFloodDate('');
                    textInputRef.current?.focus();
                  }}
                  title="Clear date"
                  aria-label="Clear date"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenPicker}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleOpenPicker(e);
                }}
                title="Open calendar picker"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 hover:text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer touch-manipulation"
              >
                <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pick Date</span>
              </button>
            </div>
          </div>

          {/* Validation & feedback status */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {isValidIsoDate(floodDate) ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>Verified: {formatDisplayDate(floodDate)}</span>
              </div>
            ) : floodDate ? (
              <div className="text-[11px] text-amber-400">
                Format required: YYYY-MM-DD (e.g. 2026-08-12)
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                Please enter or select a flood date.
              </div>
            )}
            <p className="text-[11px] text-slate-500 font-mono">
              Calibrates pre- &amp; post-event Sentinel-1 passes
            </p>
          </div>

          {/* Quick Select Preset Date Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Quick Event Presets:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {commonFloodDates.map((item) => {
                const isActive = floodDate === item.date;
                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => {
                      setFloodDate(item.date);
                      textInputRef.current?.focus();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setFloodDate(item.date);
                      textInputRef.current?.focus();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  setFloodDate(todayStr);
                  textInputRef.current?.focus();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const todayStr = new Date().toISOString().split('T')[0];
                  setFloodDate(todayStr);
                  textInputRef.current?.focus();
                }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer touch-manipulation active:scale-95"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* START ANALYSIS PRIMARY ACTION CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={isAnalyzing || !selectedAreaName || !floodDate}
            className={`btn-primary-gradient w-full py-4 rounded-xl sm:rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-3 transition-all ${
              isAnalyzing
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'PROCESSING SATELLITE PASSES...' : 'START SATELLITE ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* The Three Observational Pillars of FloodLens AI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-2">
        {/* Card 1 */}
        <div className="enterprise-card glow-card-cyan rounded-2xl p-5 space-y-3 text-xs">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 flex items-center justify-center shadow-inner">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
              Pillar 01 · SAR Radar
            </span>
            <h2 className="font-bold text-sm text-white tracking-tight mt-0.5">
              Cloud-Penetrating Inundation
            </h2>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Sentinel-1 C-band synthetic aperture radar penetrates monsoon cloud cover to isolate standing water and debris flow backscatter anomalies.
          </p>
        </div>

        {/* Card 2 */}
        <div className="enterprise-card glow-card-amber rounded-2xl p-5 space-y-3 text-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              Pillar 02 · Exposure
            </span>
            <h2 className="font-bold text-sm text-white tracking-tight mt-0.5">
              Infrastructure Intersections
            </h2>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Cross-references OpenStreetMap roads, highway bridges, and building footprints against detected flood boundaries within a 25m buffer.
          </p>
        </div>

        {/* Card 3 */}
        <div className="enterprise-card glow-card-rose rounded-2xl p-5 space-y-3 text-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-inner">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
              Pillar 03 · Network
            </span>
            <h2 className="font-bold text-sm text-white tracking-tight mt-0.5">
              Settlement Connectivity
            </h2>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Topological graph routing evaluates whether mountain villages have severed road connections to regional hubs and emergency medical facilities.
          </p>
        </div>
      </div>

      {/* PROGRESSIVE DISCLOSURE: TECHNICAL SAR PIPELINE VERIFICATION PROTOCOL */}
      <div className="command-card rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <button
          type="button"
          onClick={() => setShowPipelineDetails(!showPipelineDetails)}
          className="field-touch-target w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
              Technical SAR Pipeline &amp; Precision Calibration Specs
            </span>
          </div>
          {showPipelineDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPipelineDetails && (
          <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 font-mono animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">Sensor &amp; Instrument:</span>
                <span className="text-cyan-300 font-bold">Sentinel-1 C-SAR (IW GRD)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">Backscatter Threshold (Δσ⁰):</span>
                <span className="text-amber-400 font-bold">≤ -18.4 dB (Otsu Adaptive)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">DEM Flow Tracing:</span>
                <span className="text-emerald-400 font-bold">Copernicus 30m Steepest-Descent</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">Speckle Suppression:</span>
                <span className="text-purple-300 font-bold">Lee Filter (5×5 Adaptive Kernel)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">Infrastructure Buffer:</span>
                <span className="text-rose-400 font-bold">25m OSM Vector Dilation</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] font-sans">Routing Algorithm:</span>
                <span className="text-blue-300 font-bold">Dijkstra Topological Shortest Path</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
              Field workers operate on simplified severity chips; full radiometrically calibrated backscatter matrices and DEM flow vectors remain available for GIS analysts and civil engineers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
