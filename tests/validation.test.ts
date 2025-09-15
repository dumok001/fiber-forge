/**
 * Unit tests for validation utilities
 */

import {
	isPositiveInteger,
	isValidImagePath,
	isValidThreshold,
	isValidYarnsData,
	isValueInRange
} from '../utils/validation';
import {HexColor} from '../types';

describe('Validation Utilities', () => {
	describe('isValidThreshold', () => {
		it('should return true for valid thresholds with default range', () => {
			expect(isValidThreshold(0)).toBe(true);
			expect(isValidThreshold(50)).toBe(true);
			expect(isValidThreshold(100)).toBe(true);
		});
		
		it('should return false for invalid thresholds', () => {
			expect(isValidThreshold(-1)).toBe(false);
			expect(isValidThreshold(101)).toBe(false);
			expect(isValidThreshold(1.5)).toBe(false);
		});
		
		it('should work with custom min/max ranges', () => {
			expect(isValidThreshold(5, 1, 10)).toBe(true);
			expect(isValidThreshold(0, 1, 10)).toBe(false);
			expect(isValidThreshold(11, 1, 10)).toBe(false);
			expect(isValidThreshold(1, 1, 10)).toBe(true);
			expect(isValidThreshold(10, 1, 10)).toBe(true);
		});
		
		it('should return false for non-number values', () => {
			expect(isValidThreshold('50' as any)).toBe(false);
			expect(isValidThreshold(null as any)).toBe(false);
			expect(isValidThreshold(undefined as any)).toBe(false);
		});
		
		it('should return false for NaN and Infinity', () => {
			expect(isValidThreshold(NaN)).toBe(false);
			expect(isValidThreshold(Infinity)).toBe(false);
			expect(isValidThreshold(-Infinity)).toBe(false);
		});
	});
	
	describe('isValidImagePath', () => {
		it('should return true for valid image extensions', () => {
			expect(isValidImagePath('image.jpg')).toBe(true);
			expect(isValidImagePath('image.jpeg')).toBe(true);
			expect(isValidImagePath('image.png')).toBe(true);
			expect(isValidImagePath('image.gif')).toBe(true);
			expect(isValidImagePath('image.bmp')).toBe(true);
			expect(isValidImagePath('image.webp')).toBe(true);
			expect(isValidImagePath('image.svg')).toBe(true);
		});
		
		it('should return true for paths with directories', () => {
			expect(isValidImagePath('/path/to/image.jpg')).toBe(true);
			expect(isValidImagePath('./relative/path/image.png')).toBe(true);
			expect(isValidImagePath('../parent/image.gif')).toBe(true);
			expect(isValidImagePath('folder/subfolder/image.webp')).toBe(true);
		});
		
		it('should be case insensitive', () => {
			expect(isValidImagePath('image.JPG')).toBe(true);
			expect(isValidImagePath('image.PNG')).toBe(true);
			expect(isValidImagePath('image.JPEG')).toBe(true);
			expect(isValidImagePath('IMAGE.GIF')).toBe(true);
		});
		
		it('should return false for invalid extensions', () => {
			expect(isValidImagePath('document.txt')).toBe(false);
			expect(isValidImagePath('document.pdf')).toBe(false);
			expect(isValidImagePath('video.mp4')).toBe(false);
			expect(isValidImagePath('audio.mp3')).toBe(false);
			expect(isValidImagePath('file.doc')).toBe(false);
		});
		
		it('should return false for empty or whitespace strings', () => {
			expect(isValidImagePath('')).toBe(false);
			expect(isValidImagePath('   ')).toBe(false);
			expect(isValidImagePath('\t')).toBe(false);
			expect(isValidImagePath('\n')).toBe(false);
		});
		
		it('should return false for files without extensions', () => {
			expect(isValidImagePath('image')).toBe(false);
			expect(isValidImagePath('path/to/image')).toBe(false);
		});
		
		it('should handle complex file names', () => {
			expect(isValidImagePath('my-image_01.final.jpg')).toBe(true);
			expect(isValidImagePath('IMG_20231201_123456.png')).toBe(true);
			expect(isValidImagePath('photo (1).jpeg')).toBe(true);
		});
	});
	
	describe('isValueInRange', () => {
		it('should return true for values within range', () => {
			expect(isValueInRange(5, 0, 10)).toBe(true);
			expect(isValueInRange(0, 0, 10)).toBe(true);
			expect(isValueInRange(10, 0, 10)).toBe(true);
		});
		
		it('should return false for values outside range', () => {
			expect(isValueInRange(-1, 0, 10)).toBe(false);
			expect(isValueInRange(11, 0, 10)).toBe(false);
		});
		
		it('should work with negative ranges', () => {
			expect(isValueInRange(-5, -10, 0)).toBe(true);
			expect(isValueInRange(-11, -10, 0)).toBe(false);
			expect(isValueInRange(1, -10, 0)).toBe(false);
		});
		
		it('should work with decimal numbers', () => {
			expect(isValueInRange(5.5, 0, 10)).toBe(true);
			expect(isValueInRange(0.1, 0, 10)).toBe(true);
			expect(isValueInRange(9.99, 0, 10)).toBe(true);
		});
		
		it('should return false for non-number values', () => {
			expect(isValueInRange('5' as any, 0, 10)).toBe(false);
			expect(isValueInRange(null as any, 0, 10)).toBe(false);
			expect(isValueInRange(undefined as any, 0, 10)).toBe(false);
		});
		
		it('should return false for NaN', () => {
			expect(isValueInRange(NaN, 0, 10)).toBe(false);
		});
		
		it('should work with same min and max values', () => {
			expect(isValueInRange(5, 5, 5)).toBe(true);
			expect(isValueInRange(4, 5, 5)).toBe(false);
			expect(isValueInRange(6, 5, 5)).toBe(false);
		});
	});
	
	describe('isPositiveInteger', () => {
		it('should return true for positive integers', () => {
			expect(isPositiveInteger(1)).toBe(true);
			expect(isPositiveInteger(100)).toBe(true);
			expect(isPositiveInteger(999999)).toBe(true);
		});
		
		it('should return false for non-positive values', () => {
			expect(isPositiveInteger(0)).toBe(false);
			expect(isPositiveInteger(-1)).toBe(false);
			expect(isPositiveInteger(-100)).toBe(false);
		});
		
		it('should return false for decimal numbers', () => {
			expect(isPositiveInteger(1.5)).toBe(false);
			expect(isPositiveInteger(0.1)).toBe(false);
			expect(isPositiveInteger(-1.5)).toBe(false);
		});
		
		it('should return false for non-number values', () => {
			expect(isPositiveInteger('1' as any)).toBe(false);
			expect(isPositiveInteger(null as any)).toBe(false);
			expect(isPositiveInteger(undefined as any)).toBe(false);
		});
		
		it('should return false for special number values', () => {
			expect(isPositiveInteger(NaN)).toBe(false);
			expect(isPositiveInteger(Infinity)).toBe(false);
			expect(isPositiveInteger(-Infinity)).toBe(false);
		});
	});
	
	describe('isValidYarnsData', () => {
		it('should return true for valid yarns data', () => {
			const validYarns = {
				'yarn1.jpg': '#FF0000' as HexColor,
				'yarn2.jpg': '#00FF00' as HexColor,
				'yarn3.jpg': '#00F' as HexColor, // 3-digit hex
			};
			
			expect(isValidYarnsData(validYarns)).toBe(true);
		});
		
		it('should return true for single yarn', () => {
			const singleYarn = {
				'single-yarn.jpg': '#ABCDEF' as HexColor
			};
			
			expect(isValidYarnsData(singleYarn)).toBe(true);
		});
		
		it('should return true for various valid hex formats', () => {
			const validHexYarns = {
				'yarn1.jpg': '#000' as HexColor,       // 3-digit black
				'yarn2.jpg': '#FFF' as HexColor,       // 3-digit white
				'yarn3.jpg': '#123456' as HexColor,    // 6-digit
				'yarn4.jpg': '#abcdef' as HexColor,    // lowercase
				'yarn5.jpg': '#ABCDEF' as HexColor,    // uppercase
			};
			
			expect(isValidYarnsData(validHexYarns)).toBe(true);
		});
		
		it('should return false for null or undefined', () => {
			expect(isValidYarnsData(null)).toBe(false);
			expect(isValidYarnsData(undefined)).toBe(false);
		});
		
		it('should return false for non-object types', () => {
			expect(isValidYarnsData('string')).toBe(false);
			expect(isValidYarnsData(123)).toBe(false);
			expect(isValidYarnsData(true)).toBe(false);
			expect(isValidYarnsData(false)).toBe(false);
		});
		
		it('should return false for arrays', () => {
			expect(isValidYarnsData(['#FF0000', '#00FF00'])).toBe(false);
			expect(isValidYarnsData([])).toBe(false);
		});
		
		it('should return false for empty objects', () => {
			expect(isValidYarnsData({})).toBe(false);
		});
		
		it('should return false for invalid hex colors', () => {
			const invalidYarns = {
				'yarn1.jpg': 'not-a-color',
				'yarn2.jpg': '#FF0000'
			};
			
			expect(isValidYarnsData(invalidYarns)).toBe(false);
		});
		
		it('should return false for non-string color values', () => {
			const invalidYarns = {
				'yarn1.jpg': 123,
				'yarn2.jpg': '#FF0000'
			};
			
			expect(isValidYarnsData(invalidYarns)).toBe(false);
		});
		
		it('should return false for invalid hex color formats', () => {
			const invalidHexYarns = {
				'yarn1.jpg': '#GG0000',     // invalid hex character
				'yarn2.jpg': '#FF00',       // 4 digits (invalid)
				'yarn3.jpg': '#FF00000',    // 7 digits (invalid)
				'yarn4.jpg': 'FF0000',      // missing #
				'yarn5.jpg': '#',           // just #
				'yarn6.jpg': '#12',         // 2 digits (invalid)
			};
			
			expect(isValidYarnsData(invalidHexYarns)).toBe(false);
		});
		
		it('should return false if any color value is invalid', () => {
			const mixedValidityYarns = {
				'yarn1.jpg': '#FF0000',     // valid
				'yarn2.jpg': '#00FF00',     // valid
				'yarn3.jpg': 'invalid',     // invalid
			};
			
			expect(isValidYarnsData(mixedValidityYarns)).toBe(false);
		});
		
		it('should handle complex file names as keys', () => {
			const complexNamesYarns = {
				'my-yarn_01.final.jpg': '#FF0000' as HexColor,
				'YARN (2).PNG': '#00FF00' as HexColor,
				'yarn with spaces.jpeg': '#0000FF' as HexColor,
			};
			
			expect(isValidYarnsData(complexNamesYarns)).toBe(true);
		});
	});
});
