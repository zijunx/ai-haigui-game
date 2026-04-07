import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Home, Sparkles, AlertTriangle, ChevronDown, ChevronUp, MessageCircle, Quote, RotateCcw } from 'lucide-react';
import { stories } from '../data/stories';
import type { TMessage } from '../types';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const story = useMemo(() => stories.find((s) => s.id === id), [id]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Get chat history from state if available
  const messages = (location.state as { messages?: TMessage[] })?.messages || [];

  useEffect(() => {
    if (story) {
      document.title = `真相大白：${story.title} - AI海龟汤`;
    }
    
    // Stage the reveal for dramatic effect
    const timer = setTimeout(() => {
      setShowAnswer(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-red-500/10 rounded-full mb-8 border border-red-500/20">
          <AlertTriangle size={64} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">故事档案丢失</h1>
        <p className="text-slate-400 mb-10 max-w-md mx-auto">抱歉，我们无法在这片虚空中找到您刚才挑战的那个案件。可能是时空发生了扭曲。</p>
        <button
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all font-bold flex items-center gap-3 shadow-xl active:scale-95"
        >
          <Home size={20} /> 找回出口
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 font-sans flex flex-col relative overflow-y-auto animate-in fade-in duration-700">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Header */}
      <header className="h-20 shrink-0 flex items-center justify-between px-8 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <h2 className="font-black text-slate-500 tracking-[0.2em] uppercase text-[10px]">
            CASE DECRYPTED // {story.id}
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-6 relative z-10 max-w-4xl mx-auto w-full mb-20">
        {/* Title Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/5 rounded-full border border-indigo-500/20 backdrop-blur-sm animate-in fade-in zoom-in-90 duration-700">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">审判已成定局</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest leading-tight transition-all duration-1000">
            {story.title}
          </h1>
        </div>

        {/* Answer Reveal Section */}
        <div className="w-full relative py-4">
          {!showAnswer ? (
             <div className="py-24 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-md animate-pulse" />
                  </div>
                </div>
                <p className="text-indigo-400 font-bold tracking-[0.4em] uppercase text-xs animate-pulse">真相即将浮现...</p>
             </div>
          ) : (
            <div className="relative group">
              {/* Highlight Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[40px] blur-2xl transition duration-1000 group-hover:duration-200" />
              
              <div className="relative w-full bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 md:p-16 shadow-2xl animate-in slide-in-from-bottom-12 fade-in duration-1000 ease-out">
                {/* Decorative Elements */}
                <Quote className="absolute top-10 left-10 text-indigo-500/20" size={48} />
                <Quote className="absolute bottom-10 right-10 text-purple-500/20 rotate-180" size={48} />

                <div className="mb-10 text-center">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-4">
                    故事汤底 // THE TRUTH
                  </h3>
                  <div className="h-[1px] w-12 bg-indigo-500/50 mx-auto" />
                </div>

                <div className="relative">
                  <p className="text-lg md:text-xl lg:text-2xl text-slate-100 leading-[1.6] font-medium text-center drop-shadow-sm selection:bg-indigo-500/30 selection:text-white">
                    {story.answer}
                  </p>
                </div>

                <div className="mt-16 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-[1px] bg-amber-500/50" />
                    <h4 className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.3em]">核心线索</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {story.keyPoints.map((point, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors group/item"
                      >
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px] group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                          {i + 1}
                        </div>
                        <span className="text-sm text-slate-300 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat History Section */}
        {messages.length > 0 && (
          <div className={`w-full mt-12 transition-all duration-1000 delay-300 ${showAnswer ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full h-16 flex items-center justify-between px-8 bg-slate-900/30 hover:bg-slate-900/50 rounded-3xl border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} className="text-indigo-400" />
                </div>
                <span className="font-bold text-slate-300">回顾这场博弈</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span className="text-xs font-medium uppercase tracking-widest">{messages.filter(m => m.role === 'user').length} 次提问</span>
                {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {showHistory && (
              <div className="mt-4 p-8 bg-slate-900/50 rounded-[32px] border border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/20' 
                      : 'bg-slate-800/40 text-slate-300 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`mt-20 flex flex-col items-center space-y-6 transition-all duration-1000 delay-500 ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate(`/game/${id}`)}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-full overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
              <span className="text-base font-bold tracking-widest relative z-10">
                再来一局
              </span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 backdrop-blur-xl transition-all hover:-translate-y-1 active:scale-95"
            >
              <Home size={20} />
              <span className="text-base font-bold tracking-widest relative z-10">
                返回大厅
              </span>
            </button>
          </div>
          
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            PROJECT ANTIGRAVITY // 2026
          </p>
        </div>
      </main>
    </div>
  );
};

export default Result;

