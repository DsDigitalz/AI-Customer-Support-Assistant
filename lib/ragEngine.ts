/**
 * Apexium AI Customer Support Assistant - RAG Engine & System Prompt Enforcer (Phase 3)
 */

import {
  APEXIUM_KNOWLEDGE_BASE,
  FAQItem,
} from './knowledgeBase';
import { classifyIntent, IntentResult, UserIntent } from './intentClassifier';

export interface RAGResponse {
  success: boolean;
  reply: string;
  intent: UserIntent;
  confidence: number;
  toolCall?: {
    name: string;
    label: string;
  } | null;
  triggerLeadForm: boolean;
  isEscalated: boolean;
  escalationReason?: string;
  timestamp: string;
}

/**
 * Phase 3 Step 2 - System Prompt Definition & Guardrails
 */
export const SYSTEM_PROMPT = `
You are Kate, the Apexium AI Customer Support Assistant.
Your role is to help customers understand Apexium's:
1. Cybersecurity services
2. Technology services
3. Training programs

Rules:
- Only provide information available in the approved knowledge base.
- Do not invent prices, services, policies, or guarantees.
- If information is unavailable, inform the customer and offer human assistance.
- Keep answers clear, professional, and friendly.
- Ask follow-up questions when necessary.
- Detect potential sales opportunities.
- Offer to collect the customer's contact information when appropriate.
`;

export function processRAGQuery(
  userMessage: string
): RAGResponse {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const normalized = userMessage.toLowerCase().trim();
  const intentResult: IntentResult = classifyIntent(userMessage);

  // 1. Handle Direct Human Support Escalation
  if (intentResult.primaryIntent === 'human_support') {
    return {
      success: true,
      reply:
        "I would be happy to connect you directly with an Apexium Specialist! Our team can provide custom guidance for your business. Please complete the quick enquiry form below so our technical team can reach out to you promptly.",
      intent: 'human_support',
      confidence: intentResult.confidence,
      toolCall: {
        name: 'crm_route_support',
        label: 'Routing request to Apexium Human Support & Account Manager…',
      },
      triggerLeadForm: true,
      isEscalated: true,
      escalationReason: intentResult.escalationReason,
      timestamp,
    };
  }

  // 2. Handle Sales / Quotation / Pricing Escalation
  if (intentResult.primaryIntent === 'sales_enquiry') {
    return {
      success: true,
      reply:
        "I'd be glad to arrange a tailored price quote and consultation for your organization! Because our solutions are customized to your infrastructure, please complete the short consultation request form below, and a Solutions Architect will prepare your quote.",
      intent: 'sales_enquiry',
      confidence: intentResult.confidence,
      toolCall: {
        name: 'crm_prepare_quotation',
        label: 'Preparing Lead Capture & Enterprise Quotation Referral…',
      },
      triggerLeadForm: true,
      isEscalated: true,
      escalationReason: intentResult.escalationReason,
      timestamp,
    };
  }

  // 3. Search Knowledge Base FAQs across categories
  const allFAQs: { faq: FAQItem; category: string }[] = [];

  [
    ...APEXIUM_KNOWLEDGE_BASE.cybersecurity,
    ...APEXIUM_KNOWLEDGE_BASE.technology,
    ...APEXIUM_KNOWLEDGE_BASE.training,
  ].forEach((svc) => {
    svc.faqs.forEach((faq) => {
      allFAQs.push({ faq, category: svc.category });
    });
  });

  let bestMatch: FAQItem | null = null;
  let maxScore = 0;

  for (const { faq } of allFAQs) {
    let score = 0;
    const faqQ = faq.question.toLowerCase();

    // Exact question match check
    if (faqQ === normalized || normalized.includes(faqQ.replace('?', ''))) {
      score += 10;
    }

    // Keyword match scoring
    for (const kw of faq.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && maxScore >= 3) {
    const shouldEscalate = Boolean(bestMatch.escalationRequired);
    return {
      success: true,
      reply: bestMatch.answer,
      intent: intentResult.primaryIntent,
      confidence: 0.92,
      toolCall: shouldEscalate
        ? {
            name: 'kb_lead_referral',
            label: 'Opening consultation request option…',
          }
        : null,
      triggerLeadForm: shouldEscalate,
      isEscalated: shouldEscalate,
      timestamp,
    };
  }

  // 4. Category-level general lookup if specific FAQ match is below threshold
  if (intentResult.primaryIntent === 'cybersecurity') {
    return {
      success: true,
      reply:
        "Apexium offers comprehensive Cybersecurity Services including Penetration Testing, 24/7 Managed SOC Threat Monitoring, Security Assessments & Risk Audits, and ISO 27001 / SOC 2 Compliance Readiness. How can we help secure your business today?",
      intent: 'cybersecurity',
      confidence: 0.85,
      toolCall: {
        name: 'kb_query_cybersecurity',
        label: 'Searching Cybersecurity Knowledge Base…',
      },
      triggerLeadForm: false,
      isEscalated: false,
      timestamp,
    };
  }

  if (intentResult.primaryIntent === 'technology') {
    return {
      success: true,
      reply:
        "Apexium's Technology Services division specializes in Custom Software Development, Cloud Migration & Infrastructure (AWS, Azure, GCP), Digital Transformation, and IT Systems Integration. Would you like to discuss a custom solution?",
      intent: 'technology',
      confidence: 0.85,
      toolCall: {
        name: 'kb_query_technology',
        label: 'Searching Technology Knowledge Base…',
      },
      triggerLeadForm: false,
      isEscalated: false,
      timestamp,
    };
  }

  if (intentResult.primaryIntent === 'training') {
    return {
      success: true,
      reply:
        "Apexium Training Programs offer Cybersecurity Awareness Workshops, Technical Certification Bootcamps (CISSP, CompTIA), Cloud Engineering, and Custom Corporate Cohorts. Programs cater to individuals and enterprise teams alike.",
      intent: 'training',
      confidence: 0.85,
      toolCall: {
        name: 'kb_query_training',
        label: 'Searching Training Knowledge Base…',
      },
      triggerLeadForm: false,
      isEscalated: false,
      timestamp,
    };
  }

  if (intentResult.primaryIntent === 'general_enquiry') {
    return {
      success: true,
      reply: `${APEXIUM_KNOWLEDGE_BASE.company.overview} We provide services in Cybersecurity, Technology Solutions, and Training Programs. How can I assist you today?`,
      intent: 'general_enquiry',
      confidence: 0.8,
      toolCall: null,
      triggerLeadForm: false,
      isEscalated: false,
      timestamp,
    };
  }

  // 5. Fallback for Unknown / Out-of-Scope Queries (No Hallucination Enforcer)
  return {
    success: true,
    reply:
      "I don't have that specific information in my knowledge base. However, I can connect you with an Apexium Human Support Specialist who can answer your inquiry right away. Would you like to submit your details?",
    intent: 'unknown',
    confidence: 0.3,
    toolCall: {
      name: 'escalate_unknown_query',
      label: 'Triggering Human Support Referral for out-of-scope inquiry…',
    },
    triggerLeadForm: true,
    isEscalated: true,
    escalationReason:
      'Information is unavailable in knowledge base; offering human escalation.',
    timestamp,
  };
}
