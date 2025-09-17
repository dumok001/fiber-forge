/**
 * Browser-specific types for Node.js environment compatibility
 * These interfaces define the minimal API surface needed for image processing in browsers
 */

/**
 * Browser Image element interface for cross-platform compatibility
 */
export interface BrowserImageElement {
	width: number;
	height: number;
	src: string;
	crossOrigin: string | null;
	onload: (() => void) | null;
	onerror: (() => void) | null;
}

/**
 * Browser Canvas element interface for cross-platform compatibility
 */
export interface BrowserCanvasElement {
	width: number;
	height: number;
	
	/** Gets the 2D rendering context for drawing operations */
	getContext(contextId: '2d'): BrowserCanvasRenderingContext2D | null;
}

/**
 * Browser 2D rendering context interface for drawing and image data operations
 */
export interface BrowserCanvasRenderingContext2D {
	/** Draws an image onto the canvas at specified coordinates */
	drawImage(image: BrowserImageElement, dx: number, dy: number): void;
	
	/** Extracts pixel data from a rectangular region of the canvas */
	getImageData(sx: number, sy: number, sw: number, sh: number): BrowserImageData;
}

/**
 * Browser ImageData interface containing raw pixel information
 */
export interface BrowserImageData {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}
