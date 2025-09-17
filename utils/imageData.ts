import {BrowserCanvasElement, BrowserImageElement, ImageData, Platform} from "../types/index.js";
import {isBrowser} from "./environment.js";
import {ERROR_MESSAGES} from "./errorMessages.js";

/**
 * Loads image data from a file path based on the specified platform
 *
 * @param imagePath - Path to the image file
 * @param platform - Target platform ('server' or 'browser')
 * @returns Promise resolving to image data with pixel information
 *
 * @example
 * ```typescript
 * const imageData = await getImageData('./image.jpg', 'server');
 * console.log(`Image: ${imageData.width}x${imageData.height}`);
 * ```
 */
export async function getImageData(imagePath: string, platform: Platform): Promise<ImageData> {
	return platform === 'server'
		? await getImageDataServer(imagePath)
		: await getImageDataBrowser(imagePath);
}

/**
 * Loads image data in browser environment using Canvas API
 *
 * @param imagePath - Path or URL to the image file
 * @returns Promise resolving to image data with RGBA pixel information
 * @throws {Error} When not running in browser environment or image fails to load
 *
 * @example
 * ```typescript
 * const imageData = await getImageDataBrowser('./image.jpg');
 * console.log(`Channels: ${imageData.channels}`); // 4 (RGBA)
 * ```
 */
export async function getImageDataBrowser(imagePath: string): Promise<ImageData> {
	if (!isBrowser()) {
		throw new Error(ERROR_MESSAGES.BROWSER_ENVIRONMENT_REQUIRED);
	}
	
	return new Promise((resolve, reject) => {
		// Safe access to browser global objects
		const img = new globalThis.window.Image() as BrowserImageElement;
		img.crossOrigin = 'anonymous';
		
		img.onload = () => {
			const canvas = globalThis.document.createElement('canvas') as BrowserCanvasElement;
			const ctx = canvas.getContext('2d');
			
			if (!ctx) {
				reject(new Error('Failed to get canvas context'));
				return;
			}
			
			canvas.width = img.width;
			canvas.height = img.height;
			
			ctx.drawImage(img, 0, 0);
			
			const imageData = ctx.getImageData(0, 0, img.width, img.height);
			
			resolve({
				width: img.width,
				height: img.height,
				channels: 4, // RGBA
				data: new Uint8Array(imageData.data)
			});
		};
		
		img.onerror = () => {
			reject(new Error(`Failed to load image: ${imagePath}`));
		};
		
		img.src = imagePath;
	});
}

/**
 * Loads image data in Node.js environment using Sharp library
 *
 * @param imagePath - Path to the image file on filesystem
 * @returns Promise resolving to image data with raw pixel information
 * @throws {Error} When running in browser environment or Sharp fails to process image
 *
 * @example
 * ```typescript
 * const imageData = await getImageDataServer('./image.jpg');
 * console.log(`Channels: ${imageData.channels}`); // 3 (RGB) or 4 (RGBA)
 * ```
 */
export async function getImageDataServer(imagePath: string): Promise<ImageData> {
	if (isBrowser()) {
		throw new Error(ERROR_MESSAGES.SERVER_ENVIRONMENT_REQUIRED);
	}
	
	const sharp = (await import('sharp')).default;
	const image = sharp(imagePath);
	const {width, height, channels} = await image.metadata();
	const {data} = await image.raw().toBuffer({resolveWithObject: true});
	
	return {
		width: width!,
		height: height!,
		channels: channels!,
		data
	};
}
