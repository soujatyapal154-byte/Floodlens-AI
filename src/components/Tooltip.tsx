import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term: string;
  explanation: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, explanation, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {children || <span className="font-medium underline decoration-dotted decoration-cyan-400/60 cursor-help">{term}</span>}
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Explain ${term}`}
        className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5 inline-block opacity-70 group-hover:opacity-100" />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs text-slate-200 shadow-xl shadow-cyan-950/50 backdrop-blur-md pointer-events-none transition-all duration-150 animate-in fade-in"
        >
          <span className="font-semibold text-cyan-300 block mb-1">{term}</span>
          <span className="leading-relaxed text-slate-300 block">{explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};
