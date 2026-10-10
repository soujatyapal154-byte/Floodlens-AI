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
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
  }> = [
    { id: 'home', label: 'Overview & Setup', icon: Home },
    { id: 'analysis', label: 'Flood Analysis', icon: Waves },
    { id: 'map', label: 'Interactive SAR Map', icon: MapIcon },
    { id: 'infrastructure', label: 'Infrastructure Exposure', icon: HomeIcon },
    { id: 'connectivity', label: 'Settlement Connectivity', icon: GitFork },
    { id: 'ai', label: 'AI Segmentation Model', icon: Cpu },
    { id: 'report', label: 'Situation Report (SitRep)', icon: FileText },
  ];

  const referenceMenuItems: Array<{
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'datasources', label: 'Data Sources & Provenance', icon: Database },
    { id: 'limitations', label: 'SAR Terrain Limitations', icon: Info },
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
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-3.5 flex-1 overflow-y-auto space-y-5">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                FL
              </div>
              <span className="font-bold text-sm text-white">Disaster Navigation</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Operations Category */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block pb-1">
              Mission Operations
            </span>
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-600/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-1 inset-y-2 w-1 bg-cyan-400 rounded-full" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reference & Governance Category */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block py-1">
              Scientific Reference
            </span>
            {referenceMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-600/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-1 inset-y-2 w-1 bg-cyan-400 rounded-full" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Official Enterprise Status Bar */}
        <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">FloodLens AI</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
              v3.2 PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Copernicus Sentinel-1 SAR Engine
          </p>
        </div>
      </aside>
    </>
  );
};
