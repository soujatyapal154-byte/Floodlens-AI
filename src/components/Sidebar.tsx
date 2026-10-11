import React from 'react';
import {
  Home,
  Waves,
  Map as MapIcon,
  Home as HomeIcon,
  GitFork,
  Cpu,
  FileText,
  Database,
  Info,
  X,
  Radio,
  Terminal,
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isMobileOpen,
  onCloseMobile,
}) => {
  const primaryMenuItems: Array<{
    id: PageId;
    label: string;
    code: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Command Overview & Setup', code: '01', icon: Home },
    { id: 'analysis', label: 'SAR Flood Analysis', code: '02', icon: Waves },
    { id: 'map', label: 'Interactive Tactical Map', code: '03', icon: MapIcon },
    { id: 'infrastructure', label: 'Infrastructure Exposure', code: '04', icon: HomeIcon },
    { id: 'connectivity', label: 'Settlement Connectivity', code: '05', icon: GitFork },
    { id: 'ai', label: 'AI Segmentation Model', code: '06', icon: Cpu },
    { id: 'report', label: 'Situation Report (SitRep)', code: '07', icon: FileText },
  ];

  const referenceMenuItems: Array<{
    id: PageId;
    label: string;
    code: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'datasources', label: 'Data Sources & Provenance', code: 'REF-A', icon: Database },
    { id: 'limitations', label: 'SAR Terrain Limitations', code: 'REF-B', icon: Info },
  ];

  const handleNavClick = (pageId: PageId) => {
    onSelectPage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 pb-16 md:pb-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-5">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                FL
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Command Console</span>
                <span className="text-[10px] font-mono text-cyan-400">DISASTER NAVIGATION</span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="field-touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Operations Category */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Operational Modules
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80">OPS-7</span>
            </div>

            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`field-touch-target relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-600/15 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isActive && (
                      <span className="absolute left-1 inset-y-2 w-1 bg-cyan-400 rounded-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">
                    {item.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reference & Scientific Governance Category */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Scientific Governance
              </span>
              <span className="text-[10px] font-mono text-slate-500">SAR-SPECS</span>
            </div>

            {referenceMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`field-touch-target relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-600/15 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isActive && (
                      <span className="absolute left-1 inset-y-2 w-1 bg-cyan-400 rounded-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">
                    {item.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Official Enterprise Status Bar */}
        <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 font-mono text-[11px]">COPERNICUS SAR</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
              SENTINEL-1
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono leading-tight">
            IW GRD · 30m Copernicus DEM Flow
          </p>
        </div>
      </aside>
    </>
  );
};
