/**
 * Unit tests for color utilities
 */

import {isColorSimilarHex, isTransparentPixel} from '../utils/colors';
import {HexColor, RGBA} from '../types';

describe('Color Utilities', () => {
	describe('isColorSimilarHex', () => {
		it('should return true for identical colors', () => {
			const color1 = '#FF5733' as HexColor;
			const color2 = '#FF5733' as HexColor;
			
			const result = isColorSimilarHex(color1, color2, 10);
			expect(result).toBe(true);
		});
		
		it('should return false for different colors outside threshold', () => {
			const color1 = '#FF0000' as HexColor; // Red
			const color2 = '#0000FF' as HexColor; // Blue
			
			const result = isColorSimilarHex(color1, color2, 10);
			expect(result).toBe(false);
		});
		
		it('should throw error for invalid threshold', () => {
			const color1 = '#FF5733' as HexColor;
			const color2 = '#FF5734' as HexColor;
			
			expect(() => isColorSimilarHex(color1, color2, -1)).toThrow();
			expect(() => isColorSimilarHex(color1, color2, 101)).toThrow();
		});
	});
	
	describe('isTransparentPixel', () => {
		it('should return true for transparent pixel', () => {
			const pixel: RGBA = [255, 0, 0, 5]; // Alpha = 5
			const result = isTransparentPixel(pixel);
			expect(result).toBe(true);
		});
		
		it('should return false for opaque pixel', () => {
			const pixel: RGBA = [255, 0, 0, 255]; // Alpha = 255
			const result = isTransparentPixel(pixel);
			expect(result).toBe(false);
		});
	});
});
