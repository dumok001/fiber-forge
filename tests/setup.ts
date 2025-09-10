/**
 * Jest setup file for test configuration
 */

// Mock console methods to reduce noise during testing
global.console = {
	...console,
	warn: jest.fn(),
	error: jest.fn(),
	log: jest.fn()
};

// Mock global objects that might be needed
Object.defineProperty(global, 'TextEncoder', {
	writable: true,
	value: jest.fn().mockImplementation(() => ({
		encode: jest.fn().mockReturnValue(new Uint8Array())
	}))
});

Object.defineProperty(global, 'TextDecoder', {
	writable: true,
	value: jest.fn().mockImplementation(() => ({
		decode: jest.fn().mockReturnValue('')
	}))
});

// Setup timeout for async operations
jest.setTimeout(30000);
