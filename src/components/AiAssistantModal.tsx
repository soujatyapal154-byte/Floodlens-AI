import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle } from 'lucide-react';
import { AnalysisRunData } from '../types';
import { askFloodlensAI } from '../services/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisRunData | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  analysisData,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: analysisData
        ? `Hello! I am your Floodlens AI Assistant. I can answer questions about the analyzed flood in ${analysisData.areaName} (${analysisData.floodDate}). All my answers come strictly from the actual satellite calculations.`
        : 'Please select an Area and Flood Date on the Home screen and click Start Analysis first.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Where did the flood hit?',
    'Which roads may be affected?',
    'Which settlements may be cut off?',
    'How large is the detected flood area?',
    'Why was this area identified?',
    'What are the limitations?',
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    if (!analysisData) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text },
        { role: 'assistant', text: 'Please start an analysis first by choosing an area and flood date.' },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await askFloodlensAI(text, analysisData);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'This information was not determined from the available data.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="command-card w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">Ask Floodlens AI Copilot</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">SAR GROUNDED</span>
              </div>
              <p className="text-[11px] text-slate-400">Strictly grounded in verified satellite radar calculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="field-touch-target p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips with Touch targets */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2 bg-slate-950/60 rounded-xl border border-slate-800 w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Querying Gemini &amp; cross-referencing Sentinel-1 SAR telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar with Field Touch Targets */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask a question about this flood analysis..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="field-touch-target px-4 py-2 rounded-xl btn-primary-gradient text-white disabled:opacity-40 transition-colors shadow-md"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
