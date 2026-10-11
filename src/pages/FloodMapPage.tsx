import React, { useState } from 'react';
import { AnalysisRunData, PageId, FlowPathResult } from '../types';
import { MapViewer } from '../components/MapViewer';
import { Mountain, ShieldAlert, Bot } from 'lucide-react';
import { calculateFlowPath } from '../services/api';

interface FloodMapPageProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
  onOpenAiAssistant: () => void;
  initialLayersOpen?: boolean;
  layersOpen?: boolean;
  onLayersOpenChange?: (open: boolean) => void;
}

export const FloodMapPage: React.FC<FloodMapPageProps> = ({
  analysisData,
  onSelectPage,
  onOpenAiAssistant,
  initialLayersOpen = false,
  layersOpen,
  onLayersOpenChange,
}) => {
  const [flowPathData, setFlowPathData] = useState<FlowPathResult | null>(null);
  const [isCalculatingFlow, setIsCalculatingFlow] = useState(false);

  if (!analysisData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 pt-16 sm:pt-24">
        <h2 className="text-xl font-bold text-white">No Map Data Available</h2>
        <p className="text-xs text-slate-400">
          Please select an area and flood date on the Home overview first to view the satellite flood map.
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

  const handleMapClick = async (coords: [number, number]) => {
    setIsCalculatingFlow(true);
    try {
      const result = await calculateFlowPath(coords);
      if (result) {
        setFlowPathData(result);
      }
    } finally {
      setIsCalculatingFlow(false);
    }
  };

  const totalArea = Number((analysisData.floodSummary.floodedAreaKm2 + analysisData.floodSummary.debrisAreaKm2).toFixed(1));

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto animate-in fade-in">
      {/* Top Bar Summary */}
      <div className="enterprise-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
            Operational SAR GIS Map
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{analysisData.areaName}</h1>
          <p className="text-xs text-slate-400">
            Detected: <b className="text-cyan-300 font-mono">{totalArea} km²</b> flood &amp; debris · {analysisData.floodDate} · Sentinel-1 IW GRD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiAssistant}
            className="btn-primary-gradient flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            <Bot className="w-4 h-4 text-cyan-200" />
            <span>Ask About This Map</span>
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-2">
        <div className="enterprise-card rounded-2xl overflow-hidden p-1 shadow-2xl">
          <MapViewer
            analysisData={{
              ...analysisData,
              flowPath: flowPathData || analysisData.flowPath,
            }}
            heightClass="h-[520px] sm:h-[620px]"
            showFlowPath={true}
            onMapClickCoordinate={handleMapClick}
            initialLayersOpen={initialLayersOpen}
            layersOpen={layersOpen}
            onLayersOpenChange={onLayersOpenChange}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any point on the map to calculate downstream terrain steepest-descent path.</span>
          </span>
          {isCalculatingFlow && (
            <span className="text-cyan-400 font-medium animate-pulse">
              Calculating terrain flow path...
            </span>
          )}
        </div>
      </div>

      {/* Downhill Flow Path Notice */}
      <div className="enterprise-card rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Copernicus DEM steepest-descent flow approximation:</strong> Uses 30m digital elevation model topography
          to estimate surface water runoff vectors. This provides rapid emergency situational awareness, not a full 2D hydrodynamic simulation.
        </p>
      </div>
    </div>
  );
};
