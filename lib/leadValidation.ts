import type { LeadFormData } from "./apiService";

export type LeadValidationErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "company"
    | "serviceOfInterest"
    | "message",
    string
  >
>;

export function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, "").trim();
}

export function validateLeadForm(data: LeadFormData): {
  isValid: boolean;
  errors: LeadValidationErrors;
} {
  const errors: LeadValidationErrors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email?.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  const digits = normalizePhone(data.phone || "");
  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (digits.length < 7 || !/^\d+$/.test(digits)) {
    errors.phone = "Please enter a valid phone number (at least 7 digits).";
  }

  if (!data.company?.trim()) {
    errors.company = "Company / Organization name is required.";
  }

  if (!data.message?.trim()) {
    errors.message = "Message is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
