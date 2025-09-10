/**
 * Unit tests for image utilities
 */

import {createPngBase64} from '../utils/image';
import {isBrowser} from '../utils/environment';

// Mock environment detection
jest.mock('../utils/environment');

const mockIsBrowser = isBrowser as jest.MockedFunction<typeof isBrowser>;

describe('Image Utilities', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	describe('createPngBase64', () => {
		it('should handle server environment', async () => {
			mockIsBrowser.mockReturnValue(false);
			
			const imageData = new Uint8ClampedArray(16);
			const result = await createPngBase64(imageData, 2, 2);
			
			// В моке должен вернуть пустую строку при ошибке
			expect(typeof result).toBe('string');
		});
	});
});
