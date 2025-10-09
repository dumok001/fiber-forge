/**
 * Error messages constants for the Tafting project
 * All error messages are centralized here for better maintainability and i18n support
 */

export const ERROR_MESSAGES = {
	// Image data loading errors
	BROWSER_ENVIRONMENT_REQUIRED: 'Browser environment is required for getImageDataBrowser',
	WORKER_ENVIRONMENT_REQUIRED: 'Worker environment is required for getImageDataWebWorker',
	SERVER_ENVIRONMENT_REQUIRED: 'Server environment is required for getImageDataServer',
	UNSUPPORTED_PLATFORM: (platform: string) => `Unsupported platform: ${platform}`,
	
	CANVAS_CONTEXT_FAILED: 'Failed to get Canvas context',
	NO_FILE_SPECIFIED: 'No file specified',
	INVALID_YARNS_DATA: 'Invalid yarns data',
	FAILED_TO_GET_OFFSCREENCANVAS_CONTEXT: "Failed to get OffscreenCanvas context",
	// Validation errors
	PROCESSING_FILE: (file: string) => `Error processing ${file}`,
	
	THRESHOLD_INVALID_RANGE: (min: number, max: number) =>
		`Threshold must be an integer between ${min} and ${max}.`,
	THRESHOLD_PERCENT_INVALID: 'Threshold percent must be between 0 and 100.',
	DIMENSIONS_MISSING: 'Either maxWidthCm or maxHeightCm must be provided',
	
	// Color processing errors
	NO_VALID_PIXELS: 'No valid pixels found in the specified region. It might be too light or transparent.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
