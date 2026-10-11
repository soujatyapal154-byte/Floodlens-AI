import React, { useState } from 'react';
import { AnalysisRunData, PageId, InfrastructureFeature } from '../types';
import {
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { WhyModal } from '../components/WhyModal';

interface InfrastructurePageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
}

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE';

const getSeverity = (feature: InfrastructureFeature): {
  level: SeverityLevel;
  label: string;
  chipClass: string;
} => {
  if (feature.status === 'Potentially affected' || feature.overlapDegree === 'High') {
    return {
      level: 'CRITICAL',
      label: '🔴 CRITICAL',
      chipClass: 'status-chip-critical',
    };
  }
  if (feature.status === 'Possible damage' || feature.overlapDegree === 'Medium') {
    return {
      level: 'HIGH',
      label: '🟠 HIGH',
      chipClass: 'status-chip-high',
    };
  }
  return {
    level: 'MODERATE',
    label: '🟡 MODERATE',
    chipClass: 'status-chip-moderate',
  };
};

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
  analysisData,
  onSelectPage,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | SeverityLevel>('ALL');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
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
        <h2 className="text-xl font-bold text-white">No Infrastructure Data</h2>
        <p className="text-xs text-slate-400">
          Please select an area and flood date on the Home overview first to load the infrastructure analysis.
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

  const items = analysisData.infrastructure || [];
  const criticalCount = items.filter((i) => getSeverity(i).level === 'CRITICAL').length;
  const highCount = items.filter((i) => getSeverity(i).level === 'HIGH').length;
  const moderateCount = items.filter((i) => getSeverity(i).level === 'MODERATE').length;

  const filteredItems = items.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return getSeverity(item).level === filterSeverity;
  });

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const roads = filteredItems.filter((i) => i.type === 'road');
  const bridges = filteredItems.filter((i) => i.type === 'bridge');
  const buildings = filteredItems.filter((i) => i.type === 'building');

  const renderSection = (features: InfrastructureFeature[], sectionTitle: string, icon: string) => {
    if (features.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <h2 className="font-bold text-sm text-white tracking-tight">{sectionTitle}</h2>
          </div>
          <span className="font-mono text-[11px] text-slate-400 font-semibold">
            {features.length} {features.length === 1 ? 'target' : 'targets'}
          </span>
        </div>

        <div className="space-y-2.5">
          {features.map((item) => {
            const sev = getSeverity(item);
            const isExpanded = !!expandedCards[item.id];

            return (
              <div
                key={item.id}
                className="command-card rounded-2xl p-4 sm:p-5 transition-all duration-150"
              >
                {/* Primary Row: Thumb-Friendly Header & Universal Severity Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={sev.chipClass}>{sev.label}</span>
                      <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{item.locationDescription}</span>
                    </p>
                  </div>

                  {/* Why Button with Large Touch Target */}
                  <button
                    onClick={() =>
                      setWhyModal({
                        isOpen: true,
                        title: `Why is ${item.name} marked ${sev.level}?`,
                        explanation: item.whyExplanation,
                      })
                    }
                    className="field-touch-target px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95 shrink-0"
                    title="View scientific reason"
                  >
                    <HelpCircle className="w-4 h-4 mr-1 text-cyan-400" />
                    <span>Why?</span>
                  </button>
                </div>

                {/* Progressive Disclosure: Quick Overview Notes & Expand Toggle */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-300 font-mono">
                    Overlap: <strong className="text-white">{item.overlapDegree}</strong> · Confidence: <strong className="text-cyan-300">{item.confidencePercent}%</strong>
                  </span>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="field-touch-target text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Field Details'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expandable Accordion Body (Telemetry & Notes) */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Field Operational Notes:</span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed">{item.notes}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Detection Basis:</span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{item.whyExplanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
          <span>Sentinel-1 SAR GIS Exposure Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
          Infrastructure Exposure &amp; Alert Triage
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pre-event OpenStreetMap features intersecting detected SAR flood &amp; debris zones in {analysisData.areaName}.
        </p>
      </div>

      {/* Mandatory Phrasing Caveat */}
      <div className="command-card p-4 rounded-xl border border-amber-800/50 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Standard Operating Protocol:</strong> All elements are marked as <em>"POTENTIALLY AFFECTED"</em> rather than <em>"CONFIRMED DESTROYED"</em>.
          Radar measurements calculate backscatter deviation and buffer proximity; emergency dispatch requires ground confirmation.
        </p>
      </div>

      {/* FIELD-SIMPLICITY TRIAGE TILES (Large touch targets for rapid triage) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Critical Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`command-card rounded-2xl p-3 sm:p-4 text-left transition-all active:scale-95 ${
            filterSeverity === 'CRITICAL'
              ? 'ring-2 ring-rose-500 bg-rose-950/30'
              : 'hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              🔴 Critical
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {criticalCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Immediate breach risk
          </span>
        </button>

        {/* High Risk Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`command-card rounded-2xl p-3 sm:p-4 text-left transition-all active:scale-95 ${
            filterSeverity === 'HIGH'
              ? 'ring-2 ring-amber-500 bg-amber-950/30'
              : 'hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              🟠 High Risk
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {highCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Scouring / Detour
          </span>
        </button>

        {/* Moderate Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'MODERATE' ? 'ALL' : 'MODERATE')}
          className={`command-card rounded-2xl p-3 sm:p-4 text-left transition-all active:scale-95 ${
            filterSeverity === 'MODERATE'
              ? 'ring-2 ring-yellow-500 bg-yellow-950/30'
              : 'hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
              🟡 Moderate
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {moderateCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Buffer proximity
          </span>
        </button>
      </div>

      {/* Interactive Filter Pills / Reset */}
      {filterSeverity !== 'ALL' && (
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs">
          <span className="text-slate-300">
            Filtering by <strong>{filterSeverity}</strong> ({filteredItems.length} items)
          </span>
          <button
            onClick={() => setFilterSeverity('ALL')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs px-2 py-1"
          >
            Show All Assets
          </button>
        </div>
      )}

      {/* Sections Rendered with Progressive Disclosure */}
      <div className="space-y-6">
        {renderSection(roads, 'Road Network Corridors', '🛣️')}
        {renderSection(bridges, 'Critical River Bridges', '🌉')}
        {renderSection(buildings, 'Building Clusters & Facilities', '🏠')}
      </div>

      {filteredItems.length === 0 && (
        <div className="command-card rounded-2xl p-8 text-center text-slate-400 text-xs">
          No infrastructure items found matching current severity filter ({filterSeverity}).
        </div>
      )}

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
