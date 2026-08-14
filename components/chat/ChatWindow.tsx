"use client";

import React, { useRef, useEffect } from "react";
import {
  Shield,
  Cpu,
  GraduationCap,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Save,
  Trash2,
  Hash,
  FileText,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ErrorMessage } from "./ErrorMessage";
import { ChatInput } from "./ChatInput";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { QuickEnquiryOptions } from "./QuickEnquiryOptions";

export const ChatWindow: React.FC = () => {
  const {
    conversationId,
    messages,
    isLoading,
    globalError,
    isPersisted,
    showLeadForm,
    sendMessage,
    retryMessage,
    startNewConversation,
    togglePersistence,
    clearHistory,
    triggerLeadForm,
    closeLeadForm,
    handleLeadSubmitted,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages, lead form, loading, or error states change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, globalError, showLeadForm]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[100dvh] sm:h-[90vh] sm:max-h-[850px] bg-slate-950/90 border border-slate-800 sm:rounded-2xl shadow-2xl shadow-teal-950/20 overflow-hidden backdrop-blur-xl transition-all">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        {/* Brand & Assistant Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <MessageSquare className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Apexium AI Support
              </h1>
              {/* Unique Conversation ID Badge */}
              <span
                title={`Tracking ID: ${conversationId}`}
                className="text-[10px] font-semibold bg-slate-800 text-teal-300 border border-slate-700/80 rounded-md px-2 py-0.5 font-mono flex items-center gap-1"
              >
                <Hash className="w-3 h-3 text-teal-400" />
                <span className="truncate max-w-[120px]">{conversationId}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Kate · Customer Specialist</span>
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Service Line Indicators */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-cyan-300 px-2 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Security
            </span>
            <span className="text-[11px] font-medium text-sky-300 px-2 py-1 rounded-lg bg-sky-950/50 border border-sky-500/20 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> Tech
            </span>
            <span className="text-[11px] font-medium text-amber-300 px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-500/20 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Training
            </span>
          </div>

          {/* Manual Lead Form Request Button */}
          <button
            type="button"
            onClick={triggerLeadForm}
            title="Talk to a human / request support"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Talk to a Human</span>
          </button>

          {/* LocalStorage Persistence Toggle */}
          <button
            type="button"
            onClick={togglePersistence}
            title={
              isPersisted
                ? "LocalStorage Auto-Save ON"
                : "LocalStorage Auto-Save OFF"
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isPersisted
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300 shadow-sm"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Save
              className={`w-3.5 h-3.5 ${isPersisted ? "text-teal-400" : "text-slate-500"}`}
            />
            <span className="hidden sm:inline">
              {isPersisted ? "Save ON" : "Save OFF"}
            </span>
          </button>

          {/* Clear History Button */}
          {isPersisted && (
            <button
              type="button"
              onClick={clearHistory}
              title="Clear stored conversation history"
              className="p-2 rounded-xl text-slate-400 hover:text-red-300 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Start New Conversation Button */}
          <button
            type="button"
            onClick={startNewConversation}
            title="Start New Conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Messages Feed Viewport */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent min-h-0">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={retryMessage} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Quick Enquiry Options rendered inside the chat feed on mobile/initial state */}
        {!showLeadForm && messages.length <= 2 && (
          <div className="pt-2">
            <QuickEnquiryOptions
              onSelectOption={sendMessage}
              isLoading={isLoading}
              inlineFeed
            />
          </div>
        )}

        {/* Conditional Lead Capture Form inside Chat Stream */}
        {showLeadForm && (
          <LeadCaptureForm
            conversationId={conversationId}
            onSuccess={handleLeadSubmitted}
            onCancel={closeLeadForm}
          />
        )}

        {globalError && (
          <ErrorMessage message={globalError} onRetry={() => retryMessage()} />
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Footer */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};
