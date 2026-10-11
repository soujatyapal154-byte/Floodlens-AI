import React, { useState } from 'react';
import { AnalysisRunData, PageId } from '../types';
import {
  Hospital,
  HelpCircle,
  ShieldAlert,
  MapPin,
  ChevronDown,
  ChevronUp,
  GitFork,
  ArrowRight,
  Route,
} from 'lucide-react';
import { WhyModal } from '../components/WhyModal';

interface ConnectivityPageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
}

export const ConnectivityPage: React.FC<ConnectivityPageProps> = ({
  analysisData,
  onSelectPage,
}) => {
  const [expandedSettlementId, setExpandedSettlementId] = useState<string | null>(null);
  const [whyModal, setWhyModal] = useState<{
    isOpen: boolean;
    title: string;
    explanation: string;
  }>({
    isOpen: false,
    title: '',
    explanation: '',
  });

  if (!analysisData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 pt-16 sm:pt-24">
        <h2 className="text-xl font-bold text-white">No Connectivity Data</h2>
        <p className="text-xs text-slate-400">
          Please select an area and flood date on the Home overview first to load the settlement connectivity graph.
        </p>
        <button
          onClick={() => onSelectPage('home')}
          className="field-touch-target btn-primary-gradient px-6 py-2.5 rounded-xl font-bold text-xs mx-auto"
        >
          GO TO COMMAND OVERVIEW
        </button>
      </div>
    );
  }

  const settlements = analysisData.settlements || [];
  const cutOffCount = settlements.filter((s) => s.connectivityStatus === 'NO ROUTE FOUND').length;
  const detourCount = settlements.filter((s) => s.connectivityStatus === 'POSSIBLY CUT OFF').length;
  const connectedCount = settlements.filter((s) => s.connectivityStatus === 'CONNECTED').length;

  const toggleExpand = (id: string) => {
    setExpandedSettlementId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
          <span>Topological Routing Graph · Dijkstra Network</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
          Settlement Evacuation &amp; Road Isolation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time network connectivity analysis measuring unbroken road access to hospitals &amp; emergency centers in {analysisData.areaName}.
        </p>
      </div>

      {/* Mandatory Phrasing Caveat */}
      <div className="command-card p-4 rounded-xl text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Notice:</strong> We use the term <em>"Estimated road-network connectivity"</em>.
          This analyzes vehicular roadways mapped prior to disaster onset. It does <strong>NOT</strong> prove that residents are physically trapped,
          as footpath traverses, non-motorized bridges, or unmapped trails may remain navigable.
        </p>
      </div>

      {/* SUMMARY TRIAGE BAR */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="command-card rounded-2xl p-3 sm:p-4 border-rose-800/50 bg-rose-950/20">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
            🔴 Critical Cut-off
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {cutOffCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            No passable road
          </span>
        </div>

        <div className="command-card rounded-2xl p-3 sm:p-4 border-amber-800/50 bg-amber-950/20">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            🟠 Detour Required
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {detourCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Alternate mountain route
          </span>
        </div>

        <div className="command-card rounded-2xl p-3 sm:p-4 border-emerald-800/50 bg-emerald-950/20">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            🟢 Connected
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {connectedCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Passable road intact
          </span>
        </div>
      </div>

      {/* Settlements Grid with Progressive Disclosure */}
      <div className="space-y-4">
        {settlements.map((st) => {
          const isCutOff = st.connectivityStatus === 'NO ROUTE FOUND';
          const isDetour = st.connectivityStatus === 'POSSIBLY CUT OFF';
          const isExpanded = expandedSettlementId === st.id;

          const chip = isCutOff ? (
            <span className="status-chip-critical">🔴 CRITICAL ISOLATION</span>
          ) : isDetour ? (
            <span className="status-chip-high">🟠 DETOUR REQUIRED</span>
          ) : (
            <span className="status-chip-passable">🟢 CONNECTED</span>
          );

          return (
            <div
              key={st.id}
              className={`command-card rounded-2xl p-4 sm:p-5 transition-all duration-150 ${
                isCutOff ? 'border-rose-800/60' : isDetour ? 'border-amber-800/60' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {chip}
                    <h3 className="font-bold text-base text-white tracking-tight">{st.name}</h3>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono pt-1">
                    <span>Pop: <strong className="text-white font-mono">{st.populationEstimate.toLocaleString()}</strong></span>
                    <span>·</span>
                    <span>Elev: <strong className="text-white font-mono">{st.elevationMeters}m</strong></span>
                    <span>·</span>
                    <span className="text-slate-300 font-sans flex items-center gap-1">
                      <Hospital className="w-3.5 h-3.5 text-blue-400" />
                      <span>{st.nearestTownOrHospital}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setWhyModal({
                        isOpen: true,
                        title: `Why is ${st.name} marked ${st.connectivityStatus}?`,
                        explanation: st.whyExplanation,
                      })
                    }
                    className="field-touch-target px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4 mr-1 text-cyan-400" />
                    <span>Why?</span>
                  </button>

                  <button
                    onClick={() => toggleExpand(st.id)}
                    className="field-touch-target px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Less' : 'Details'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progressive Disclosure: Routing Telemetry */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Normal Baseline Distance</span>
                      <span className="text-white font-bold text-sm">{st.normalDistanceKm} km</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Current Post-Event Distance</span>
                      <span className={`font-bold text-sm ${isCutOff ? 'text-rose-400' : isDetour ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {st.currentEstimatedRouteKm !== null ? `${st.currentEstimatedRouteKm} km` : 'NO PASSABLE ROAD FOUND'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Routing Analysis Note:</span>
                    <p className="text-slate-300 leading-relaxed font-sans">{st.routingAnalysisNote}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
