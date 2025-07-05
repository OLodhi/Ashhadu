/**
 * Cross-platform UUID generation utility
 * Provides fallback for environments where crypto.randomUUID() is not available
 */

// Remove global declaration to avoid conflicts with built-in types

/**
 * Generates a UUID v4 string
 * Uses crypto.randomUUID() when available, falls back to polyfill
 */
export function generateUUID(): string {
  // Try native crypto.randomUUID() first (available in modern browsers and Node.js 16+)
  if (typeof globalThis !== 'undefined' && 
      globalThis.crypto && 
      'randomUUID' in globalThis.crypto &&
      typeof (globalThis.crypto as any).randomUUID === 'function') {
    return (globalThis.crypto as any).randomUUID();
  }
  
  // Try Node.js crypto module
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      if (crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (e) {
      // Fall through to polyfill
    }
  }
  
  // Polyfill for older environments
  return polyfillUUID();
}

/**
 * UUID v4 polyfill using Math.random()
 * Based on RFC 4122 specification
 */
function polyfillUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generates a short UUID (8 characters) for UI display
 */
export function generateShortUUID(): string {
  return generateUUID().substring(0, 8);
}

export default generateUUID;