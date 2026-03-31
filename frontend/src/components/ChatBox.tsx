import React, { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle } from 'lucide-react';
import Message from './Message';
import type { TMessage } from '../types';

interface ChatBoxProps {
  messages: TMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isLoading }) => {
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
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-none"
      >
        <div className="text-center py-6 mb-4">
          <div className="inline-block px-3 py-1 bg-slate-800/50 backdrop-blur rounded-full border border-slate-800/50">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">真相就在迷雾中</p>
          </div>
        </div>

        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800/50 h-8 w-24 rounded-full ml-12"></div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto group"
        >
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-1.5 shadow-2xl flex items-center gap-2 pr-4 focus-within:ring-2 focus-within:ring-amber-400/30 transition-all duration-300">
            <button 
              type="button" 
              className="p-3 text-slate-500 hover:text-amber-400 transition-colors"
              title="Need a hint?"
            >
              <HelpCircle size={22} />
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="输入你的推测（例如：死者是自杀吗？）" 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-slate-100 placeholder:text-slate-600 outline-none"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading
                  ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} className={inputValue.trim() ? 'animate-in zoom-in' : ''} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
