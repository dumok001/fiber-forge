import {BrowserCanvasElement, BrowserImageElement, ImageData, Platform} from "../types";
import {isBrowser} from "./environment";
import {ERROR_MESSAGES} from "./errorMessages";

export async function getImageData(imagePath: string, platform: Platform): Promise<ImageData> {
	return platform === 'server'
		? await getImageDataServer(imagePath)
		: await getImageDataBrowser(imagePath);
}

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
