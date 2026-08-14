'use client';

import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-3 self-start max-w-[85%] animate-fade-in my-1.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
        <Bot className="w-4 h-4 text-slate-950" />
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Kate is typing</span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
