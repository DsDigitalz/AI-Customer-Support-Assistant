import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateLeadForm, normalizePhone } from "./leadValidation.ts";

describe("lead validation", () => {
  it("accepts a valid lead submission", () => {
    const result = validateLeadForm({
      fullName: "Jane Doe",
      email: "jane@apexium.com",
      phone: "+1 (555) 123-4567",
      company: "Apexium Labs",
      serviceOfInterest: "Cybersecurity Services",
      message: "We need a security review and 24/7 SOC consultation.",
      conversationId: "conv_123",
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
  });

  it("rejects invalid emails and empty messages", () => {
    const result = validateLeadForm({
      fullName: "J",
      email: "not-an-email",
      phone: "abc",
      company: "",
      serviceOfInterest: "",
      message: "",
      conversationId: "conv_123",
    });

    assert.equal(result.isValid, false);
    assert.match(result.errors.fullName ?? "", /at least 2/i);
    assert.match(result.errors.email ?? "", /valid email/i);
    assert.match(result.errors.phone ?? "", /valid phone/i);
    assert.match(result.errors.company ?? "", /required/i);
    assert.match(result.errors.message ?? "", /required/i);
  });

  it("normalizes phone input into digits for validation", () => {
    assert.equal(normalizePhone("+1 (555) 123-4567"), "15551234567");
    assert.equal(normalizePhone(" 020 555 7788 "), "0205557788");
  });
});
