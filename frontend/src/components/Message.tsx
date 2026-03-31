import React from 'react';
import { User, Bot } from 'lucide-react';
import type { TMessage } from '../types';

interface MessageProps {
  message: TMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

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
              ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' 
              : 'bg-slate-800 text-white rounded-tr-none shadow-indigo-500/10'}`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            
            {/* Timestamp (Optional small detail) */}
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
