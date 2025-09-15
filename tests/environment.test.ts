/**
 * Unit tests for environment utilities
 */

import {isBrowser, isNode} from '../utils/environment';

describe('Environment Utilities', () => {
	describe('isBrowser', () => {
		it('should return false in Node.js environment', () => {
			expect(isBrowser()).toBe(false);
		});
	});
	
	describe('isNode', () => {
		it('should return true in Node.js environment', () => {
			expect(isNode()).toBe(true);
		});
	});
});
