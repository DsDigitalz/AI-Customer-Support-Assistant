/**
 * Apexium AI Customer Support Assistant - API Service Layer
 * 
 * Handles frontend <-> backend communication following the pipeline:
 * User -> Chat Interface -> Backend API Proxy -> AI System -> Response -> User
 */

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SendChatRequest {
  message: string;
  history?: ChatMessagePayload[];
  conversationId?: string;
  token?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ToolCallData {
  name: string;
  label: string;
}

export interface SendChatResponse {
  success: boolean;
  reply: string;
  conversationId?: string;
  toolCall?: ToolCallData | null;
  triggerLeadForm?: boolean;
  timestamp: string;
}

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  serviceOfInterest: string;
  message: string;
  conversationId?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  leadId: string;
  message: string;
  timestamp: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public isTimeout: boolean;
  public code?: string;

  constructor(message: string, statusCode = 500, isTimeout = false, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isTimeout = isTimeout;
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        `Request timed out after ${timeoutMs / 1000} seconds. Please try again.`,
        408,
        true,
        'TIMEOUT'
      );
    }
    throw err;
  }
}

export const chatApiService = {
  async sendChatMessage({
    message,
    history = [],
    conversationId,
    token,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
  }: SendChatRequest): Promise<SendChatResponse> {
    if (!message || !message.trim()) {
      throw new ApiError('Message prompt cannot be empty.', 400);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (conversationId) {
      headers['X-Conversation-ID'] = conversationId;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoint = `${API_BASE_URL}/api/chat`;

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: message.trim(),
            history,
            conversationId,
          }),
          signal,
        },
        timeoutMs
      );

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new ApiError(errorMessage, response.status);
      }

      const data: SendChatResponse = await response.json();
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error) {
        throw new ApiError(err.message || 'Unable to connect to Apexium AI Assistant.', 500);
      }
      throw new ApiError('An unexpected network error occurred.', 500);
    }
  },

  /**
   * Submit lead capture form data to backend
   */
  async submitLeadForm(leadData: LeadFormData): Promise<SubmitLeadResponse> {
    const endpoint = `${API_BASE_URL}/api/lead`;

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        },
        10000
      );

      if (!response.ok) {
        let errorMessage = `Lead submission failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new ApiError(errorMessage, response.status);
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error) throw new ApiError(err.message, 500);
      throw new ApiError('Failed to submit lead information.', 500);
    }
  },

  async checkServiceHealth(): Promise<{ status: string }> {
    try {
      const response = await fetchWithTimeout('/api/chat', { method: 'HEAD' }, 5000);
      return { status: response.ok ? 'online' : 'degraded' };
    } catch {
      return { status: 'offline' };
    }
  },
};
