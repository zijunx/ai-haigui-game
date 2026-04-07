import React from 'react';
import { stories } from '../data/stories';
import GameCard from '../components/GameCard';
import { Sparkles, Ghost } from 'lucide-react';

const Home: React.FC = () => {
  const easyStories = stories.filter(s => s.difficulty === 'easy');
  const mediumStories = stories.filter(s => s.difficulty === 'medium');
  const hardStories = stories.filter(s => s.difficulty === 'hard');

  return (
    <div className="min-h-screen bg-slate-900 selection:bg-amber-400 selection:text-slate-900 animate-in fade-in duration-700">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Header Section */}
        <header className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 animate-pulse">
            <Sparkles size={12} />
            <span>AI Powered Mystery</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
            AI 海龟汤
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            真相潜伏在碎裂的只言片语之下。每一份“汤面”都掩盖着一段残酷或荒诞的往事，唯有你的逻辑能拨开层层迷雾。
          </p>

          <div className="flex justify-center gap-8 pt-6 text-slate-500 text-sm italic">
            <span className="flex items-center gap-2"><Ghost size={16} /> 沉浸式推理</span>
            <span className="flex items-center gap-2"><Ghost size={16} /> AI 实时裁决</span>
            <span className="flex items-center gap-2"><Ghost size={16} /> 真相大白</span>
          </div>
        </header>

        {/* Gallery Section */}
        <main className="space-y-16">
          {easyStories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping relative"><span className="absolute inset-0 bg-emerald-400 rounded-full opacity-50"></span></span>
                  简单（新手）
                </h2>
                <div className="text-slate-500 text-sm">{easyStories.length} 个挑战</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {easyStories.map((story) => (
                  <GameCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {mediumStories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping relative"><span className="absolute inset-0 bg-amber-400 rounded-full opacity-50"></span></span>
                  中等（推理）
                </h2>
                <div className="text-slate-500 text-sm">{mediumStories.length} 个挑战</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {mediumStories.map((story) => (
                  <GameCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {hardStories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping relative"><span className="absolute inset-0 bg-red-500 rounded-full opacity-50"></span></span>
                  困难（空间 / 逻辑）
                </h2>
                <div className="text-slate-500 text-sm">{hardStories.length} 个挑战</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {hardStories.map((story) => (
                  <GameCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer info */}
        <footer className="mt-32 text-center text-slate-600 border-t border-slate-800/50 pt-16 pb-8">
          <p className="text-sm tracking-widest font-bold uppercase mb-4">
            Think outside the bowl
          </p>
          <p className="text-xs max-w-xs mx-auto">
            基于深度 AI 语义解析，严谨还原逻辑链路。
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
