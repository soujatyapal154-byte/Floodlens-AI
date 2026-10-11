import React from 'react';
import {
  Map as MapIcon,
  Layers,
  Home as HomeIcon,
  Bot,
  LayoutGrid,
} from 'lucide-react';
import { PageId, AnalysisRunData } from '../types';

interface BottomNavProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  onToggleLayers: () => void;
  isLayersOpen?: boolean;
  onOpenAiCopilot: () => void;
  isAiCopilotOpen?: boolean;
  onToggleMoreMenu: () => void;
  isMenuOpen?: boolean;
  analysisData: AnalysisRunData | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onSelectPage,
  onToggleLayers,
  isLayersOpen = false,
  onOpenAiCopilot,
  isAiCopilotOpen = false,
  onToggleMoreMenu,
  isMenuOpen = false,
  analysisData,
}) => {
  const isMapActive = currentPage === 'map' && !isLayersOpen;

  return (
    <nav
      aria-label="Field Navigation Dock"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-2 py-1 transition-colors"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.375rem)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto gap-1">
        {/* 1. [Map View] */}
        <button
          type="button"
          onClick={() => onSelectPage('map')}
          className={`field-touch-target relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
            isMapActive
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Map View"
        >
          {isMapActive && (
            <span
              className="absolute inset-0 bg-cyan-500/15 rounded-xl -z-10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              aria-hidden="true"
            />
          )}
          <MapIcon
            className={`w-5 h-5 transition-transform ${
              isMapActive ? 'scale-110 text-cyan-400' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] mt-0.5 tracking-tight font-sans">
            Map View
          </span>
        </button>

        {/* 2. [Layers] - Glows when active like rest of buttons */}
        <button
          type="button"
          onClick={onToggleLayers}
          className={`field-touch-target relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
            isLayersOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={isLayersOpen ? "Close SAR and Infrastructure Layers" : "Toggle SAR and Infrastructure Layers"}
        >
          {isLayersOpen && (
            <span
              className="absolute inset-0 bg-cyan-500/15 rounded-xl -z-10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              aria-hidden="true"
            />
          )}
          <Layers
            className={`w-5 h-5 transition-transform ${
              isLayersOpen ? 'scale-110 text-cyan-400' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] mt-0.5 tracking-tight font-sans">
            Layers
          </span>
        </button>

        {/* 3. [Infrastructure] */}
        <button
          type="button"
          onClick={() => onSelectPage('infrastructure')}
          className={`field-touch-target relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
            currentPage === 'infrastructure'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Infrastructure Exposure"
        >
          {currentPage === 'infrastructure' && (
            <span
              className="absolute inset-0 bg-amber-500/15 rounded-xl -z-10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              aria-hidden="true"
            />
          )}
          <HomeIcon
            className={`w-5 h-5 transition-transform ${
              currentPage === 'infrastructure' ? 'scale-110 text-amber-400' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] mt-0.5 tracking-tight font-sans">
            Infrastructure
          </span>
        </button>

        {/* 4. [AI Copilot] */}
        <button
          type="button"
          onClick={onOpenAiCopilot}
          className={`field-touch-target relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
            isAiCopilotOpen
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Open AI Copilot"
        >
          {isAiCopilotOpen && (
            <span
              className="absolute inset-0 bg-blue-500/15 rounded-xl -z-10 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
              aria-hidden="true"
            />
          )}
          <Bot
            className={`w-5 h-5 transition-transform ${
              isAiCopilotOpen ? 'scale-110 text-blue-400' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] mt-0.5 tracking-tight font-sans">
            AI Copilot
          </span>
        </button>

        {/* 5. [Menu] - Toggles Command Console open/close */}
        <button
          type="button"
          onClick={onToggleMoreMenu}
          className={`field-touch-target relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
            isMenuOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={isMenuOpen ? "Close Command Navigation Menu" : "Open Command Navigation Menu"}
        >
          {isMenuOpen && (
            <span
              className="absolute inset-0 bg-cyan-500/15 rounded-xl -z-10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              aria-hidden="true"
            />
          )}
          <LayoutGrid
            className={`w-5 h-5 transition-transform ${
              isMenuOpen ? 'scale-110 text-cyan-400' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] mt-0.5 tracking-tight font-sans">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
