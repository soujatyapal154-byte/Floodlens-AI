import React from 'react';
import { AnalysisRunData, PageId } from '../types';
import { Printer, ShieldAlert } from 'lucide-react';

interface ReportPageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  analysisData,
  onSelectPage,
}) => {
  if (!analysisData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 pt-16 sm:pt-24">
        <h2 className="text-xl font-bold text-white">No Report Generated Yet</h2>
        <p className="text-xs text-slate-400">
          Please select an area and flood date on the Home overview first to generate a situation report.
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

  const handlePrint = () => {
    window.print();
  };

  const totalAffectedKm2 = Number((analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2).toFixed(1));
  const cutOffSettlements = analysisData.settlements.filter((s) => s.connectivityStatus === 'NO ROUTE FOUND');
  const detourSettlements = analysisData.settlements.filter((s) => s.connectivityStatus === 'POSSIBLY CUT OFF');
  const affectedRoads = analysisData.infrastructure.filter((i) => i.type === 'road' && i.status !== 'Clear');
  const affectedBridges = analysisData.infrastructure.filter((i) => i.type === 'bridge' && i.status !== 'Clear');
  const affectedBuildings = analysisData.infrastructure.filter((i) => i.type === 'building' && i.status !== 'Clear');

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Bar Action (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Situation Report (SitRep)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational briefing for {analysisData.areaName} ({analysisData.floodDate}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-primary-gradient flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-lg active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>DOWNLOAD / PRINT REPORT</span>
          </button>
        </div>
      </div>

      {/* One-Page Report Container */}
      <div className="enterprise-card text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Title & Metadata Header */}
        <div className="border-b-2 border-blue-500/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 print:text-blue-700 font-bold">
              FLOODLENS AI · SITUATION REPORT
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight mt-0.5">
              {analysisData.areaName}
            </h2>
          </div>

          <div className="text-right text-xs font-mono print:text-slate-700">
            <div>Flood Date: <b className="text-white print:text-black">{analysisData.floodDate}</b></div>
            <div>Generated: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800 leading-relaxed">
          <h3 className="font-bold text-cyan-300 print:text-blue-800 uppercase tracking-wider text-[11px]">
            1. Executive Summary
          </h3>
          <p>
            Automated satellite change detection using cloud-penetrating Sentinel-1 SAR imagery identified{' '}
            <strong>{totalAffectedKm2} km²</strong> of flood inundation and landslide debris in the {analysisData.areaName} basin.{' '}
            Pre-event OpenStreetMap road graph analysis identified <strong>{cutOffSettlements.length}</strong> settlements with no viable road connection
            remaining, and <strong>{detourSettlements.length}</strong> settlements requiring significant detours. All assessments are potential and require field verification.
          </p>
        </div>

        {/* 2. Flood-Affected Area */}
        <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800">
          <h3 className="font-bold text-cyan-300 print:text-blue-800 uppercase tracking-wider text-[11px]">
            2. Flood-Affected Area
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono tabular-nums">
            <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-sans block">Total Flood/Change:</span>
              <span className="text-base font-bold text-cyan-400 print:text-blue-800">{totalAffectedKm2} km²</span>
            </div>
            <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-sans block">Standing Water:</span>
              <span className="text-base font-bold text-white print:text-black">{analysisData.floodSummary.floodedAreaKm2} km²</span>
            </div>
            <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-sans block">Debris / Landslide:</span>
              <span className="text-base font-bold text-amber-400 print:text-amber-800">{analysisData.floodSummary.debrisAreaKm2} km²</span>
            </div>
            <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-sans block">Radar Confidence:</span>
              <span className="text-base font-bold text-emerald-400 print:text-emerald-800">{analysisData.floodSummary.sarConfidencePercent}%</span>
            </div>
          </div>
        </div>

        {/* 3. Potentially Affected Infrastructure */}
        <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800">
          <h3 className="font-bold text-cyan-300 print:text-blue-800 uppercase tracking-wider text-[11px]">
            3. Potentially Affected Infrastructure
          </h3>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li><strong>Roads:</strong> {affectedRoads.length} sections overlap or lie within 25m of flood surge (e.g. {affectedRoads[0]?.name || 'Valley Road'}).</li>
            <li><strong>Bridges:</strong> {affectedBridges.length} bridges potentially affected by abutment scour.</li>
            <li><strong>Buildings:</strong> {affectedBuildings.length} building clusters intersect detected water lines.</li>
          </ul>
        </div>

        {/* 4. Potentially Cut-Off Settlements */}
        <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800">
          <h3 className="font-bold text-cyan-300 print:text-blue-800 uppercase tracking-wider text-[11px]">
            4. Potentially Cut-Off Settlements &amp; Road Connectivity
          </h3>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>
              <strong>No Route Found:</strong> {cutOffSettlements.map((s) => `${s.name} (Pop: ${s.populationEstimate})`).join(', ') || 'None'}.
            </li>
            <li>
              <strong>Possibly Cut Off (Detour Needed):</strong> {detourSettlements.map((s) => `${s.name} (detour to ${s.nearestTownOrHospital})`).join(', ') || 'None'}.
            </li>
          </ul>
        </div>

        {/* 5. Satellite Data Used & AI Findings */}
        <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800">
          <h3 className="font-bold text-cyan-300 print:text-blue-800 uppercase tracking-wider text-[11px]">
            5. Satellite Data Used &amp; AI Findings
          </h3>
          <p className="text-[11px] leading-relaxed">
            Primary sensor: <strong>Sentinel-1 C-SAR</strong> ({analysisData.satelliteMetadata.afterImage.relativeOrbit}, {analysisData.satelliteMetadata.afterImage.polarization}).{' '}
            Optical sensor: Sentinel-2 checked ({analysisData.satelliteMetadata.opticalStatusNote}).{' '}
            AI Model: <strong>{analysisData.aiSegmentation.architecture}</strong> evaluated zero-shot (IoU: {analysisData.aiSegmentation.iouScore}, F1: {analysisData.aiSegmentation.f1Score}).
          </p>
        </div>

        {/* 6. Scientific Limitations & Attribution */}
        <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 text-[10px] text-slate-400 print:text-slate-600 space-y-1.5">
          <div className="font-bold text-amber-300 print:text-amber-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Limitations &amp; Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            Satellite imagery has multi-day revisit latency; events between passes may leave only residual trace.
            Mountain radar contains geometric shadow effects. Pre-event OSM data may lack informal footpaths.
            Road connectivity does not prove physical isolation. All results require ground verification.
          </p>
          <div className="pt-1 border-t border-slate-800 print:border-slate-300 font-mono text-[9px]">
            Contains modified Copernicus Sentinel data 2026. © OpenStreetMap contributors. Copernicus DEM © Airbus/DLR/ESA. AI trained on Sen1Floods11 and Kuro Siwo.
          </div>
        </div>
      </div>
    </div>
  );
};
