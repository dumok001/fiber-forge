/**
 * Integration tests for FiberForge
 * These tests verify the complete workflow from image loading to color analysis
 */

import FiberForge from '../index';
import {HexColor, ImageData} from '../types';
import {getImageData} from '../utils/imageData';

// Create mock image data for testing
const createMockImageData = (width: number, height: number, pattern: 'solid' | 'gradient' | 'mixed' = 'solid'): ImageData => {
	const channels = 4;
	const data = new Uint8Array(width * height * channels);
	
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * channels;
			
			switch (pattern) {
				case 'solid':
					// Solid red
					data[idx] = 255;     // R
					data[idx + 1] = 0;   // G
					data[idx + 2] = 0;   // B
					data[idx + 3] = 255; // A
					break;
				
				case 'gradient':
					// Horizontal gradient
					data[idx] = Math.floor((x / width) * 255);     // R
					data[idx + 1] = Math.floor((y / height) * 255); // G
					data[idx + 2] = 100;  // B
					data[idx + 3] = 255;  // A
					break;
				
				case 'mixed':
					// Different colors in quadrants
					if (x < width / 2 && y < height / 2) {
						// Top-left: Red
						data[idx] = 255;
						data[idx + 1] = 0;
						data[idx + 2] = 0;
						data[idx + 3] = 255;
					} else if (x >= width / 2 && y < height / 2) {
						// Top-right: Green
						data[idx] = 0;
						data[idx + 1] = 255;
						data[idx + 2] = 0;
						data[idx + 3] = 255;
					} else if (x < width / 2 && y >= height / 2) {
						// Bottom-left: Blue
						data[idx] = 0;
						data[idx + 1] = 0;
						data[idx + 2] = 255;
						data[idx + 3] = 255;
					} else {
						// Bottom-right: Yellow
						data[idx] = 255;
						data[idx + 1] = 255;
						data[idx + 2] = 0;
						data[idx + 3] = 255;
					}
					break;
			}
		}
	}
	
	return {width, height, channels, data};
};

// Mock the image loading functions for integration tests
jest.mock('../utils/imageData', () => ({
	getImageData: jest.fn(),
	getImageDataBrowser: jest.fn(),
	getImageDataServer: jest.fn()
}));

const mockGetImageData = getImageData as jest.MockedFunction<typeof getImageData>;

describe('FiberForge Integration Tests', () => {
	let fiberForge: FiberForge;
	
	beforeEach(() => {
		jest.clearAllMocks();
		fiberForge = new FiberForge({platform: 'server'});
	});
	
	describe('Complete workflow - Single color image', () => {
		it('should process a solid color image and return correct results', async () => {
			const mockImageData = createMockImageData(100, 100, 'solid');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await fiberForge.parseImage({
				imagePath: './test-solid.jpg',
				maxWidthCm: 10,
				threshold: 15
			});
			
			expect(results).toHaveLength(1);
			expect(results[0]).toMatchObject({
				color: expect.stringMatching(/^#[0-9a-f]{6}$/),
				pixelCount: 10000, // 100x100
				areaInCm: 100, // (10000 / (10^2)) = 100 cm²
				percentage: 100,
				imagePart: {
					base64: expect.any(String),
					marginX: expect.any(Number),
					marginY: expect.any(Number)
				},
				yarns: []
			});
		});
	});
	
	describe('Complete workflow - Multi-color image', () => {
		it('should process a multi-color image and detect all regions', async () => {
			const mockImageData = createMockImageData(100, 100, 'mixed');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await fiberForge.parseImage({
				imagePath: './test-mixed.jpg',
				maxHeightCm: 5,
				threshold: 10
			});
			
			expect(results.length).toBeGreaterThan(1);
			
			// Check that total percentage sums to ~100%
			const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
			expect(totalPercentage).toBeCloseTo(100, 1);
			
			// Check that each region has valid properties
			results.forEach(result => {
				expect(result.color).toMatch(/^#[0-9a-f]{6}$/);
				expect(result.pixelCount).toBeGreaterThan(0);
				expect(result.areaInCm).toBeGreaterThan(0);
				expect(result.percentage).toBeGreaterThan(0);
				expect(result.imagePart.base64).toBeTruthy();
			});
		});
	});
	
	describe('Yarn matching workflow', () => {
		it('should match colors with yarn database', async () => {
			const mockImageData = createMockImageData(50, 50, 'mixed');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			// Setup yarn database
			fiberForge.yarns = {
				'red-yarn.jpg': '#FF0000' as HexColor,
				'green-yarn.jpg': '#00FF00' as HexColor,
				'blue-yarn.jpg': '#0000FF' as HexColor,
				'yellow-yarn.jpg': '#FFFF00' as HexColor
			};
			
			const results = await fiberForge.parseImage({
				imagePath: './test-yarn-matching.jpg',
				maxWidthCm: 5,
				threshold: 20,
				maxCountYarns: 3
			});
			
			expect(results.length).toBeGreaterThan(0);
			
			results.forEach(result => {
				expect(result.yarns).toBeDefined();
				expect(result.yarns.length).toBeLessThanOrEqual(3);
				
				if (result.yarns.length > 0) {
					expect(result.yarns[0]).toMatchObject({
						file: expect.any(String),
						color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
						dist: expect.any(Number)
					});
				}
			});
		});
		
		it('should add yarns individually and use them in matching', async () => {
			const mockImageData = createMockImageData(20, 20, 'solid');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			// Add yarns one by one
			fiberForge.addYarn('#FF0000' as HexColor, 'red-yarn-1.jpg');
			fiberForge.addYarn('#FF1111' as HexColor, 'red-yarn-2.jpg');
			
			const results = await fiberForge.parseImage({
				imagePath: './test-individual-yarns.jpg',
				maxWidthCm: 2,
				threshold: 15
			});
			
			expect(results).toHaveLength(1);
			expect(results[0].yarns).toHaveLength(2);
		});
	});
	
	describe('Edge cases and error handling', () => {
		it('should handle very small images', async () => {
			const mockImageData = createMockImageData(2, 2, 'mixed');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await fiberForge.parseImage({
				imagePath: './tiny-image.jpg',
				maxWidthCm: 1,
				threshold: 15,
				minimalSquarePixelArea: 1
			});
			
			expect(results.length).toBeGreaterThanOrEqual(0);
		});
		
		it('should handle images with high threshold (few regions)', async () => {
			const mockImageData = createMockImageData(50, 50, 'gradient');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await fiberForge.parseImage({
				imagePath: './gradient-image.jpg',
				maxWidthCm: 5,
				threshold: 80 // Very high threshold
			});
			
			expect(results.length).toBeLessThanOrEqual(5); // Should merge many similar colors
		});
		
		it('should handle images with low threshold (many regions)', async () => {
			const mockImageData = createMockImageData(30, 30, 'gradient');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await fiberForge.parseImage({
				imagePath: './gradient-image.jpg',
				maxWidthCm: 3,
				threshold: 1, // Very low threshold
				minimalSquarePixelArea: 10
			});
			
			// Should detect many small regions (limited by minimalSquarePixelArea)
			expect(results.length).toBeLessThanOrEqual(50);
		});
	});
	
	describe('Platform-specific behavior', () => {
		it('should work with browser platform', async () => {
			const browserForge = new FiberForge({platform: 'browser'});
			const mockImageData = createMockImageData(20, 20, 'solid');
			mockGetImageData.mockResolvedValue(mockImageData);
			
			const results = await browserForge.parseImage({
				imagePath: './browser-test.jpg',
				maxWidthCm: 2,
				threshold: 15
			});
			
			expect(mockGetImageData).toHaveBeenCalledWith('./browser-test.jpg', 'browser');
			expect(results).toHaveLength(1);
		});
	});
	
	describe('Area calculations', () => {
		it('should calculate areas correctly with different dimensions', async () => {
			const mockImageData = createMockImageData(200, 100, 'solid'); // 2:1 aspect ratio
			mockGetImageData.mockResolvedValue(mockImageData);
			
			// Test with width constraint
			const resultsWidth = await fiberForge.parseImage({
				imagePath: './test-area.jpg',
				maxWidthCm: 20, // pixelInCm = 200/20 = 10
				threshold: 15
			});
			
			expect(resultsWidth[0].areaInCm).toBe(200); // 20000 / (10^2) = 200 cm²
			
			// Test with height constraint
			const resultsHeight = await fiberForge.parseImage({
				imagePath: './test-area.jpg',
				maxHeightCm: 10, // pixelInCm = 100/10 = 10
				threshold: 15
			});
			
			expect(resultsHeight[0].areaInCm).toBe(200); // Same result
		});
	});
});
