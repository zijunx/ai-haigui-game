import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, HelpCircle, Send } from 'lucide-react';

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-amber-400 tracking-wide">
              正在推理：{id}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-md border border-slate-700 transition-all">
            <Info size={14} className="text-amber-400" />
            <span>查看汤面</span>
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-4 overflow-hidden relative">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-24 scrollbar-hide">
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm italic">在这片虚无中，唯有你的提问能触及真相。</p>
          </div>
          {/* Placeholder for actual messages */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl max-w-[85%]">
            <p className="text-sm leading-relaxed text-slate-300">
              我是你的 AI 裁决者。
              请开始你的提问，尝试还原这个故事的“汤底”。
            </p>
          </div>
        </div>

        {/* Floating Input Control */}
        <div className="absolute bottom-6 left-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center gap-2 pr-4 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all">
          <button className="p-3 text-slate-500 hover:text-amber-400 transition-colors">
            <HelpCircle size={22} />
          </button>
          <input 
            type="text" 
            placeholder="输入你的推测（例如：死者是自杀吗？）" 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-slate-100 placeholder:text-slate-600"
          />
          <button className="bg-amber-400 p-2.5 rounded-xl text-slate-900 hover:bg-amber-300 transition-all">
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Game;
