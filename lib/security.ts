/**
 * Apexium AI Customer Support Assistant - Security & Sanitization Utilities
 * 
 * Provides XSS prevention, input sanitization, and JWT token retrieval.
 */

/**
 * Sanitizes user text input to prevent XSS (Cross-Site Scripting) attacks.
 * Strips script tags, HTML entities, and dangerous control characters.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Unescapes HTML entities for display in text containers where safe
 */
export function decodeSanitizedText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Recursively sanitizes string fields in an object (e.g. LeadFormData)
 */
export function sanitizeObject<T extends object>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Retrieves JWT authentication token from HTTP cookies or localStorage.
 * Anticipates standard JWT storage keys (jwt, token, auth_token, bearer).
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const cookieMatches = document.cookie.match(/(?:^|;\s*)(?:jwt|token|auth_token|bearer)\s*=\s*([^;]+)/i);
  if (cookieMatches && cookieMatches[1]) {
    return decodeURIComponent(cookieMatches[1]);
  }

  const localStorageKeys = ['jwt', 'token', 'auth_token', 'apexium_jwt_token'];
  for (const key of localStorageKeys) {
    const val = localStorage.getItem(key);
    if (val) return val;
  }

  return null;
}
