/**
 * Apexium AI Customer Support Assistant - Structured Knowledge Base (Phase 2)
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  escalationRequired?: boolean;
}

export interface ServiceDetail {
  id: string;
  serviceName: string;
  category: 'cybersecurity' | 'technology' | 'training';
  description: string;
  problemsSolved: string[];
  targetCustomers: string;
  process: string[];
  duration?: string;
  requirements?: string;
  faqs: FAQItem[];
  whenToEscalate: string[];
}

export interface CompanyInformation {
  name: string;
  tagline: string;
  overview: string;
  mission: string;
  services: string[];
  targetCustomers: string[];
  contactInformation: {
    email: string;
    phone: string;
    address: string;
    socOnCall: string;
  };
  businessHours: {
    generalSupport: string;
    socOperations: string;
    consultingHours: string;
  };
}

export interface KnowledgeBaseData {
  company: CompanyInformation;
  cybersecurity: ServiceDetail[];
  technology: ServiceDetail[];
  training: ServiceDetail[];
  escalationRules: {
    triggers: string[];
    reasons: Record<string, string>;
  };
}

export const APEXIUM_KNOWLEDGE_BASE: KnowledgeBaseData = {
  company: {
    name: "Apexium Digital & Technology Solutions",
    tagline: "Securing Enterprises & Engineering Scalable Digital Futures",
    overview:
      "Apexium is a premier technology and cybersecurity engineering firm specializing in enterprise defense, cloud infrastructure optimization, custom software engineering, and industry-accredited technical training.",
    mission:
      "To empower organizations through zero-trust security architectures, high-performance software systems, and workforce capability acceleration.",
    services: [
      "Cybersecurity Services (Penetration Testing, 24/7 Managed SOC, Security Assessments, ISO 27001 / SOC 2 Compliance)",
      "Technology Services (Custom Software Development, Cloud Migration & Infrastructure, IT Systems Integration, Tech Consulting)",
      "Training Programs (Workforce Cybersecurity Awareness, Technical Certification Prep like CISSP, Custom Corporate Workshops)",
    ],
    targetCustomers: [
      "Small & Medium Enterprises (SMEs) expanding cloud footprint",
      "Large Enterprises requiring 24/7 Security Operations Center (SOC)",
      "FinTech, Healthcare & E-Commerce firms requiring compliance certification",
      "Engineering teams seeking corporate technical upskilling",
    ],
    contactInformation: {
      email: "support@apexiumtech.com",
      phone: "+1 (800) 555-APEX / +1 (555) 234-5678",
      address: "Apexium Tower, Suite 1200, Innovation Way, Enterprise City",
      socOnCall: "soc-hotline@apexiumtech.com (24/7 Priority Emergency Line)",
    },
    businessHours: {
      generalSupport: "Monday to Friday: 8:00 AM - 6:00 PM EST",
      socOperations: "24 Hours / 7 Days a Week / 365 Days a Year (Always Active)",
      consultingHours: "Monday to Friday: 9:00 AM - 5:00 PM EST (By Appointment)",
    },
  },

  cybersecurity: [
    {
      id: "cyb-assessments",
      serviceName: "Cybersecurity Assessments & Risk Audits",
      category: "cybersecurity",
      description:
        "Apexium evaluates enterprise IT systems, cloud environments, and internal networks to identify potential vulnerabilities, compliance gaps, and security risks.",
      problemsSolved: [
        "Unidentified system vulnerabilities and exposed attack surfaces",
        "Non-compliance with ISO 27001, SOC 2, HIPAA, or GDPR standards",
        "Uncertainty about current security architecture robustness",
      ],
      targetCustomers:
        "Businesses and organizations seeking to establish a baseline security audit or prepare for compliance certification.",
      process: [
        "1. Scoping & Threat Modeling Session",
        "2. Automated & Manual Vulnerability Scanning",
        "3. Architecture & Access Control Audit",
        "4. Risk Scoring & Prioritized Remediation Roadmap Report",
        "5. Executive Debrief & Re-assessment Verification",
      ],
      faqs: [
        {
          id: "faq-cyb-1",
          question: "What cybersecurity services do you offer?",
          answer:
            "Apexium offers comprehensive Cybersecurity Services including Penetration Testing, 24/7 Managed SOC Threat Monitoring, Security Assessments & Risk Audits, and ISO 27001 / SOC 2 Compliance Readiness.",
          keywords: ["what", "cybersecurity", "services", "offer", "provide"],
        },
        {
          id: "faq-cyb-2",
          question: "How can Apexium help secure my business?",
          answer:
            "Apexium secures your business by conducting end-to-end vulnerability assessments, implementing continuous 24/7 SOC monitoring to block cyber threats in real-time, fortifying cloud infrastructure, and training your staff to prevent phishing attacks.",
          keywords: ["how", "help", "secure", "business", "company", "protect"],
        },
        {
          id: "faq-cyb-3",
          question: "Do you offer security assessments?",
          answer:
            "Yes! We offer full Security Assessments and Risk Audits that scan your infrastructure, highlight security gaps, and provide actionable remediation reports tailored to your compliance goals.",
          keywords: ["offer", "security", "assessment", "assessments", "audit", "risk"],
        },
        {
          id: "faq-cyb-4",
          question: "How do I get a cybersecurity consultation?",
          answer:
            "Getting a consultation is simple! You can click the 'Talk to a Human' button or fill out our brief Lead Consultation Request form right here in the chat. An Apexium Security Specialist will reach out within 24 hours.",
          keywords: ["how", "get", "consultation", "book", "schedule", "cybersecurity"],
          escalationRequired: true,
        },
      ],
      whenToEscalate: [
        "Customer asks for custom pricing or detailed quotation",
        "Customer reports active security incident or ongoing breach",
        "Customer requests direct consultation booking with a security architect",
      ],
    },
    {
      id: "cyb-soc",
      serviceName: "24/7 Managed SOC & Incident Response",
      category: "cybersecurity",
      description:
        "Around-the-clock Security Operations Center (SOC) monitoring powered by SIEM and threat intelligence to detect, contain, and remediate cyber threats before damage occurs.",
      problemsSolved: [
        "Inability to monitor threats 24/7 internally",
        "Delayed reaction time during ransomware or malware outbreaks",
        "Alert fatigue for internal IT teams",
      ],
      targetCustomers:
        "Mid-market and enterprise organizations with mission-critical systems and zero tolerance for downtime.",
      process: [
        "1. SIEM & Log Collector Onboarding",
        "2. Behavioral Baseline & Alert Threshold Configuration",
        "3. Continuous 24/7 Monitoring by Certified Security Analysts",
        "4. Automated Endpoint Containment & Rapid Incident Response",
      ],
      faqs: [],
      whenToEscalate: ["Active breach or ransomware alert", "Quotation request"],
    },
  ],

  technology: [
    {
      id: "tech-custom-dev",
      serviceName: "Custom Software Development & Engineering",
      category: "technology",
      description:
        "Apexium designs, builds, and deploys custom web applications, mobile apps, enterprise APIs, and scalable software tailored to your operational workflows.",
      problemsSolved: [
        "Off-the-shelf software failing to satisfy business requirements",
        "Legacy software refactoring and modernization delays",
        "Siloed systems requiring complex API integration",
      ],
      targetCustomers:
        "Companies looking to build proprietary software platforms, automate core processes, or modernize legacy systems.",
      process: [
        "1. Discovery & Architecture Blueprinting",
        "2. Agile Sprint-based Development",
        "3. Quality Assurance & Automated Security Testing",
        "4. Continuous Integration & Production Deployment",
      ],
      faqs: [
        {
          id: "faq-tech-1",
          question: "What technology solutions does Apexium provide?",
          answer:
            "Apexium provides Custom Software Development, Cloud Migration & Infrastructure Engineering (AWS, GCP, Azure), Digital Transformation Strategy, IT Systems Integration, and DevOps Automation.",
          keywords: ["what", "technology", "solutions", "services", "provide", "offer"],
        },
        {
          id: "faq-tech-2",
          question: "Can you develop a custom software solution?",
          answer:
            "Yes! Our technology team builds tailor-made web platforms, mobile apps, scalable backend APIs, and microservices custom-engineered to solve your specific business challenges.",
          keywords: ["can", "develop", "custom", "software", "solution", "build", "application"],
        },
        {
          id: "faq-tech-3",
          question: "How can I contact the technology team?",
          answer:
            "You can contact our technology team directly by filling out our brief consultation form in this chat, emailing support@apexiumtech.com, or requesting a call back with a Solutions Architect.",
          keywords: ["how", "contact", "technology", "tech", "team", "reach", "email"],
          escalationRequired: true,
        },
      ],
      whenToEscalate: [
        "Request for software project scope/budget estimate",
        "RFP (Request for Proposal) submissions",
        "Direct connection to lead developer or solutions architect",
      ],
    },
  ],

  training: [
    {
      id: "train-programs",
      serviceName: "Apexium Technical & Security Training Programs",
      category: "training",
      description:
        "Comprehensive hands-on training academies covering corporate cybersecurity awareness, technical certification bootcamps, and cloud software engineering.",
      problemsSolved: [
        "Workforce vulnerability to social engineering and phishing",
        "Skills gap in emerging tech & cloud security tools",
        "Lack of standardized cybersecurity compliance training",
      ],
      targetCustomers:
        "Individual IT professionals seeking certification, as well as corporations wanting to upskill their employees.",
      duration: "Flexible: 1-Day Workshops to 6-Week Certification Bootcamps",
      requirements: "Varies from introductory (no prerequisite) to advanced (basic networking/coding experience).",
      process: [
        "1. Skill Gap Assessment",
        "2. Curriculum Customization (for corporate cohorts)",
        "3. Live Interactive Instruction & Hands-on Labs",
        "4. Certification Testing & Practical Assessment",
      ],
      faqs: [
        {
          id: "faq-trn-1",
          question: "What training programs are available?",
          answer:
            "We offer Cybersecurity Awareness Training, CISSP & CompTIA Certification Bootcamps, Cloud Infrastructure Mastery (AWS/Azure), and Custom Corporate Technical Workshops.",
          keywords: ["what", "training", "programs", "courses", "available", "offer"],
        },
        {
          id: "faq-trn-2",
          question: "Who can enroll?",
          answer:
            "Anyone! Our programs accommodate individual IT professionals, junior engineers, managers seeking security fundamentals, and full corporate teams.",
          keywords: ["who", "can", "enroll", "join", "audience", "eligible"],
        },
        {
          id: "faq-trn-3",
          question: "How do I register?",
          answer:
            "You can register by completing our quick enquiry form here in the chat, specifying 'Training Programs' as your interest. Our training coordinator will send you the course schedule and enrollment link.",
          keywords: ["how", "register", "enroll", "sign up", "join"],
          escalationRequired: true,
        },
        {
          id: "faq-trn-4",
          question: "Are corporate training programs available?",
          answer:
            "Yes! We design custom corporate training workshops tailored specifically to your company's technology stack, compliance requirements, and employee size.",
          keywords: ["are", "corporate", "training", "programs", "available", "company", "team"],
        },
      ],
      whenToEscalate: [
        "Custom corporate cohort pricing requests",
        "Bulk seat registration inquiries",
        "Syllabus customization requests",
      ],
    },
  ],

  escalationRules: {
    triggers: [
      "quotation",
      "quote",
      "pricing",
      "price",
      "cost",
      "estimate",
      "speak to human",
      "talk to human",
      "human agent",
      "specialist",
      "expert",
      "book consultation",
      "schedule call",
      "hire apexium",
      "proposal",
    ],
    reasons: {
      quotation: "The customer is requesting a custom price quote or financial proposal.",
      speak_to_human: "The customer explicitly requested to speak with a human team member.",
      technical_specialist: "The inquiry requires specialized engineering evaluation.",
      book_consultation: "The customer wants to schedule a formal discovery meeting.",
      lacks_information: "The AI knowledge base does not contain the specific answer.",
    },
  },
};
