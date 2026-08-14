/**
 * Apexium AI Customer Support Assistant - Intent Detection Engine (Phase 3 Step 3)
 */

export type UserIntent =
  | 'cybersecurity'
  | 'technology'
  | 'training'
  | 'general_enquiry'
  | 'sales_enquiry'
  | 'human_support'
  | 'unknown';

export interface IntentResult {
  primaryIntent: UserIntent;
  confidence: number;
  isEscalationRequired: boolean;
  escalationReason?: string;
  matchedKeywords: string[];
}

const INTENT_RULES: Record<
  UserIntent,
  { keywords: string[]; escalation?: boolean; reason?: string }
> = {
  human_support: {
    keywords: [
      'talk to a human',
      'talk to human',
      'speak to a human',
      'speak to human',
      'human support',
      'agent',
      'representative',
      'contact support',
      'speak to an expert',
      'speak to expert',
      'support specialist',
    ],
    escalation: true,
    reason: 'Customer requested human support',
  },
  sales_enquiry: {
    keywords: [
      'quote',
      'quotation',
      'pricing',
      'price',
      'cost',
      'how much',
      'estimate',
      'proposal',
      'hire',
      'book consultation',
      'consultation',
      'demo',
      'buy',
      'sales',
    ],
    escalation: true,
    reason: 'Customer requested quotation or sales consultation',
  },
  cybersecurity: {
    keywords: [
      'cybersecurity',
      'security',
      'assessment',
      'assessments',
      'audit',
      'pentest',
      'penetration testing',
      'soc',
      '24/7',
      'iso 27001',
      'soc 2',
      'compliance',
      'hack',
      'breach',
      'vulnerability',
      'secure my business',
    ],
  },
  technology: {
    keywords: [
      'technology',
      'tech',
      'software',
      'custom software',
      'solution',
      'solutions',
      'develop',
      'developer',
      'cloud',
      'migration',
      'aws',
      'azure',
      'gcp',
      'infrastructure',
      'integration',
      'contact the technology team',
      'tech team',
    ],
  },
  training: {
    keywords: [
      'training',
      'programs',
      'courses',
      'enroll',
      'register',
      'cissp',
      'comptia',
      'certification',
      'workshops',
      'corporate training',
      'who can enroll',
    ],
  },
  general_enquiry: {
    keywords: [
      'apexium',
      'company',
      'overview',
      'mission',
      'about',
      'hours',
      'location',
      'address',
      'phone',
      'email',
      'contact',
    ],
  },
  unknown: {
    keywords: [],
  },
};

export function classifyIntent(query: string): IntentResult {
  const normalized = query.toLowerCase().trim();
  let bestIntent: UserIntent = 'unknown';
  let maxScore = 0;
  let matchedKw: string[] = [];

  // Check explicit escalation keywords first
  for (const intentKey of ['human_support', 'sales_enquiry'] as UserIntent[]) {
    const rule = INTENT_RULES[intentKey];
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        return {
          primaryIntent: intentKey,
          confidence: 0.95,
          isEscalationRequired: true,
          escalationReason: rule.reason,
          matchedKeywords: [kw],
        };
      }
    }
  }

  // Check domain intents
  for (const intentKey of [
    'cybersecurity',
    'technology',
    'training',
    'general_enquiry',
  ] as UserIntent[]) {
    const rule = INTENT_RULES[intentKey];
    let score = 0;
    const currentMatches: string[] = [];

    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
        currentMatches.push(kw);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIntent = intentKey;
      matchedKw = currentMatches;
    }
  }

  if (maxScore === 0) {
    return {
      primaryIntent: 'unknown',
      confidence: 0.3,
      isEscalationRequired: true,
      escalationReason: 'The AI does not have enough information to answer this query.',
      matchedKeywords: [],
    };
  }

  return {
    primaryIntent: bestIntent,
    confidence: Math.min(0.5 + maxScore * 0.15, 0.98),
    isEscalationRequired: false,
    matchedKeywords: matchedKw,
  };
}
