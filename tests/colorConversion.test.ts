/**
 * Unit tests for color conversion utilities
 */

import {hexToRgb, rgbToHex} from '../utils/colorConversion';
import {HexColor} from '../types';

describe('Color Conversion Utilities', () => {
	describe('hexToRgb', () => {
		it('should convert hex color with # prefix to RGB', () => {
			const result = hexToRgb('#FF5733' as HexColor);
			expect(result).toEqual([255, 87, 51]);
		});
		
		it('should convert hex color without # prefix to RGB', () => {
			const result = hexToRgb('FF5733' as HexColor);
			expect(result).toEqual([255, 87, 51]);
		});
		
		it('should convert 3-digit hex to RGB', () => {
			const result = hexToRgb('#F53' as HexColor);
			expect(result).toEqual([255, 85, 51]);
		});
	});
	
	describe('rgbToHex', () => {
		it('should convert RGB array to hex', () => {
			const result = rgbToHex([255, 87, 51]);
			expect(result).toBe('#ff5733');
		});
		
		it('should handle single digit values', () => {
			const result = rgbToHex([1, 2, 3]);
			expect(result).toBe('#010203');
		});
	});
});
