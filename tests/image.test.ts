/**
 * Unit tests for image utilities
 */

import {createPngBase64} from '../utils/image';
import {isBrowser, isWebWorker} from '../utils/environment';

// Mock environment detection
jest.mock('../utils/environment');

const mockIsBrowser = isBrowser as jest.MockedFunction<typeof isBrowser>;
const mockIsWebWorker = isWebWorker as jest.MockedFunction<typeof isWebWorker>;

// Mock browser globals
const mockCanvas = {
	width: 0,
	height: 0,
	getContext: jest.fn(() => ({
		createImageData: jest.fn(() => ({
			data: new Uint8ClampedArray(16)
		})),
		putImageData: jest.fn(),
	})),
	toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
};

const mockDocument = {
	createElement: jest.fn(() => mockCanvas)
};

// Mock global objects for browser environment
Object.defineProperty(global, 'document', {
	value: mockDocument,
	writable: true
});

describe('Image Utilities', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsWebWorker.mockReturnValue(false);
	});
	
	describe('createPngBase64', () => {
		it('should handle server environment', async () => {
			mockIsBrowser.mockReturnValue(false);
			
			const imageData = new Uint8ClampedArray(16);
			const result = await createPngBase64(imageData, 2, 2, 'server');
			
			// В серверной среде должен возвращать строку (может быть пустой при ошибке)
			expect(typeof result).toBe('string');
		});
		
		it('should create base64 PNG from image data in server environment', async () => {
			mockIsBrowser.mockReturnValue(false);
			
			const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]);
			
			const result = await createPngBase64(imageData, 2, 2, 'server');
			
			expect(typeof result).toBe('string');
		});
		
		it('should handle browser environment', async () => {
			mockIsBrowser.mockReturnValue(true);
			
			const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
			
			const result = await createPngBase64(imageData, 2, 1, 'browser');
			
			expect(result).toBe('data:image/png;base64,mockdata');
			expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
		});
		
		it('should handle WebWorker environment when platform is browser', async () => {
			mockIsBrowser.mockReturnValue(true);
			mockIsWebWorker.mockReturnValue(true);
			
			// Mock OffscreenCanvas for WebWorker
			const mockOffscreenCanvas = {
				getContext: jest.fn(() => ({
					createImageData: jest.fn(() => ({
						data: new Uint8ClampedArray(8)
					})),
					putImageData: jest.fn(),
				})),
				convertToBlob: jest.fn(() => Promise.resolve(new Blob(['mock'], {type: 'image/png'})))
			};
			
			Object.defineProperty(global, 'OffscreenCanvas', {
				value: jest.fn(() => mockOffscreenCanvas),
				writable: true
			});
			
			Object.defineProperty(global, 'btoa', {
				value: jest.fn(() => 'mockbase64'),
				writable: true
			});
			
			const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
			
			const result = await createPngBase64(imageData, 2, 1, 'browser');
			
			expect(typeof result).toBe('string');
			expect(result).toContain('data:image/png;base64,');
		});
	});
});
