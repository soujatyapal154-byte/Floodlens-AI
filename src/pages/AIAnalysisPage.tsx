import React from 'react';
import { AnalysisRunData, PageId } from '../types';
import { ShieldAlert } from 'lucide-react';

interface AIAnalysisPageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
}

export const AIAnalysisPage: React.FC<AIAnalysisPageProps> = ({
  analysisData,
  onSelectPage,
}) => {
  if (!analysisData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 pt-16 sm:pt-24">
        <h2 className="text-xl font-bold text-white">No AI Analysis Data</h2>
        <p className="text-xs text-slate-400">
          Please select an area and flood date on the Home overview first to evaluate the AI flood segmentation model.
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

  const ai = analysisData.aiSegmentation;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          AI Flood Segmentation (U-Net)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep learning segmentation network evaluated on the {analysisData.areaName} satellite scene.
        </p>
      </div>

      {/* Mandatory AI Label Notice */}
      <div className="command-card p-4 rounded-xl border-purple-800/50 bg-purple-950/20 text-xs text-purple-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Notice:</strong> All outputs from the deep learning component are classified as{' '}
          <em>"AI prediction"</em> rather than confirmed damage. Results are cross-checked with radar backscatter thresholds.
        </p>
      </div>

      {/* Four AI Classes */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Segmentation Classes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="command-card p-3.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block mb-1"></span>
            <div className="font-bold text-white">Water / Flood</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Smooth radar reflection</div>
          </div>

          <div className="command-card p-3.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block mb-1"></span>
            <div className="font-bold text-white">Possible Debris</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Rough mudflow change</div>
          </div>

          <div className="command-card p-3.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-slate-400 inline-block mb-1"></span>
            <div className="font-bold text-white">Normal Land</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Dry mountain terrain</div>
          </div>

          <div className="command-card p-3.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mb-1"></span>
            <div className="font-bold text-white">Uncertain</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Mountain radar shadow</div>
          </div>
        </div>
      </div>

      {/* Actual Calculated Model Metrics */}
      <div className="command-card rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Model Metrics (Sen1Floods11 &amp; Kuro Siwo)</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-sans">Intersection over Union (IoU)</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{ai.iouScore}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-sans">Precision</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{ai.precisionScore}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-sans">Recall</div>
            <div className="text-xl font-bold text-blue-300 mt-1">{ai.recallScore}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-sans">F1 Score</div>
            <div className="text-xl font-bold text-purple-300 mt-1">{ai.f1Score}</div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800 leading-relaxed">
          <p>
            <strong>Architecture:</strong> {ai.architecture}
          </p>
          <p>
            <strong>Encoder Backbone:</strong> {ai.backbone}
          </p>
          <p>
            <strong>Training Datasets:</strong> {ai.datasetUsed}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            {ai.himalayanSceneNote}
          </p>
        </div>
      </div>
    </div>
  );
};
