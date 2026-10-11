import React from 'react';
import { Layers, MapPin, Calendar, Bot, Menu, Sun, Moon, Radio, Compass, Shield } from 'lucide-react';
import { PageId, AnalysisRunData } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  analysisData: AnalysisRunData | null;
  onSelectPage: (page: PageId) => void;
  onOpenAiAssistant: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  analysisData,
  onSelectPage,
  onOpenAiAssistant,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Left: Scientific Command Lockup & Drawer Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className={`field-touch-target p-2 rounded-xl transition-all md:hidden active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
            isMobileMenuOpen
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label={isMobileMenuOpen ? "Close Command Navigation Menu" : "Toggle Command Navigation Menu"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectPage('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-active:scale-95 transition-all">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors font-sans">
                FloodLens AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                SAR OPS
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block font-medium">
              Geospatial Command &amp; Road Connectivity Center
            </p>
          </div>
        </button>
      </div>

      {/* Center: Scientific Telemetry Stream & Geographic Coordinate Overlay */}
      {analysisData ? (
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate max-w-[180px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{analysisData.areaName.split(',')[0]}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{analysisData.floodDate}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            Δσ⁰ ≤ -18.4dB
          </span>
          <span className="text-slate-600 hidden lg:inline" aria-hidden="true">·</span>
          <span className="text-[11px] text-emerald-400 font-medium hidden lg:inline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sentinel-1 IW
          </span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">Himalayan Basin Hydro-Terrain Command</span>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] text-slate-500">Copernicus SAR &amp; DEM 30m</span>
        </div>
      )}

      {/* Right: Dual Theme Switcher (Command vs Sunlight) & AI Copilot Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dual Theme Toggle: Tactical Command Dark Mode vs Field Sunlight Light Mode */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === 'dark'
              ? 'Tactical Command Dark Mode active. Click to switch to Field Sunlight Light Mode.'
              : 'Field Sunlight Light Mode active. Click to switch to Tactical Command Dark Mode.'
          }
          aria-label={
            theme === 'dark'
              ? 'Switch to Field Sunlight Light Mode'
              : 'Switch to Tactical Command Dark Mode'
          }
          className="field-touch-target relative flex items-center p-1 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          {/* Field Sunlight Mode Button (Sun) */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
              theme === 'light'
                ? 'bg-white text-amber-600 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Sunlight</span>
          </div>

          {/* Tactical Command Dark Mode Button (Half Moon) */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
              theme === 'dark'
                ? 'bg-slate-900 text-cyan-300 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Command</span>
          </div>
        </button>

        {/* Ask AI Copilot Button */}
        <button
          onClick={onOpenAiAssistant}
          className="field-touch-target btn-primary-gradient flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        >
          <Bot className="w-4 h-4 shrink-0 text-cyan-200" />
          <span className="hidden xs:inline sm:inline whitespace-nowrap">AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
