'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shield, Cpu, GraduationCap, MessageSquare, RefreshCw, Sparkles } from 'lucide-react';
import { ChatMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { ChatInput } from './ChatInput';

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "Hello! I'm Kate, Apexium's AI Assistant. How can I help you with our Cybersecurity, Technology, or Training services today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or loading state change
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, globalError]);

  const sendApiRequest = async (userPrompt: string, history: ChatMessage[]) => {
    setIsLoading(true);
    setGlobalError(null);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      // If tool calls were returned, add tool call pill
      if (data.toolCall) {
        setMessages((prev) => [
          ...prev,
          {
            id: `tool-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: timeString,
            toolCall: data.toolCall,
          },
        ]);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I've processed your request. How else can Apexium assist you today?",
        timestamp: timeString,
        status: 'sent',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to establish connection with AI support server.';
      console.error("Chat API Error:", err);
      setGlobalError(errorMessage);
      
      // Update last user message or add error state
      setMessages((prev) => {
        const copy = [...prev];
        const lastMsg = copy[copy.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
          lastMsg.status = 'error';
          lastMsg.errorMessage = errorMessage;
        }
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    sendApiRequest(text, updatedMessages);
  };

  const handleRetry = (messageId?: string) => {
    setGlobalError(null);
    let targetText = '';
    
    // Find the message to retry (either specified ID or the last user message)
    if (messageId) {
      const msg = messages.find((m) => m.id === messageId);
      if (msg && msg.role === 'user') {
        targetText = msg.content;
      }
    }

    if (!targetText) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) targetText = lastUserMsg.content;
    }

    if (targetText) {
      // Re-trigger request for target user message
      sendApiRequest(targetText, messages);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content: "Hello! I'm Kate, Apexium's AI Assistant. How can I help you with our Cybersecurity, Technology, or Training services today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      },
    ]);
    setGlobalError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[90vh] max-h-[850px] bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl shadow-teal-950/20 overflow-hidden backdrop-blur-xl transition-all">
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <MessageSquare className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">Apexium AI Support</h1>
              <span className="text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-md px-1.5 py-0.5">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Kate · Customer Specialist</span>
            </p>
          </div>
        </div>

        {/* Right Header Actions & Service Line Icons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-medium text-cyan-300 px-2 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/20" title="Cybersecurity Services">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Security</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-sky-300 px-2 py-1 rounded-lg bg-sky-950/50 border border-sky-500/20" title="Technology Services">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Tech</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-300 px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-500/20" title="Training Services">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Training</span>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            title="Reset Chat History"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Feed Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={handleRetry} />
        ))}

        {/* Loading Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Global Error Banner */}
        {globalError && (
          <ErrorMessage message={globalError} onRetry={() => handleRetry()} />
        )}

        {/* Dummy scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
