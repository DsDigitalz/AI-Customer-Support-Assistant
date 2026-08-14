'use client';

import React, { useState } from 'react';
import { Bot, User, Check, Copy, RotateCcw, Zap, AlertCircle } from 'lucide-react';
import { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Tool Call Badge if present
  if (message.toolCall) {
    return (
      <div className="flex items-center gap-2 text-xs text-teal-300 bg-teal-950/60 border border-teal-500/30 rounded-full px-3.5 py-1.5 self-start my-1 font-mono animate-fade-in shadow-sm">
        <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>{message.toolCall.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2.5 max-w-[88%] sm:max-w-[80%] my-1.5 group animate-fade-in ${
        isUser ? 'self-end flex-row-reverse' : 'self-start flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-500/20'
            : 'bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-teal-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content Area */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role & Timestamp Header */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400">
            {isUser ? 'You' : 'Kate AI'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{message.timestamp}</span>
        </div>

        {/* Message Card */}
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-teal-950/90 via-slate-900 to-slate-900 border border-teal-500/30 text-slate-100 rounded-br-xs'
              : isError
              ? 'bg-red-950/40 border border-red-500/40 text-red-200 rounded-bl-xs'
              : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs shadow-slate-950/40 backdrop-blur-md'
          }`}
        >
          <p>{message.content}</p>

          {/* Inline Action Bar for AI Messages */}
          {!isUser && !isError && (
            <div className="flex items-center justify-end gap-1 mt-2 pt-1 border-t border-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                title="Copy message"
                className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Failed Message Error & Retry Option */}
          {isError && (
            <div className="mt-2.5 pt-2 border-t border-red-500/20 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{message.errorMessage || "Failed to deliver"}</span>
              </span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          {/* Sending Indicator for User Messages */}
          {isUser && isSending && (
            <div className="text-[10px] text-teal-400/80 font-mono mt-1 text-right italic">
              Sending...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
