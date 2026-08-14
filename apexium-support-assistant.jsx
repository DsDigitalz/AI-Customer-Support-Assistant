import { useState, useRef, useEffect } from "react";
import { Shield, Cpu, GraduationCap, Send, Loader2, MessageSquare, Zap } from "lucide-react";

const SYSTEM_PROMPT = `You are Kate, the AI Customer Support Assistant for Apexium, a B2B services company with three lines of business:

1. CYBERSECURITY SERVICES — penetration testing & vulnerability assessments, managed SOC (24/7 threat monitoring), compliance readiness (ISO 27001, SOC 2, GDPR), incident response retainers, security audits.
2. TECHNOLOGY SERVICES — cloud migration & infrastructure management, custom software development, IT consulting & systems integration, managed IT support.
3. TRAINING SERVICES — cybersecurity awareness training for staff, technical certification prep (e.g. CISSP, CompTIA, cloud certs), custom workshops for engineering and leadership teams.

Your job:
- Answer customer enquiries about these three service lines clearly and helpfully.
- Ask a clarifying question if the enquiry is ambiguous (e.g. which service line, company size, urgency).
- For pricing, give general guidance only (e.g. "engagements are scoped individually based on company size and complexity") and offer to connect them with a sales specialist — never invent exact prices.
- For active security incidents, urge them to contact the 24/7 incident response line immediately and flag this as urgent.
- Keep replies concise (3-6 sentences), warm, and professional. Use plain language, avoid jargon overload.
- If a question is outside Apexium's services, politely say so and redirect to what Apexium can help with.
- Never claim to take real actions (booking, billing) — offer to route the request to the right human team instead.

You have three live integrations you can call as tools:
- crm_lookup_account — check a company's account tier, active services, and account manager.
- ticketing_create_incident — open a real incident ticket with the SOC for active/suspected security incidents.
- lms_check_course — check a training course's next session date and seat availability.
Use a tool whenever it would give the customer a concrete, accurate answer instead of a generic one. After a tool result comes back, explain it to the customer in plain language.`;

const TOOL_LABELS = {
  crm_lookup_account: "Checking CRM account…",
  ticketing_create_incident: "Opening SOC incident ticket…",
  lms_check_course: "Checking LMS course availability…",
};

const suggestedQuestions = [
  "We think we've had a data breach — please open an incident ticket, it's critical",
  "I'm from Northwind Logistics — what's on our account?",
  "When's the next CISSP prep course and are there seats left?",
  "Do you offer cybersecurity training for non-technical staff?",
];

const serviceLines = [
  { icon: Shield, label: "Cybersecurity", color: "#5EEAD4" },
  { icon: Cpu, label: "Technology", color: "#7DD3FC" },
  { icon: GraduationCap, label: "Training", color: "#FDE68A" },
];

/* ---------------------------------------------------------------------
 * MOCK INTEGRATIONS
 * In production these would call real systems (Salesforce/HubSpot CRM,
 * ServiceNow/Jira ticketing, an LMS like TalentLMS/Moodle). Here they
 * return realistic mock data so the prototype demonstrates the
 * end-to-end integration pattern without needing real credentials.
 * ------------------------------------------------------------------- */

const MOCK_CRM_ACCOUNTS = {
  northwind: { company: "Northwind Logistics", tier: "Enterprise", activeServices: ["Managed SOC", "Cloud Migration"], accountManager: "Priya Nair" },
  acme: { company: "Acme Retail Group", tier: "Growth", activeServices: ["Security Audit"], accountManager: "James Okafor" },
};

const MOCK_LMS_COURSES = {
  cissp: { course: "CISSP Certification Prep", nextSession: "2026-09-08", seatsLeft: 6, durationWeeks: 6 },
  "security awareness": { course: "Cybersecurity Awareness for Staff", nextSession: "2026-08-25", seatsLeft: 14, durationWeeks: 1 },
  cloud: { course: "Cloud Fundamentals Workshop", nextSession: "2026-09-15", seatsLeft: 9, durationWeeks: 2 },
};

function crmLookupAccount({ company_name }) {
  const key = Object.keys(MOCK_CRM_ACCOUNTS).find((k) => company_name.toLowerCase().includes(k));
  const record = key ? MOCK_CRM_ACCOUNTS[key] : null;
  return record
    ? { found: true, ...record }
    : { found: false, note: "No matching account found — likely a new prospect, not yet in CRM." };
}

function ticketingCreateIncident({ summary, urgency }) {
  const ticketId = "INC-" + Math.floor(10000 + Math.random() * 89999);
  return {
    ticketId,
    urgency,
    status: "Open — routed to SOC on-call",
    eta_minutes: urgency === "critical" ? 15 : 60,
  };
}

function lmsCheckCourse({ course_query }) {
  const key = Object.keys(MOCK_LMS_COURSES).find((k) => course_query.toLowerCase().includes(k));
  const record = key ? MOCK_LMS_COURSES[key] : null;
  return record
    ? { found: true, ...record }
    : { found: false, note: "No exact course match — suggest the customer speak with the training team for custom workshops." };
}

const TOOLS = [
  {
    name: "crm_lookup_account",
    description: "Look up a customer's account in the CRM by company name to see their tier, active services, and account manager.",
    input_schema: {
      type: "object",
      properties: { company_name: { type: "string", description: "The customer's company name as given by the user." } },
      required: ["company_name"],
    },
  },
  {
    name: "ticketing_create_incident",
    description: "Create an incident ticket in the security ticketing system and route it to the SOC on-call team. Use only for active/suspected security incidents.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Brief summary of the incident." },
        urgency: { type: "string", enum: ["critical", "high", "normal"] },
      },
      required: ["summary", "urgency"],
    },
  },
  {
    name: "lms_check_course",
    description: "Check the LMS for a training course's next session date and seat availability.",
    input_schema: {
      type: "object",
      properties: { course_query: { type: "string", description: "Course name or topic the customer asked about." } },
      required: ["course_query"],
    },
  },
];

function runTool(name, input) {
  if (name === "crm_lookup_account") return crmLookupAccount(input);
  if (name === "ticketing_create_incident") return ticketingCreateIncident(input);
  if (name === "lms_check_course") return lmsCheckCourse(input);
  return { error: "Unknown tool" };
}

export default function ApexiumSupportAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm Kate — Apexium's support assistant. I can help with questions about our cybersecurity, technology, or training services. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function callClaude(apiMessages) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: apiMessages,
      }),
    });
    return response.json();
  }

  async function sendMessage(text) {
    const userMsg = { role: "user", content: text };
    let uiMessages = [...messages, userMsg];
    setMessages(uiMessages);
    setInput("");
    setLoading(true);

    // apiMessages tracks the raw Anthropic message format (needed for tool_use / tool_result blocks)
    let apiMessages = uiMessages.map((m) => ({ role: m.role, content: m.content }));

    try {
      let data = await callClaude(apiMessages);
      let guard = 0;

      // Loop while Claude wants to call a tool (max 3 hops to stay safe)
      while (data?.stop_reason === "tool_use" && guard < 3) {
        guard++;
        const toolUseBlocks = data.content.filter((b) => b.type === "tool_use");

        // Show a badge for each integration call
        for (const t of toolUseBlocks) {
          uiMessages = [...uiMessages, { role: "tool", content: t.name }];
        }
        setMessages(uiMessages);

        const toolResults = toolUseBlocks.map((t) => ({
          type: "tool_result",
          tool_use_id: t.id,
          content: JSON.stringify(runTool(t.name, t.input)),
        }));

        apiMessages = [
          ...apiMessages,
          { role: "assistant", content: data.content },
          { role: "user", content: toolResults },
        ];

        data = await callClaude(apiMessages);
      }

      const text =
        data?.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") ||
        "Sorry, I couldn't process that. Could you try rephrasing?";
      uiMessages = [...uiMessages, { role: "assistant", content: text }];
      setMessages(uiMessages);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong reaching support. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    sendMessage(trimmed);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1120",
        color: "#E5E9F0",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #5EEAD4, #22D3EE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={18} color="#0B1120" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>Apexium Support</div>
              <div style={{ fontSize: 12, color: "#7A8BAA", fontFamily: "'JetBrains Mono', monospace" }}>
                Kate · AI Assistant
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {serviceLines.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                title={label}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#141B2E",
                  border: `1px solid ${color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={14} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div
          style={{
            background: "#0F1729",
            border: "1px solid #1E293B",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              height: 420,
              overflowY: "auto",
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.map((m, i) =>
              m.role === "tool" ? (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11.5,
                    color: "#5EEAD4",
                    background: "#0F2A28",
                    border: "1px solid #5EEAD433",
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Zap size={11} /> {TOOL_LABELS[m.content] || m.content}
                </div>
              ) : (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#5B6B8C",
                    marginBottom: 4,
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: m.role === "user" ? "right" : "left",
                  }}
                >
                  {m.role === "user" ? "You" : "Kate"}
                </div>
                <div
                  style={{
                    background: m.role === "user" ? "#1E3A46" : "#141B2E",
                    border: m.role === "user" ? "1px solid #2DD4BF44" : "1px solid #1E293B",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: "10px 14px",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
              )
            )}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, color: "#7A8BAA", fontSize: 13 }}>
                <Loader2 size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} />
                Kate is typing…
              </div>
            )}
          </div>

          {/* Suggested questions (only show at start) */}
          {messages.length === 1 && (
            <div style={{ padding: "0 18px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: "#141B2E",
                    border: "1px solid #23304A",
                    color: "#A8B5CC",
                    borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid #1E293B",
              padding: "12px 14px",
              display: "flex",
              gap: 8,
              background: "#0B1120",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ask about cybersecurity, technology, or training…"
              style={{
                flex: 1,
                background: "#141B2E",
                border: "1px solid #23304A",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#E5E9F0",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "#1E293B" : "linear-gradient(135deg, #5EEAD4, #22D3EE)",
                border: "none",
                borderRadius: 10,
                width: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading || !input.trim() ? "default" : "pointer",
              }}
            >
              <Send size={16} color={loading || !input.trim() ? "#5B6B8C" : "#0B1120"} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 11.5, color: "#4A5878", marginTop: 12 }}>
          Prototype for internal evaluation · Apexium Week 7 — AI for Business
        </div>
      </div>
    </div>
  );
}
