import React from 'react';
import { User, Bot, Sparkles } from 'lucide-react';
import type { TMessage } from '../types';

interface MessageProps {
  message: TMessage;
  onRetry?: () => void;
}

const Message: React.FC<MessageProps> = ({ message, onRetry }) => {
  const isAssistant = message.role === 'assistant';
  const isError = message.content.startsWith('⚠️');
  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    // 用户消息直接展示全文，不需要打字效果
    if (!isAssistant || isError) {
      setDisplayText(message.content);
      return;
    }

    // AI 消息：打字机效果
    // 注意：不要用 ref 保护，React 18 StrictMode 会双跑 effect，
    // 正确做法是让 cleanup 取消 timer，每次 effect 重跑时从头开始
    setDisplayText('');
    let i = 0;
    const text = message.content;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [message.content, isAssistant, isError]);

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105
          ${isAssistant
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 mr-3'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 ml-3'}`}>
          {isAssistant ? (
            <Bot size={22} className="text-white drop-shadow-sm" />
          ) : (
            <User size={22} className="text-white drop-shadow-sm" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          {/* Role Label */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
            {isAssistant ? 'AI Host' : 'You'}
          </span>

          {/* Bubble */}
          <div className={`relative px-5 py-3 rounded-2xl shadow-sm transition-all
            ${isAssistant
              ? (isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-700 border border-slate-100') + ' rounded-tl-none'
              : 'bg-slate-800 text-white rounded-tr-none shadow-indigo-500/10'}`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {displayText}
            </p>

            {isAssistant && message.atmosphere && (
              <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-amber-900/30 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={12} className="text-amber-500/70 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">
                    裁判的旁白
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  &ldquo;{message.atmosphere}&rdquo;
                </p>
              </div>
            )}

            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95"
              >
                点击重试
              </button>
            )}

            {/* Timestamp */}
            <div className={`mt-2 text-[10px] opacity-40 ${isAssistant ? 'text-left' : 'text-right'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
