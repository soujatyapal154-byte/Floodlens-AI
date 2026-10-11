import React, { useState } from 'react';
import { AnalysisRunData, PageId } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Waves,
  Home as HomeIcon,
  GitFork,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot,
  ShieldAlert,
  Database,
  MapPin,
  Calendar,
  Layers,
  Radio,
} from 'lucide-react';
import { WhyModal } from '../components/WhyModal';
import { SectorRiskChart } from '../components/SectorRiskChart';

interface AnalysisPageProps {
  analysisData: AnalysisRunData | null;
  isAnalyzing: boolean;
  currentStep: number;
  errorMessage?: string;
  errorReason?: string;
  onSelectPage: (page: PageId) => void;
  onRetry: () => void;
  onWiderSearch: () => void;
  onChangeDate: () => void;
  onOpenAiAssistant: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  analysisData,
  isAnalyzing,
  currentStep,
  errorMessage,
  errorReason,
  onSelectPage,
  onRetry,
  onWiderSearch,
  onChangeDate,
  onOpenAiAssistant,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [whyModal, setWhyModal] = useState<{
    isOpen: boolean;
    title: string;
    explanation: string;
  }>({
    isOpen: false,
    title: '',
    explanation: '',
  });

  const steps = [
    { num: 1, title: 'Boundary verification', desc: 'Target geographic bounding box calibrated.' },
    { num: 2, title: 'Satellite acquisition retrieval', desc: 'Querying Copernicus Sentinel-1 pre- & post-flood SAR passes.' },
    { num: 3, title: 'Radar geometry & speckle filtering', desc: 'Lee sigma filter applied; radiometrically terrain-corrected.' },
    { num: 4, title: 'SAR backscatter change detection', desc: 'Evaluating dB difference and Otsu thresholding.' },
    { num: 5, title: 'Infrastructure intersection buffer', desc: 'Checking OSM roads, bridges, and building footprints within 25m.' },
    { num: 6, title: 'Topological connectivity graph', desc: 'Testing passable road routes from settlements to medical hubs.' },
    { num: 7, title: 'Disaster assessment synthesis', desc: 'Compiling structured situation data summary.' },
  ];

  // 1. Error State
  if (errorMessage) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in pt-6 sm:pt-10">
        <div className="enterprise-card border-rose-800/60 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">{errorMessage}</h2>

          {errorReason && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {errorReason}
            </p>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onWiderSearch}
              className="btn-primary-gradient px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg"
            >
              TRY A WIDER SEARCH
            </button>

            <button
              onClick={onChangeDate}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              CHANGE FLOOD DATE
            </button>

            <button
              onClick={onRetry}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Progress Screen
  if (isAnalyzing) {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 animate-in fade-in pt-6 sm:pt-10">
        <div className="enterprise-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-semibold border border-cyan-800/60">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Sentinel-1 SAR Engine Active</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executing Multi-Pass SAR Pipeline
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Extracting radar backscatter, road vectors, and topological isolation graphs.
            </p>
          </div>

          {/* Stepper */}
          <div className="space-y-4 pt-2">
            {steps.map((st) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;

              return (
                <div key={st.num} className="flex items-start gap-3.5 text-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold transition-all text-[11px] ${
                      isPast
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 animate-pulse font-black'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                  </div>

                  <div>
                    <div className={`font-semibold ${isCurrent ? 'text-cyan-300 font-bold' : isPast ? 'text-white' : 'text-slate-500'}`}>
                      {st.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State (No analysis yet)
  if (!analysisData) {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto text-center space-y-4 pt-12 sm:pt-20">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-xl">
          <Waves className="w-7 h-7 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">No Flood Analysis Active</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Select an assessment region and flood event date on the home overview to initiate Sentinel-1 satellite radar change detection.
        </p>
        <button
          onClick={() => onSelectPage('home')}
          className="btn-primary-gradient px-6 py-3 rounded-xl text-white font-bold text-xs"
        >
          GO TO ASSESSMENT SETUP
        </button>
      </div>
    );
  }

  // 4. Completed Results Dashboard
  const roadsCount = analysisData.infrastructure.filter((i) => i.type === 'road' && i.status !== 'Clear').length;
  const bridgesCount = analysisData.infrastructure.filter((i) => i.type === 'bridge' && i.status !== 'Clear').length;
  const buildingsCount = analysisData.infrastructure.filter((i) => i.type === 'building' && i.status !== 'Clear').length;
  const problemSettlementsCount = analysisData.settlements.filter((s) => s.connectivityStatus !== 'CONNECTED').length;
  const totalFloodDebrisKm2 = Number((analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2).toFixed(1));

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-7 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational Assessment Validated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {analysisData.areaName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Flood Date:</span>
            <span className="font-mono text-cyan-300 font-semibold">{analysisData.floodDate}</span>
            <span>·</span>
            <span>Sensor: Sentinel-1 C-SAR</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPage('home')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze Another Area</span>
          </button>
        </div>
      </div>

      {/* DATA SOURCES & PROVENANCE METADATA */}
      <div className="enterprise-card rounded-2xl p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Observational Metadata &amp; Coverage</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
            {analysisData.provenance.coverageStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
            <span className="text-slate-400 text-[11px] block font-medium">Verified Area:</span>
            <span className="font-bold text-white text-xs">{analysisData.provenance.verifiedArea}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
            <span className="text-slate-400 text-[11px] block font-medium">Requested Flood Date:</span>
            <span className="font-bold text-cyan-300 font-mono text-xs">{analysisData.provenance.requestedFloodDate}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
            <span className="text-slate-400 text-[11px] block font-medium">Satellite Pass Date:</span>
            <span className="font-bold text-white font-mono text-xs">{analysisData.provenance.satelliteDataDate}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70 sm:col-span-2">
            <span className="text-slate-400 text-[11px] block font-medium">Source:</span>
            <span className="font-medium text-slate-200 text-xs">{analysisData.provenance.source}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
            <span className="text-slate-400 text-[11px] block font-medium">Confidence Rating:</span>
            <span className="font-medium text-cyan-300 text-xs">{analysisData.provenance.confidenceText}</span>
          </div>
        </div>
      </div>

      {/* THREE LARGE METRIC CARDS WITH MODERN BORDERS & SUBTLE GLOWS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: FLOOD INUNDATION */}
        <div className="command-card glow-card-cyan rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Waves className="w-4 h-4" />
                <span>{totalFloodDebrisKm2 > 0 ? 'Radar Inundation' : 'Stable Backscatter'}</span>
              </span>
              <button
                onClick={() =>
                  setWhyModal({
                    isOpen: true,
                    title: totalFloodDebrisKm2 > 0 ? 'Why is this flood area identified?' : 'Why is no flood detected?',
                    explanation: totalFloodDebrisKm2 > 0
                      ? `Sentinel-1 radar satellites detected ${analysisData.floodSummary.floodedAreaKm2} km² of water inundation and ${analysisData.floodSummary.debrisAreaKm2} km² of landslide debris where surface backscatter changed significantly between before-event and post-event images.`
                      : 'Sentinel-1 multi-temporal SAR radar analysis shows stable surface backscatter across this area for the requested date, with zero detected inundation or debris surge within the selected boundary.',
                  })
                }
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-dotted flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            </div>

            <div className="text-3xl font-black text-white font-mono tabular-nums">
              {totalFloodDebrisKm2} <span className="text-sm font-normal text-slate-400 font-sans">km²</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="gis-telemetry-badge">
                Δσ⁰ ≤ -18.4 dB
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {totalFloodDebrisKm2 > 0
                ? `${analysisData.floodSummary.floodedAreaKm2} km² open water + ${analysisData.floodSummary.debrisAreaKm2} km² debris deposits.`
                : 'No flood inundation or debris deposits detected in the verified satellite pass within boundary.'}
            </p>
          </div>

          <button
            onClick={() => onSelectPage('map')}
            className="field-touch-target flex items-center justify-between text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-3 border-t border-slate-800/80 transition-colors"
          >
            <span>Explore on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: EXPOSED INFRASTRUCTURE */}
        <div className="command-card glow-card-amber rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <HomeIcon className="w-4 h-4" />
                <span>Exposed Assets</span>
              </span>
              <button
                onClick={() =>
                  setWhyModal({
                    isOpen: true,
                    title: 'Why are these assets marked potentially affected?',
                    explanation: 'The road, bridge, and building footprints mapped in pre-event OpenStreetMap overlap or lie within 25 meters of the satellite-detected flood and debris boundaries.',
                  })
                }
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline decoration-dotted flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            </div>

            <div className="space-y-1 font-mono tabular-nums text-sm">
              <div className="text-white font-black text-2xl">
                {roadsCount} <span className="text-xs font-normal text-slate-400 font-sans">roads impacted</span>
              </div>
              <div className="text-slate-300 text-xs">
                {bridgesCount} <span className="text-slate-500 font-sans">bridges</span> · {buildingsCount} <span className="text-slate-500 font-sans">buildings</span>
              </div>
            </div>

            <div className="pt-0.5">
              <span className="status-chip-high">
                🟠 HIGH EXPOSURE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Mapped infrastructure intersecting or bordering the 25m SAR inundation envelope.
            </p>
          </div>

          <button
            onClick={() => onSelectPage('infrastructure')}
            className="field-touch-target flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 pt-3 border-t border-slate-800/80 transition-colors"
          >
            <span>Inspect Infrastructure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: SETTLEMENT ISOLATION */}
        <div className="command-card glow-card-rose rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitFork className="w-4 h-4" />
                <span>Isolation Risk</span>
              </span>
              <button
                onClick={() =>
                  setWhyModal({
                    isOpen: true,
                    title: 'Why are these settlements marked with connectivity problems?',
                    explanation: 'The road-network graph analysis could not find an unbroken motorable route to the nearest town or hospital after potentially affected roads were removed.',
                  })
                }
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline decoration-dotted flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            </div>

            <div className="text-3xl font-black text-rose-400 font-mono tabular-nums">
              {problemSettlementsCount} <span className="text-sm font-normal text-slate-400 font-sans">settlements</span>
            </div>

            <div className="pt-0.5">
              <span className="status-chip-critical">
                🔴 CRITICAL ISOLATION
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Settlements cut off from primary driving routes or requiring critical multi-hour mountain detours.
            </p>
          </div>

          <button
            onClick={() => onSelectPage('connectivity')}
            className="field-touch-target flex items-center justify-between text-xs font-bold text-rose-400 hover:text-rose-300 pt-3 border-t border-slate-800/80 transition-colors"
          >
            <span>Review Connectivity Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTOR RISK & HISTORICAL VULNERABILITY RECHARTS BAR CHART */}
      <SectorRiskChart analysisData={analysisData} />

      {/* Optical Sensor Status Note */}
      <div className="p-4 rounded-xl enterprise-card text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {analysisData.satelliteMetadata.opticalStatusNote}
        </p>
      </div>

      {/* ADVANCED DETAILS (Accordion) */}
      <div className="enterprise-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <span>TECHNICAL RADAR SPECIFICATIONS &amp; AI ARCHITECTURE</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-5 pt-0 border-t border-slate-800 space-y-4 text-xs text-slate-300 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Sentinel-1 Orbit Geometry:</span>
                <span className="text-cyan-300">{analysisData.satelliteMetadata.afterImage.relativeOrbit}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SAR Polarization:</span>
                <span className="text-cyan-300">{analysisData.satelliteMetadata.afterImage.polarization}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Spatial Resolution:</span>
                <span className="text-cyan-300">{analysisData.satelliteMetadata.afterImage.resolutionMeters} meters (IW GRD)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AI Architecture:</span>
                <span className="text-purple-300">{analysisData.aiSegmentation.architecture}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AI Training Datasets:</span>
                <span className="text-amber-300">{analysisData.aiSegmentation.datasetUsed}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Test IoU / Accuracy:</span>
                <span className="text-emerald-300">IoU: {analysisData.aiSegmentation.iouScore} • Acc: {analysisData.aiSegmentation.accuracy}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2">
              <strong>Himalayan Domain Note:</strong> {analysisData.aiSegmentation.himalayanSceneNote}
            </div>
          </div>
        )}
      </div>

      {/* Why Modal */}
      <WhyModal
        isOpen={whyModal.isOpen}
        onClose={() => setWhyModal({ ...whyModal, isOpen: false })}
        title={whyModal.title}
        explanation={whyModal.explanation}
      />
    </div>
  );
};
