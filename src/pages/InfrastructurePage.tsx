import React, { useState } from 'react';
import { AnalysisRunData, PageId, InfrastructureFeature } from '../types';
import {
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { WhyModal } from '../components/WhyModal';

interface InfrastructurePageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
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
        <h2 className="text-xl font-bold text-white">No Infrastructure Data</h2>
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

  const items = analysisData.infrastructure || [];
  const roads = items.filter((i) => i.type === 'road');
  const bridges = items.filter((i) => i.type === 'bridge');
  const buildings = items.filter((i) => i.type === 'building');

  const renderTable = (features: InfrastructureFeature[], title: string, badgeColor: string) => {
    if (features.length === 0) return null;

    return (
      <div className="enterprise-card rounded-2xl shadow-xl overflow-hidden space-y-2">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white tracking-tight">{title}</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {features.length} features
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {features.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {item.name}
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">{item.notes}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.locationDescription}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                        item.status === 'Potentially affected'
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-800/60'
                          : item.status === 'Possible damage'
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-800/60'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() =>
                        setWhyModal({
                          isOpen: true,
                          title: `Why is ${item.name} marked?`,
                          explanation: item.whyExplanation,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-all active:scale-95"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Why?</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Potentially Affected Infrastructure
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          OpenStreetMap features intersecting detected SAR flood/debris zones in {analysisData.areaName}.
        </p>
      </div>

      {/* Mandatory Phrasing Caveat */}
      <div className="enterprise-card p-4 rounded-xl border border-amber-800/50 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Notice:</strong> We use the term <em>"POTENTIALLY AFFECTED"</em> rather than <em>"DESTROYED"</em>.
          Satellite imagery detects water proximity and change, but ground inspections are needed to confirm physical damage.
        </p>
      </div>

      {/* Tables by Category */}
      <div className="space-y-6">
        {renderTable(roads, 'Roads Potentially Affected', 'bg-rose-950 text-rose-300 border border-rose-800')}
        {renderTable(bridges, 'Bridges Potentially Affected', 'bg-amber-950 text-amber-300 border border-amber-800')}
        {renderTable(buildings, 'Buildings Potentially Affected', 'bg-blue-950 text-blue-300 border border-blue-800')}
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
