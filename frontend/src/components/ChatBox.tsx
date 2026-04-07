import React, { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import Message from './Message';
import type { TMessage } from '../types';

interface ChatBoxProps {
  messages: TMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  onRetry?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isLoading, onRetry }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Only count user messages to decide empty state
  const userMessages = messages.filter(m => m.role === 'user');

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Scrollable Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 scrollbar-none"
      >
        {/* Welcome / Header */}
        <div className="text-center py-4 mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/30 backdrop-blur rounded-full border border-slate-700/30 shadow-inner">
            <ShieldCheck size={12} className="text-indigo-400" />
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em]">
               AI 裁决进行中 // ENCRYPTED
            </p>
          </div>
        </div>

        {/* Empty State */}
        {userMessages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in zoom-in-95 fade-in duration-1000">
            <div className="w-20 h-20 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 flex items-center justify-center mb-8 relative">
              <MessageSquare size={32} className="text-indigo-500/40" />
              <div className="absolute -top-1 -right-1">
                 <Sparkles size={20} className="text-amber-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">拨开真相的迷雾</h3>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
              在下方输入你的提问。我会根据逻辑回答“是”、“不是”或“与此无关”。
            </p>
            
            {/* Quick Suggestions */}
            <div className="mt-10 flex flex-wrap justify-center gap-2 w-full max-w-md">
              <button 
                onClick={() => onSendMessage("这是由于意外发生的吗？")}
                className="px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[11px] font-bold border border-slate-700/30 transition-all flex items-center gap-2 group"
              >
                <span>这是由于意外发生的吗？</span>
                <Send size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => onSendMessage("死者是一名男性吗？")}
                className="px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[11px] font-bold border border-slate-700/30 transition-all flex items-center gap-2 group"
              >
                <span>死者是一名男性吗？</span>
                <Send size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        )}

        {/* Message Rendering with animations */}
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div key={msg.id} className="animate-in slide-in-from-bottom-2 fade-in duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
              <Message 
                message={msg} 
                onRetry={idx === messages.length - 1 ? onRetry : undefined} 
              />
            </div>
          ))}
        </div>
        
        {/* Loading / Typing Animation */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                <Sparkles size={18} className="text-white animate-pulse" />
              </div>
              <div className="px-6 py-4 bg-slate-800/80 backdrop-blur-sm rounded-3xl rounded-tl-none border border-white/5 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">裁决中</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.32s]" />
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.16s]" />
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-6 sm:pt-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent relative z-30">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-3xl mx-auto group"
        >
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          
          <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[24px] sm:rounded-[28px] p-1.5 sm:p-2 shadow-2xl flex items-center gap-1 focus-within:border-indigo-500/40 transition-all duration-500">
            <button 
              type="button" 
              className="p-3.5 text-slate-500 hover:text-amber-400 transition-colors hidden md:block"
              title="获取线索"
            >
              <HelpCircle size={20} />
            </button>
            
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isLoading ? "请在那片迷雾中等待..." : "输入你的大胆猜想..."} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] sm:text-[15px] px-3 sm:px-4 py-2.5 sm:py-3 text-slate-100 placeholder:text-slate-600 outline-none"
            />
            
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[18px] sm:rounded-2xl transition-all duration-300 relative group/btn active:scale-95 ${
                inputValue.trim() && !isLoading
                  ? 'bg-white text-slate-950 hover:bg-indigo-50 shadow-lg shadow-white/5' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="text-sm font-black tracking-widest hidden sm:inline">提问</span>
              <Send size={16} className={`${inputValue.trim() && !isLoading ? 'group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform' : ''}`} />
            </button>
          </div>
        </form>
        
        {/* Floating Quick Action / Hint (Optional Desktop only) */}
        <div className="mt-2 text-center hidden sm:block">
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] animate-pulse">
            SYSTEM // AI JUDICIARY ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
