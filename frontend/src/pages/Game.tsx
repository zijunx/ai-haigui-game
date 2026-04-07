import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Key, LogOut, MessageSquareText, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import ChatBox from '../components/ChatBox';
import { stories } from '../data/stories';
import { askAI } from '../api';
import type { TMessage } from '../types';

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Fetch story data
  const story = useMemo(() => stories.find(s => s.id === id), [id]);

  const [isLoading, setIsLoading] = useState(false);
  const [showSurface, setShowSurface] = useState(true);
  const [isAbandoning, setIsAbandoning] = useState(false); // New: abandonment confirmation state

  // 2. Initial conversation state
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [lastQuestion, setLastQuestion] = useState<string>(''); // 为了重试逻辑

  useEffect(() => {
    if (!story) {
      navigate('/', { replace: true });
      return;
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `欢迎来到《${story.title}》。我是你的 AI 裁决者。\n\n汤面是：“${story.surface}”\n\n请通过提问来还原真相，我只会回答“是”、“不是”或“与此无关”。准备好了吗？`,
        timestamp: Date.now(),
      }
    ]);
  }, [story, navigate]);

  const handleSendMessage = async (content: string) => {
    if (!story || isLoading) return;
    setLastQuestion(content); // 记录最后一次提问以便重试

    const userMsg: TMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askAI(content, story, messages);
      const aiMsg: TMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        atmosphere: response.atmosphere,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误，请重试';
      const aiMsg: TMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      // 移除原有的错误消息（如果是最后一条的话）以保持记录整洁
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].content.startsWith('⚠️')) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSendMessage(lastQuestion);
    }
  };

  if (!story) return null;

  return (
    <div className="h-[100dvh] bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAbandoning(true)}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-amber-400 tracking-tighter uppercase text-xs">
              Project Antigravity // Case
            </h2>
            <span className="text-sm font-bold text-white tracking-tight">{story.title}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-800 gap-3">
          <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
            <MessageSquareText size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Questions: {messages.filter(m => m.role === 'user').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              AI Judiciary Active
            </span>
          </div>
        </div>
      </header>

      {/* Surface Overlay */}
      <div className={`shrink-0 transition-all duration-500 ease-in-out px-4 py-3 bg-slate-800/40 border-b border-slate-800/50 ${showSurface ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 absolute'}`}>
        <div className="max-w-3xl mx-auto flex gap-4 items-start">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <BookOpen size={20} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest mb-1">汤面 (Story Surface)</h4>
            <p className="text-sm leading-relaxed text-slate-200 font-medium italic">
              &ldquo;{story.surface}&rdquo;
            </p>
          </div>
          <button
            onClick={() => setShowSurface(false)}
            className="p-1 px-2.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
          >
            HIDE
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,1)_0%,rgba(15,23,42,1)_100%)]">
        {!showSurface && (
          <button
            onClick={() => setShowSurface(true)}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-full border border-slate-700 text-[10px] font-bold text-amber-400 uppercase tracking-tighter transition-all"
          >
            Show Surface
          </button>
        )}

        <ChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onRetry={handleRetry}
        />
      </main>

      {/* Action Bar */}
      <div className="h-16 md:h-20 shrink-0 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800 flex items-center justify-between px-4 md:px-6 z-20">
        <button
          onClick={() => setIsAbandoning(true)}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs md:text-sm font-bold group"
        >
          <LogOut size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
          <span>结束</span>
        </button>

        <button
          onClick={() => navigate(`/result?id=${id}`, { state: { messages } })}
          className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs md:text-sm font-bold"
        >
          <Key size={16} className="md:w-[18px] md:h-[18px]" />
          <span>查看结局</span>
        </button>
      </div>

      {/* Abandon Confirmation Modal */}
      {isAbandoning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black mb-2">中途放弃？</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                真相近在咫尺，你确定要现在结束审判吗？你可以选择直接查看汤底。
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsAbandoning(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all"
                >
                  继续挑战
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  确认离开
                </button>
              </div>

              <button
                onClick={() => navigate(`/result?id=${id}`, { state: { messages } })}
                className="w-full mt-4 py-3 text-slate-500 hover:text-indigo-400 text-xs font-bold transition-colors uppercase tracking-widest"
              >
                不玩了，直接看汤底
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
