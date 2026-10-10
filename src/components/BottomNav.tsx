import React from 'react';
import {
  Home,
  Waves,
  Map as MapIcon,
  Bot,
  FileText,
  Menu,
} from 'lucide-react';
import { PageId, AnalysisRunData } from '../types';

interface BottomNavProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  onToggleMoreMenu: () => void;
  analysisData: AnalysisRunData | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onSelectPage,
  onToggleMoreMenu,
  analysisData,
}) => {
  const navItems = [
    { id: 'home' as PageId, label: 'Home', icon: Home },
    {
      id: 'analysis' as PageId,
      label: 'Analysis',
      icon: Waves,
      hasBadge: !!analysisData,
    },
    { id: 'map' as PageId, label: 'Map', icon: MapIcon },
    { id: 'ai' as PageId, label: 'AI Copilot', icon: Bot },
    { id: 'report' as PageId, label: 'SitRep', icon: FileText },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 transition-colors"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.375rem)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <span
                  className="absolute inset-x-2 inset-y-0.5 bg-cyan-500/10 rounded-xl -z-10 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  aria-hidden="true"
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'
                  }`}
                />
                {item.hasBadge && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900"
                    title="Analysis active"
                  />
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More drawer button */}
        <button
          onClick={onToggleMoreMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200 active:scale-90"
          aria-label="Open More Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
