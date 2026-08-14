import {
  GoogleGenAI,
  ThinkingLevel,
} from '@google/genai';
import { NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type HistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatRequestBody = {
  message?: string;
  conversationId?: string;
  history?: HistoryMessage[];
};


// =========================================================
// APEXIUM KNOWLEDGE BASE
// Existing team knowledge preserved
// =========================================================

const MOCK_KNOWLEDGE_BASE = [
  {
    service: 'Sales',
    keywords: [
      'pricing',
      'quote',
      'cost',
      'demo',
      'consultation',
      'proposal',
      'sales',
      'hire',
      'book',
    ],
    reply:
      'I would be happy to connect you with an Apexium Specialist for a tailored pricing proposal and consultation. Please complete the quick enquiry form below so our sales engineering team can prepare your custom quote.',
    triggerLeadForm: true,
    toolCall: {
      name: 'crm_lookup_account',
      label:
        'Preparing Lead Capture & Sales Engineering Referral…',
    },
  },

  {
    service: 'Support',
    keywords: [
      'contact support',
      'support',
      'specialist',
      'contact',
      'talk to human',
    ],
    reply:
      'I can connect you with an Apexium Specialist right away! For urgent technical support or active security incidents, our 24/7 SOC team is available. Would you like me to flag your account for an immediate call back from an account manager or technical specialist?',
    triggerLeadForm: true,
    toolCall: {
      name: 'crm_lookup_account',
      label:
        'Routing to Apexium Support & CRM Account Manager…',
    },
  },

  {
    service: 'Cybersecurity',
    keywords: [
      'cybersecurity services',
      'cybersecurity',
      'pentest',
      'audit',
      'soc',
      'compliance',
    ],
    reply:
      'Apexium offers comprehensive Cybersecurity Services including penetration testing, vulnerability assessments, 24/7 Managed SOC threat monitoring, and ISO 27001 / SOC 2 compliance readiness. Engagements are tailored based on your company size and infrastructure.',
    toolCall: {
      name: 'crm_lookup_account',
      label:
        'Checking CRM for active Cybersecurity service plans…',
    },
  },

  {
    service: 'Technology',
    keywords: [
      'technology services',
      'technology',
      'cloud',
      'software',
      'infrastructure',
      'migration',
    ],
    reply:
      'Our Technology Services division specializes in end-to-end cloud infrastructure migration (AWS, GCP, Azure), custom enterprise software development, IT consulting, and systems integration.',
  },

  {
    service: 'Training',
    keywords: [
      'training programs',
      'training',
      'cissp',
      'certification',
      'courses',
      'awareness',
    ],
    reply:
      'Apexium Training Programs cover employee cybersecurity awareness training, technical certification prep (e.g. CISSP, CompTIA, Cloud certs), and tailored workshops for engineering and leadership teams.',
    toolCall: {
      name: 'lms_check_course',
      label:
        'Checking LMS course availability for upcoming sessions…',
    },
  },

  {
    service: 'Security Incident',
    keywords: [
      'breach',
      'incident',
      'hack',
      'critical',
      'attack',
      'compromise',
    ],
    reply:
      '🚨 ACTIVE INCIDENT DETECTED: Opening an immediate high-priority ticket with the Apexium SOC (Security Operations Center) on-call team. Please avoid taking affected systems offline abruptly; keep logs intact. A security engineer is reviewing this now.',
    toolCall: {
      name: 'ticketing_create_incident',
      label:
        'Opening SOC incident ticket (INC-84920)…',
    },
  },
];


// =========================================================
// INTENT DETECTION
// =========================================================

function detectLeadIntent(message: string) {
  const text = message.toLowerCase();

  const leadSignals = [
    'pricing',
    'price',
    'quote',
    'quotation',
    'cost',
    'consultation',
    'proposal',
    'demo',
    'book',
    'hire',
    'interested',
    'contact me',
    'contact us',
    'get in touch',
    'speak to an expert',
  ];

  return leadSignals.some((signal) =>
    text.includes(signal)
  );
}


function detectHumanEscalation(message: string) {
  const text = message.toLowerCase();

  const escalationSignals = [
    'talk to a human',
    'speak to a human',
    'real person',
    'customer service agent',
    'support agent',
    'contact support',
    'speak to someone',
    'complaint',
  ];

  return escalationSignals.some((signal) =>
    text.includes(signal)
  );
}


// =========================================================
// CONVERSATION HISTORY
// =========================================================

function buildHistoryContext(
  history: HistoryMessage[] = []
) {
  return history
    .slice(-8)
    .map((item) => {
      const role =
        item.role === 'assistant'
          ? 'Kate'
          : 'Customer';

      return `${role}: ${sanitizeInput(
        item.content
      )}`;
    })
    .join('\n');
}


// =========================================================
// CHAT API
// =========================================================

export async function POST(req: Request) {
  const timestamp =
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const authHeader =
    req.headers.get('Authorization');

  const jwtToken =
    authHeader &&
    authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            'AI service is not configured.',
          timestamp,
        },
        { status: 500 }
      );
    }

    const body =
      (await req.json()) as ChatRequestBody;

    const {
      message,
      conversationId,
      history = [],
    } = body;

    if (
      !message ||
      typeof message !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Valid prompt string is required.',
          conversationId,
          timestamp,
        },
        { status: 400 }
      );
    }

    const cleanMessage =
      sanitizeInput(message);

    const lowerMessage =
      cleanMessage.toLowerCase();


    // =====================================================
    // SIMULATED ERROR FOR FRONTEND RETRY TESTING
    // =====================================================

    if (
      lowerMessage.includes(
        'trigger error'
      ) ||
      lowerMessage.includes(
        'simulate failure'
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Simulated network timeout (503 Service Unavailable). Click Retry to resend.',
          conversationId,
          timestamp,
        },
        { status: 503 }
      );
    }


    // =====================================================
    // KNOWLEDGE BASE MATCH
    // =====================================================

    const matched =
      MOCK_KNOWLEDGE_BASE.find(
        (item) =>
          item.keywords.some((keyword) =>
            lowerMessage.includes(keyword)
          )
      );


    // =====================================================
    // INTENT DETECTION
    // =====================================================

    const leadDetected =
      detectLeadIntent(cleanMessage);

    const escalationRequired =
      detectHumanEscalation(cleanMessage);

    const historyContext =
      buildHistoryContext(history);


    // =====================================================
    // BUILD GROUNDED KNOWLEDGE CONTEXT
    // =====================================================

    const knowledgeContext = matched
      ? `
Service Area:
${matched.service}

Verified Apexium Information:
${matched.reply}
`
      : `
No direct knowledge-base match was found.

Apexium's main service categories are:
- Cybersecurity Services
- Technology Services
- Training Programs
- Customer Support

If the customer's question requires information
that is not available, offer human support rather
than inventing company information.
`;


    // =====================================================
    // GEMINI PROMPT
    // =====================================================

    const prompt = `
You are Kate, Apexium's AI Customer Support Assistant.

Your job is to provide helpful, professional and
friendly customer support.

Use the supplied Apexium knowledge as the primary
source for company-specific information.

APEXIUM KNOWLEDGE:
${knowledgeContext}

RECENT CONVERSATION:
${
  historyContext ||
  'No previous conversation.'
}

CURRENT CUSTOMER MESSAGE:
${cleanMessage}

RULES:

1. Answer the customer's current question directly.

2. Maintain context from the recent conversation
when it is relevant.

3. Keep responses concise and suitable for a
customer-support chat interface.

4. Do not invent Apexium services or company
information that is not available in the supplied
knowledge.

5. You may naturally explain the supplied
information, but do not contradict it.

6. If the customer is interested in pricing,
consultation, demonstrations, proposals or buying
a service, encourage them to complete the enquiry
form.

7. If the customer asks to speak with a human,
specialist or support representative, tell them
that the Contact Support option can be used.

8. If the question cannot be answered from the
available information, explain that a member of
the Apexium team can provide further assistance.

9. Do not claim that an external CRM, ticketing
system, LMS or human employee has actually
completed an action unless the application
explicitly confirms it.

Return ONLY the customer-facing response.
`.trim();


    // =====================================================
    // ONE GEMINI CALL
    // =====================================================

    const aiResponse =
      await ai.models.generateContent({
        model:
          process.env.GEMINI_MODEL ||
          'gemini-3.6-flash',

        contents: prompt,

        config: {
  temperature: 0.2,
  thinkingConfig: {
    thinkingLevel: ThinkingLevel.LOW,
  },
  maxOutputTokens: 800,
},
      });


    // =====================================================
    // RESPONSE
    // =====================================================

    const reply =
      aiResponse.text?.trim() ||
      matched?.reply ||
      'Thank you for contacting Apexium. I can assist you with Cybersecurity Services, Technology Solutions, Training Programs, or connecting you with Support.';


    // Keep existing frontend lead-form behaviour.
    const triggerLeadForm =
      Boolean(
        matched?.triggerLeadForm
      ) ||
      leadDetected ||
      escalationRequired;


    // Keep existing tool call if the knowledge
    // base matched one.
    let toolCall =
      matched?.toolCall || null;


    // Add escalation tool information only when
    // there is no existing matched tool call.
    if (
      escalationRequired &&
      !toolCall
    ) {
      toolCall = {
        name:
          'human_support_escalation',
        label:
          'Preparing Apexium Support request…',
      };
    }


    return NextResponse.json({
      success: true,

      reply,

      conversationId,

      authenticatedUser:
        Boolean(jwtToken),

      service:
        matched?.service || 'General',

      leadDetected,

      escalationRequired,

      toolCall,

      triggerLeadForm,

      timestamp,
    });

  } catch (err: unknown) {
    console.error(
      'AI chat route error:',
      err
    );

    return NextResponse.json(
      {
        success: false,
        error:
          'We could not process your message at the moment. Please try again.',
        timestamp,
      },
      { status: 500 }
    );
  }
}


// =========================================================
// HEALTH CHECK
// =========================================================

export async function HEAD() {
  return new Response(null, {
    status: 200,
  });
}