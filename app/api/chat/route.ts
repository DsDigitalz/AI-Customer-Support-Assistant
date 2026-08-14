import { NextResponse } from 'next/server';

const MOCK_KNOWLEDGE_BASE = [
  {
    keywords: ['breach', 'incident', 'hack', 'critical', 'attack', 'compromise'],
    reply: "🚨 ACTIVE INCIDENT DETECTED: Opening an immediate high-priority ticket with the Apexium SOC (Security Operations Center) on-call team. Please avoid taking affected systems offline abruptly; keep logs intact. Our 24/7 Incident Hotline is also available directly. A security engineer is reviewing this now.",
    toolCall: { name: 'ticketing_create_incident', label: 'Opening SOC incident ticket (INC-84920)…' },
  },
  {
    keywords: ['northwind', 'account', 'tier', 'manager'],
    reply: "I've checked the Apexium CRM records for Northwind Logistics. Your account is on the Enterprise Tier with active services including Managed SOC (24/7 Monitoring) and Cloud Migration. Your dedicated Account Manager is Priya Nair.",
    toolCall: { name: 'crm_lookup_account', label: 'Checking CRM account details for Northwind Logistics…' },
  },
  {
    keywords: ['cissp', 'certification', 'course', 'training', 'seats'],
    reply: "The next session for CISSP Certification Prep starts on September 8th, 2026. There are currently 6 seats remaining in this cohort. Would you like me to connect you with our training coordinator to hold a seat?",
    toolCall: { name: 'lms_check_course', label: 'Checking LMS course availability for CISSP Prep…' },
  },
  {
    keywords: ['cybersecurity', 'pentest', 'audit', 'soc', 'compliance'],
    reply: "Apexium offers comprehensive Cybersecurity Services including penetration testing, vulnerability assessments, 24/7 Managed SOC threat monitoring, and ISO 27001 / SOC 2 compliance readiness. Engagements are tailored based on infrastructure scale.",
  },
  {
    keywords: ['technology', 'cloud', 'software', 'infrastructure', 'migration'],
    reply: "Our Technology Services team specializes in cloud infrastructure migration, custom software engineering, and systems integration to help streamline your tech stack securely.",
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid prompt string is required.' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();

    // Simulated error trigger for testing retry option
    if (lowerMessage.includes('trigger error') || lowerMessage.includes('simulate failure')) {
      return NextResponse.json(
        { error: 'Simulated network timeout (503 Service Unavailable). Click Retry to resend.' },
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
        reply: matched.reply,
        toolCall: matched.toolCall || null,
      });
    }

    // Default intelligent response
    return NextResponse.json({
      reply: `Thank you for contacting Apexium. I can assist you with our Cybersecurity Services (Pen testing, SOC 24/7), Technology Solutions (Cloud migration, Custom dev), or Training (Staff awareness, CISSP prep). Could you specify which area you'd like more details on?`,
      toolCall: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
