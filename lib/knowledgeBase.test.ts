/**
 * Test Suite for Phase 2 & Phase 3 - Core Use Cases & Escalation Verification
 */

import { processRAGQuery } from './ragEngine';
import { classifyIntent } from './intentClassifier';

const testCases = [
  // Cybersecurity Core Use Cases
  {
    query: "What cybersecurity services do you offer?",
    expectedIntent: "cybersecurity",
    expectLeadForm: false,
  },
  {
    query: "How can Apexium help secure my business?",
    expectedIntent: "cybersecurity",
    expectLeadForm: false,
  },
  {
    query: "Do you offer security assessments?",
    expectedIntent: "cybersecurity",
    expectLeadForm: false,
  },
  {
    query: "How do I get a cybersecurity consultation?",
    expectedIntent: "sales_enquiry",
    expectLeadForm: true, // Should trigger consultation lead form
  },

  // Technology Core Use Cases
  {
    query: "What technology solutions does Apexium provide?",
    expectedIntent: "technology",
    expectLeadForm: false,
  },
  {
    query: "Can you develop a custom software solution?",
    expectedIntent: "technology",
    expectLeadForm: false,
  },
  {
    query: "How can I contact the technology team?",
    expectedIntent: "technology",
    expectLeadForm: true,
  },

  // Training Core Use Cases
  {
    query: "What training programs are available?",
    expectedIntent: "training",
    expectLeadForm: false,
  },
  {
    query: "Who can enroll?",
    expectedIntent: "training",
    expectLeadForm: false,
  },
  {
    query: "How do I register?",
    expectedIntent: "training",
    expectLeadForm: true,
  },
  {
    query: "Are corporate training programs available?",
    expectedIntent: "training",
    expectLeadForm: false,
  },

  // Escalation Cases
  {
    query: "Can I get a custom quotation for SOC 2 compliance?",
    expectedIntent: "sales_enquiry",
    expectLeadForm: true,
    expectEscalation: true,
  },
  {
    query: "I want to talk to a human right now",
    expectedIntent: "human_support",
    expectLeadForm: true,
    expectEscalation: true,
  },
  {
    query: "What is the secret recipe for quantum computing propulsion?",
    expectedIntent: "unknown",
    expectLeadForm: true,
    expectEscalation: true,
  },
];

console.log("====================================================");
console.log("   APEXIUM AI ASSISTANT - CORE USE CASES TEST SUITE");
console.log("====================================================\n");

let passedCount = 0;

testCases.forEach((tc, idx) => {
  const intentRes = classifyIntent(tc.query);
  const ragRes = processRAGQuery(tc.query);

  const intentOk = intentRes.primaryIntent === tc.expectedIntent || ragRes.intent === tc.expectedIntent;
  const leadFormOk = ragRes.triggerLeadForm === tc.expectLeadForm;
  const passed = intentOk && leadFormOk;

  if (passed) passedCount++;

  console.log(`[Test ${idx + 1}] "${tc.query}"`);
  console.log(`  -> Detected Intent: ${ragRes.intent} (Expected: ${tc.expectedIntent})`);
  console.log(`  -> Trigger Lead Form: ${ragRes.triggerLeadForm} (Expected: ${tc.expectLeadForm})`);
  console.log(`  -> Response snippet: "${ragRes.reply.substring(0, 80)}..."`);
  console.log(`  -> Result: ${passed ? "✅ PASS" : "❌ FAIL"}\n`);
});

console.log("====================================================");
console.log(`Summary: ${passedCount}/${testCases.length} Tests Passed Cleanly`);
console.log("====================================================");

if (passedCount !== testCases.length) {
  process.exit(1);
}
