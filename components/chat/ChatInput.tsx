'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { QuickEnquiryOptions } from './QuickEnquiryOptions';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
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

  const handlePrefillOption = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/90 p-3 sm:p-4 rounded-b-2xl backdrop-blur-lg space-y-3">
      {/* Predefined Quick Enquiry Options Section */}
      <QuickEnquiryOptions
        onSelectOption={onSendMessage}
        onPrefillOption={handlePrefillOption}
        isLoading={isLoading}
      />

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
