'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ChatMessage } from '@/components/chat/types';
import { chatApiService, ApiError } from '@/lib/apiService';

const STORAGE_KEY_MESSAGES = 'apexium_chat_messages';
const STORAGE_KEY_CONV_ID = 'apexium_chat_conv_id';
const STORAGE_KEY_PERSIST_TOGGLE = 'apexium_chat_persist_enabled';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: "Hello! I'm Kate, Apexium's AI Assistant. How can I help you with our Cybersecurity, Technology, or Training services today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  status: 'sent',
};

function generateConversationId(): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `conv_${timePart}_${randomPart}`;
}

interface ChatContextType {
  conversationId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  globalError: string | null;
  isPersisted: boolean;
  showLeadForm: boolean;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (messageId?: string) => Promise<void>;
  startNewConversation: () => void;
  togglePersistence: () => void;
  clearHistory: () => void;
  triggerLeadForm: () => void;
  closeLeadForm: () => void;
  handleLeadSubmitted: (leadId: string, confirmationMessage: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversationId, setConversationId] = useState<string>(() => generateConversationId());
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPersisted, setIsPersisted] = useState<boolean>(false);
  const [showLeadForm, setShowLeadForm] = useState<boolean>(false);

  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const storedToggle = localStorage.getItem(STORAGE_KEY_PERSIST_TOGGLE);
    const persistEnabled = storedToggle === 'true';
    setIsPersisted(persistEnabled);

    if (persistEnabled) {
      const storedConvId = localStorage.getItem(STORAGE_KEY_CONV_ID);
      const storedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);

      if (storedConvId) setConversationId(storedConvId);
      if (storedMsgs) {
        try {
          const parsed = JSON.parse(storedMsgs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error("Failed to parse stored chat messages:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isInitializedRef.current) return;

    if (isPersisted) {
      localStorage.setItem(STORAGE_KEY_PERSIST_TOGGLE, 'true');
      localStorage.setItem(STORAGE_KEY_CONV_ID, conversationId);
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } else {
      localStorage.setItem(STORAGE_KEY_PERSIST_TOGGLE, 'false');
      localStorage.removeItem(STORAGE_KEY_CONV_ID);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    }
  }, [messages, conversationId, isPersisted]);

  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, []);

  const sendApiRequest = async (userPrompt: string, history: ChatMessage[]) => {
    setIsLoading(true);
    setGlobalError(null);

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const response = await chatApiService.sendChatMessage({
        message: userPrompt,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        conversationId,
        signal: controller.signal,
        timeoutMs: 15000,
      });

      if (response.toolCall) {
        setMessages((prev) => [
          ...prev,
          {
            id: `tool-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: response.timestamp || timeString,
            toolCall: response.toolCall,
          },
        ]);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.reply || "Request processed.",
          timestamp: response.timestamp || timeString,
          status: 'sent',
        },
      ]);

      // Automatically trigger Lead Form if high intent detected by AI
      if (response.triggerLeadForm) {
        setShowLeadForm(true);
      }
    } catch (err: unknown) {
      let displayError = "Failed to establish connection with AI server.";
      if (err instanceof ApiError) displayError = err.message;
      else if (err instanceof Error) displayError = err.message;

      setGlobalError(displayError);
      setMessages((prev) => {
        const copy = [...prev];
        const lastMsg = copy[copy.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
          lastMsg.status = 'error';
          lastMsg.errorMessage = displayError;
        }
        return copy;
      });
    } finally {
      setIsLoading(false);
      activeAbortControllerRef.current = null;
    }
  };

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await sendApiRequest(text, updated);
  };

  const retryMessage = async (messageId?: string) => {
    setGlobalError(null);
    let targetText = '';
    if (messageId) {
      const msg = messages.find((m) => m.id === messageId);
      if (msg && msg.role === 'user') targetText = msg.content;
    }
    if (!targetText) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) targetText = lastUserMsg.content;
    }
    if (targetText) {
      await sendApiRequest(targetText, messages);
    }
  };

  const startNewConversation = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const newId = generateConversationId();
    setConversationId(newId);
    const resetMsgs = [
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(resetMsgs);
    setGlobalError(null);
    setShowLeadForm(false);

    if (isPersisted) {
      localStorage.setItem(STORAGE_KEY_CONV_ID, newId);
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(resetMsgs));
    }
  };

  const togglePersistence = () => setIsPersisted((prev) => !prev);

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CONV_ID);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    }
    startNewConversation();
  };

  const triggerLeadForm = () => setShowLeadForm(true);
  const closeLeadForm = () => setShowLeadForm(false);

  const handleLeadSubmitted = (leadId: string, confirmationMessage: string) => {
    setShowLeadForm(false);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `lead-confirmed-${Date.now()}`,
        role: 'assistant',
        content: `✅ Lead Consultation Request [${leadId}] successfully submitted!\n${confirmationMessage}`,
        timestamp: timeString,
        status: 'sent',
      },
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
