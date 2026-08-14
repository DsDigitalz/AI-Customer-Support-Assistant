import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";
import { processRAGQuery } from "@/lib/ragEngine";

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
        { status: 400 },
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
        { status: 503 },
      );
    }

    // Process via Phase 3 RAG Engine
    const ragResult = processRAGQuery(cleanMessage);

    // Simulate realistic AI response latency (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (ragResult.triggerLeadForm || ragResult.isEscalated) {
      adminStore.escalationRequests.push({
        conversationId: conversationId || "anonymous",
        reason: ragResult.escalationReason || "Escalation trigger matched",
        intent: ragResult.intent,
        timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      reply: ragResult.reply,
      intent: ragResult.intent,
      conversationId,
      authenticatedUser: Boolean(jwtToken),
      toolCall: ragResult.toolCall || null,
      triggerLeadForm: ragResult.triggerLeadForm || false,
      isEscalated: ragResult.isEscalated || false,
      timestamp: ragResult.timestamp || timestamp,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage, timestamp },
      { status: 500 },
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
