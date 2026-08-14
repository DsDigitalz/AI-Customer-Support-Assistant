import { NextResponse } from 'next/server';

const MOCK_KNOWLEDGE_BASE = [
  {
    keywords: ['contact support', 'support', 'specialist', 'contact', 'talk to human'],
    reply: "I can connect you with an Apexium Specialist right away! For urgent technical support or active security incidents, our 24/7 SOC team is available. Would you like me to flag your account for an immediate call back from an account manager or technical specialist?",
    toolCall: { name: 'crm_lookup_account', label: 'Routing to Apexium Support & CRM Account Manager…' },
  },
  {
    keywords: ['cybersecurity services', 'cybersecurity', 'pentest', 'audit', 'soc', 'compliance'],
    reply: "Apexium offers comprehensive Cybersecurity Services including penetration testing, vulnerability assessments, 24/7 Managed SOC threat monitoring, and ISO 27001 / SOC 2 compliance readiness. Engagements are tailored based on your company size and infrastructure.",
    toolCall: { name: 'crm_lookup_account', label: 'Checking CRM for active Cybersecurity service plans…' },
  },
  {
    keywords: ['technology services', 'technology', 'cloud', 'software', 'infrastructure', 'migration'],
    reply: "Our Technology Services division specializes in end-to-end cloud infrastructure migration (AWS, GCP, Azure), custom enterprise software development, IT consulting, and systems integration.",
  },
  {
    keywords: ['training programs', 'training', 'cissp', 'certification', 'courses', 'awareness'],
    reply: "Apexium Training Programs cover employee cybersecurity awareness training, technical certification prep (e.g. CISSP, CompTIA, Cloud certs), and tailored workshops for engineering and leadership teams.",
    toolCall: { name: 'lms_check_course', label: 'Checking LMS course availability for upcoming sessions…' },
  },
  {
    keywords: ['breach', 'incident', 'hack', 'critical', 'attack', 'compromise'],
    reply: "🚨 ACTIVE INCIDENT DETECTED: Opening an immediate high-priority ticket with the Apexium SOC (Security Operations Center) on-call team. Please avoid taking affected systems offline abruptly; keep logs intact. A security engineer is reviewing this now.",
    toolCall: { name: 'ticketing_create_incident', label: 'Opening SOC incident ticket (INC-84920)…' },
  },
];

export async function POST(req: Request) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid prompt string is required.', timestamp },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();

    // Simulated error trigger for testing retry option
    if (lowerMessage.includes('trigger error') || lowerMessage.includes('simulate failure')) {
      return NextResponse.json(
        { success: false, error: 'Simulated network timeout (503 Service Unavailable). Click Retry to resend.', timestamp },
        { status: 503 }
      );
    }

    // Match keywords against Knowledge Base
    const matched = MOCK_KNOWLEDGE_BASE.find((item) =>
      item.keywords.some((kw) => lowerMessage.includes(kw))
    );

    // Simulate realistic AI network latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (matched) {
      return NextResponse.json({
        success: true,
        reply: matched.reply,
        toolCall: matched.toolCall || null,
        timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      reply: `Thank you for contacting Apexium. I can assist you with our Cybersecurity Services, Technology Solutions, Training Programs, or connecting with Support. What specific information can I provide?`,
      toolCall: null,
      timestamp,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage, timestamp },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
