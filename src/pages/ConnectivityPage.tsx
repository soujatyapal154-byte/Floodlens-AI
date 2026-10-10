import React, { useState } from 'react';
import { AnalysisRunData, PageId } from '../types';
import {
  Hospital,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
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
          Please select an area and flood date on the Home overview first.
        </p>
        <button
          onClick={() => onSelectPage('home')}
          className="btn-primary-gradient px-6 py-2.5 rounded-xl font-bold text-xs"
        >
          GO TO HOME
        </button>
      </div>
    );
  }

  const settlements = analysisData.settlements || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Estimated Road-Network Connectivity
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Topological graph analysis evaluating whether mountain communities retain passable driving routes to medical facilities in {analysisData.areaName}.
        </p>
      </div>

      {/* Mandatory Phrasing Caveat */}
      <div className="enterprise-card p-4 rounded-xl text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Notice:</strong> We use the term <em>"Estimated road-network connectivity"</em>.
          This analyzes vehicular roadways mapped before the event. It does <strong>NOT</strong> prove that people are
          physically trapped, as pedestrian paths, helicopter evacuation, or unmapped trails may exist.
        </p>
      </div>

      {/* Settlements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settlements.map((st) => {
          const isCutOff = st.connectivityStatus === 'NO ROUTE FOUND';
          const isPossible = st.connectivityStatus === 'POSSIBLY CUT OFF';

          return (
            <div
              key={st.id}
              className={`enterprise-card rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 ${
                isCutOff
                  ? 'border-rose-800/70 glow-card-rose'
                  : isPossible
                  ? 'border-amber-800/70 glow-card-amber'
                  : 'glow-card-cyan'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white tracking-tight">{st.name}</h3>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                      isCutOff
                        ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80'
                        : isPossible
                        ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                        : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80'
                    }`}
                  >
                    {st.connectivityStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 font-mono tabular-nums">
                  <div className="flex items-center gap-1.5 font-sans">
                    <Hospital className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Emergency Center: <b className="text-slate-200">{st.nearestTownOrHospital}</b></span>
                  </div>
                  <div>
                    Normal Baseline Distance: <b className="text-slate-200">{st.normalDistanceKm} km</b>
                  </div>
                  <div>
                    Estimated Road Route:{' '}
                    <b className={isCutOff ? 'text-rose-400 font-bold' : isPossible ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {st.currentEstimatedRouteKm !== null ? `${st.currentEstimatedRouteKm} km` : 'NO PASSABLE ROAD FOUND'}
                    </b>
                  </div>
                </div>

                <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                  {st.routingAnalysisNote}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() =>
                    setWhyModal({
                      isOpen: true,
                      title: `Why is ${st.name} marked ${st.connectivityStatus}?`,
                      explanation: st.whyExplanation,
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-all active:scale-95"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why is this marked?</span>
                </button>

                <button
                  onClick={() => onSelectPage('map')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-medium"
                >
                  <span>View on Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
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
