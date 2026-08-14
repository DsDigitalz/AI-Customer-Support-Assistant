import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";
import { processRAGQuery, SYSTEM_PROMPT } from "@/lib/ragEngine";
import { GoogleGenAI } from "@google/genai";

const adminStore = {
  conversations: [] as Array<Record<string, string | boolean | number | null>>,
  escalationRequests: [] as Array<
    Record<string, string | boolean | number | null>
  >,
};

export async function POST(req: Request) {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const authHeader = req.headers.get("Authorization");
  const jwtToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  try {
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid prompt string is required.",
          conversationId,
          timestamp,
        },
        { status: 400 }
      );
    }

    // Defense-in-depth server-side sanitization
    const cleanMessage = sanitizeInput(message);
    const lowerMessage = cleanMessage.toLowerCase();

    adminStore.conversations.push({
      conversationId: conversationId || "anonymous",
      message: cleanMessage,
      timestamp,
      source: "chat",
    });

    // Simulated error trigger for testing retry option
    if (
      lowerMessage.includes("trigger error") ||
      lowerMessage.includes("simulate failure")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Simulated network timeout (503 Service Unavailable). Click Retry to resend.",
          conversationId,
          timestamp,
        },
        { status: 503 }
      );
    }

    // 1. First process via RAG engine & Knowledge Base
    const ragResult = processRAGQuery(cleanMessage);

    let reply = ragResult.reply;
    const { toolCall, triggerLeadForm, isEscalated } = ragResult;

    // 2. If Gemini API Key is configured, enhance output with Gemini LLM
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'undefined') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const contents = [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nContext from Knowledge Base:\n${ragResult.reply}\n\nUser Question: ${cleanMessage}` }] }
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
        });

        if (response && response.text) {
          reply = response.text;
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to RAG response:", geminiErr);
      }
    } else {
      // Simulate realistic AI response latency (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (triggerLeadForm || isEscalated) {
      adminStore.escalationRequests.push({
        conversationId: conversationId || "anonymous",
        reason: ragResult.escalationReason || "Escalation trigger matched",
        intent: ragResult.intent,
        timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      reply,
      intent: ragResult.intent,
      conversationId,
      authenticatedUser: Boolean(jwtToken),
      toolCall: toolCall || null,
      triggerLeadForm: triggerLeadForm || false,
      isEscalated: isEscalated || false,
      timestamp: ragResult.timestamp || timestamp,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage, timestamp },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    conversations: adminStore.conversations.length,
    escalationRequests: adminStore.escalationRequests.length,
    lastUpdated: new Date().toISOString(),
  });
}
