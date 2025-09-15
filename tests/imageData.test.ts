/**
 * Simplified unit tests for image data loading utilities
 */

import {getImageDataServer} from '../utils/imageData';

// Simple test that focuses on server functionality only
describe('Image Data Loading Utilities - Simplified Tests', () => {
	describe('Server functionality', () => {
		it('should have getImageDataServer function', () => {
			expect(typeof getImageDataServer).toBe('function');
		});
		
		it('should handle invalid image paths gracefully', async () => {
			// This test will fail in a controlled way, which is expected
			await expect(getImageDataServer('./nonexistent-file.jpg')).rejects.toThrow();
		});
	});
	
	describe('Function exports', () => {
		it('should export required functions', async () => {
			const imageDataModule = await import('../utils/imageData');
			
			expect(typeof imageDataModule.getImageData).toBe('function');
			expect(typeof imageDataModule.getImageDataServer).toBe('function');
			expect(typeof imageDataModule.getImageDataBrowser).toBe('function');
		});
	});
});
