import {isBrowser} from './environment.js';
import {ERROR_MESSAGES} from "./errorMessages.js";

/**
 * Creates a base64-encoded PNG image from raw image data
 *
 * @param imageData - Raw RGBA pixel data as Uint8ClampedArray
 * @param width - Width of the image in pixels
 * @param height - Height of the image in pixels
 * @returns Promise resolving to base64-encoded PNG data URL
 * @throws {Error} When canvas context creation fails in browser environment
 *
 * @example
 * ```typescript
 * const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]); // 2x1 red-green image
 * const base64 = await createPngBase64(imageData, 2, 1);
 * console.log(base64); // 'data:image/png;base64,iVBORw0KG...'
 * ```
 */
export async function createPngBase64(
	imageData: Uint8ClampedArray,
	width: number,
	height: number
): Promise<string> {
	if (isBrowser()) {
		// Use Canvas API in browser
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
	} else {
		// Use pngjs on server
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
}
