/**
 * Checks if the code is running in a browser environment
 *
 * @returns True if running in browser, false otherwise
 *
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   // Use browser-specific APIs
 *   const canvas = document.createElement('canvas');
 * }
 * ```
 */
export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Checks if the code is running in a Node.js environment
 *
 * @returns True if running in Node.js, false otherwise
 *
 * @example
 * ```typescript
 * if (isNode()) {
 *   // Use Node.js-specific APIs
 *   const fs = require('fs');
 * }
 * ```
 */
export function isNode(): boolean {
	return typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
}
