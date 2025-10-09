import {ERROR_MESSAGES} from "./errorMessages.js";
import {Platform} from "../types/index.js";

/**
 * Creates a base64-encoded PNG image from raw image data
 *
 * @param imageData - Raw RGBA pixel data as Uint8ClampedArray
 * @param width - Width of the image in pixels
 * @param height - Height of the image in pixels
 * @param platform - Target platform ('server' or 'browser' or 'webworker')
 * @returns Promise resolving to base64-encoded PNG data URL
 * @throws {Error} When canvas context creation fails in browser environment
 *
 * @example
 * ```typescript
 * const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]); // 2x1 red-green image
 * const base64 = await createPngBase64(imageData, 2, 1, 'browser');
 * console.log(base64); // 'data:image/png;base64,iVBORw0KG...'
 * ```
 */
export async function createPngBase64(
	imageData: Uint8ClampedArray,
	width: number,
	height: number,
	platform: Platform
): Promise<string> {
	
	switch (platform) {
		case 'server':
			return createPngBase64Server(imageData, width, height);
		case 'browser':
			return createPngBase64Browser(imageData, width, height);
		case 'webworker':
			return createPngBase64WebWorker(imageData, width, height);
		default:
			throw new Error(ERROR_MESSAGES.UNSUPPORTED_PLATFORM(platform));
	}
}

/**
 * Creates a base64-encoded PNG image in browser environment using Canvas API
 *
 * @param imageData - Raw RGBA pixel data as Uint8ClampedArray
 * @param width - Width of the image in pixels
 * @param height - Height of the image in pixels
 * @returns Promise resolving to base64-encoded PNG data URL
 * @throws {Error} When canvas context creation fails
 *
 * @example
 * ```typescript
 * // Used internally when running in browser main thread
 * const base64 = await createPngBase64Browser(imageData, 100, 100);
 * ```
 */
async function createPngBase64Browser(
	imageData: Uint8ClampedArray,
	width: number,
	height: number
): Promise<string> {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	
	if (!ctx) {
		throw new Error(ERROR_MESSAGES.CANVAS_CONTEXT_FAILED);
	}
	
	const imgData = ctx.createImageData(width, height);
	imgData.data.set(imageData);
	ctx.putImageData(imgData, 0, 0);
	
	return canvas.toDataURL('image/png');
}

/**
 * Creates a base64-encoded PNG image in WebWorker environment using OffscreenCanvas
 *
 * @param imageData - Raw RGBA pixel data as Uint8ClampedArray
 * @param width - Width of the image in pixels
 * @param height - Height of the image in pixels
 * @returns Promise resolving to base64-encoded PNG data URL
 * @throws {Error} When OffscreenCanvas context creation fails
 *
 * @example
 * ```typescript
 * // Used internally when running in WebWorker
 * const base64 = await createPngBase64WebWorker(imageData, 100, 100);
 * ```
 */
async function createPngBase64WebWorker(
	imageData: Uint8ClampedArray,
	width: number,
	height: number
): Promise<string> {
	// @ts-ignore: OffscreenCanvas may not be available in all TypeScript environments
	const canvas = new (globalThis.OffscreenCanvas as any)(width, height);
	const ctx = canvas.getContext('2d');
	
	if (!ctx) {
		throw new Error(ERROR_MESSAGES.OFFSCREEN_CANVAS_CONTEXT_FAILED);
	}
	
	const imgData = ctx.createImageData(width, height);
	imgData.data.set(imageData);
	ctx.putImageData(imgData, 0, 0);
	
	// Convert OffscreenCanvas to blob and then to base64
	const blob = await canvas.convertToBlob({type: 'image/png'});
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = new Uint8Array(arrayBuffer);
	
	// Convert buffer to base64 string manually since btoa might not be available in WebWorker
	let binary = '';
	for (let i = 0; i < buffer.length; i++) {
		binary += String.fromCharCode(buffer[i]);
	}
	const base64 = btoa(binary);
	
	return 'data:image/png;base64,' + base64;
}

/**
 * Creates a base64-encoded PNG image in Node.js environment using pngjs library
 *
 * @param imageData - Raw RGBA pixel data as Uint8ClampedArray
 * @param width - Width of the image in pixels
 * @param height - Height of the image in pixels
 * @returns Promise resolving to base64-encoded PNG data URL
 * @throws {Error} When pngjs library fails to create PNG
 *
 * @example
 * ```typescript
 * // Used internally when running in Node.js
 * const base64 = await createPngBase64Server(imageData, 100, 100);
 * ```
 */
async function createPngBase64Server(
	imageData: Uint8ClampedArray,
	width: number,
	height: number
): Promise<string> {
	try {
		const {PNG} = await import('pngjs');
		const png = new PNG({width, height});
		
		for (let i = 0; i < imageData.length; i++) {
			png.data[i] = imageData[i];
		}
		
		const buffer = PNG.sync.write(png);
		return 'data:image/png;base64,' + Buffer.from(buffer).toString('base64');
	} catch (error) {
		console.error('Error creating PNG on server:', error);
		return '';
	}
}
