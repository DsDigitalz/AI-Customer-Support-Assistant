'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  suggestedPrompts?: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  suggestedPrompts = [
    "We think we've had a data breach — please open an incident ticket",
    "I'm from Northwind Logistics — what's on our account?",
    "When's the next CISSP prep course and are there seats left?",
    "Do you offer cybersecurity training for non-technical staff?",
  ],
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/80 p-3 sm:p-4 space-y-3 rounded-b-2xl backdrop-blur-lg">
      {/* Suggested Prompts Pill Container */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mr-1" />
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              disabled={isLoading}
              className="text-xs text-slate-300 hover:text-teal-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/40 rounded-full px-3 py-1 whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 focus-within:border-teal-500/60 rounded-xl p-2 transition-colors shadow-inner">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kate about cybersecurity, technology, or training services... (Press Enter to send)"
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm px-2 py-1.5 focus:outline-none resize-none max-h-32 scrollbar-thin scrollbar-thumb-slate-700"
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          type="button"
          aria-label="Send message"
          className={`p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
            input.trim() && !isLoading
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-teal-500/25 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>Shift + Enter for new line</span>
        <span>Enter to send</span>
      </div>
    </div>
  );
};
