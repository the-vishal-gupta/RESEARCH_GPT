import { Paper } from '@/types/index';

/**
 * Validates email format and length
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 255) return false;

  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes and validates search query string
 * @param query - Raw search input
 * @returns Sanitized query string (max 500 chars, no HTML/script tags)
 */
export function validateQueryString(query: string): string {
  if (!query || typeof query !== 'string') return '';

  // Trim and limit length
  let sanitized = query.trim().substring(0, 500);

  // Remove HTML/script tags
  sanitized = sanitized
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;|&gt;/g, '');

  // Escape special regex characters
  sanitized = escapeSpecialChars(sanitized);

  return sanitized;
}

/**
 * Validates URL format
 * @param url - URL string to validate
 * @returns true if URL is valid
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes dangerous HTML tags and attributes
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML safe for display
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Create a temporary element to leverage browser's HTML parsing
  const temp = document.createElement('div');
  temp.textContent = html; // textContent escapes HTML

  // Allow safe tags only
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'code', 'pre'];
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script and event attributes
  const scripts = div.querySelectorAll('script, style, iframe');
  scripts.forEach(script => script.remove());

  // Remove event handlers
  const allElements = div.querySelectorAll('*');
  allElements.forEach(element => {
    // Remove event attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });

    // Remove dangerous attributes
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes));
    }
  });

  return div.innerHTML;
}

/**
 * Type guard: validates if unknown value is a valid Paper object
 * @param paper - Value to validate
 * @returns true if value matches Paper interface
 */
export function validatePaper(paper: unknown): paper is Paper {
  if (!paper || typeof paper !== 'object') return false;

  const p = paper as Record<string, unknown>;

  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    Array.isArray(p.authors) && p.authors.every(a => typeof a === 'string') &&
    typeof p.publication === 'string' &&
    typeof p.year === 'number' &&
    typeof p.abstract === 'string' &&
    typeof p.citations === 'number' &&
    (p.doi === undefined || typeof p.doi === 'string') &&
    (p.pdfUrl === undefined || typeof p.pdfUrl === 'string') &&
    (p.publisher === undefined || typeof p.publisher === 'string') &&
    (p.isPaywalled === undefined || typeof p.isPaywalled === 'boolean')
  );
}

/**
 * Validates file size
 * @param sizeInBytes - File size in bytes
 * @param maxMB - Maximum allowed size in megabytes
 * @returns true if file size is within limit
 */
export function validateFileSize(sizeInBytes: number, maxMB: number): boolean {
  if (typeof sizeInBytes !== 'number' || typeof maxMB !== 'number') {
    return false;
  }

  const maxBytes = maxMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxBytes;
}

/**
 * Escapes special characters for safe display
 * @param str - String to escape
 * @returns Escaped string safe for display
 */
export function escapeSpecialChars(str: string): string {
  if (!str || typeof str !== 'string') return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'\/]/g, char => map[char]);
}

/**
 * Password validation rules
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 * @param password - Password to validate
 * @returns validation result with detailed feedback
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must include at least one special character (!@#$%^&*)');
  }

  // Check for common passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Choose a more unique password');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates search rate limit (max 30 searches per minute per user)
 * @param timestamps - Array of search timestamps
 * @returns true if search is allowed
 */
export function validateSearchRateLimit(timestamps: Date[]): boolean {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentSearches = timestamps.filter(ts => ts > oneMinuteAgo).length;
  return recentSearches < 30;
}
