import {YarnColorRegion, YarnColorsData} from "./types/yarn";
import {getAverageColor, getClosestColors, hexToRgb, mergeSimilarColors, quantize} from "./utils/colors";
import {ColorCountMap, HexColor} from "./types/color";
import {getSquare} from "./utils/square";
import {ImageData} from "./types/image";
import {BrowserCanvasElement, BrowserImageElement} from "./types/browser";


// Declare global types to avoid TypeScript errors
declare global {
	var window: any;
	var document: any;
}

const isBrowser = typeof globalThis !== 'undefined' &&
	typeof globalThis.window !== 'undefined' &&
	typeof globalThis.document !== 'undefined';
// Re-export types for convenience
export * from './types';

type Platform = 'server' | 'browser';

class FiberForge {
	private readonly platform: Platform = 'server'
	
	constructor(platform?: Platform) {
		if (platform)
			this.platform = platform
	}
	
	
	parseImage(imagePath: string, yarnColorsData?: YarnColorsData) {
		return this.getImageColorStats(imagePath, yarnColorsData);
	}
	
	async parseYarn(yarnPath: string, yarnColorRegion: YarnColorRegion) {
		const yarnImageData = await this.getImageData(yarnPath);
		return getAverageColor(yarnImageData, yarnColorRegion);
	}
	
	private async getImageColorStats(imagePath: string, yarnColorsData?: YarnColorsData) {
		const {width, height, channels, data} = await this.getImageData(imagePath);
		
		let nonTransparentPixels = 0;
		const colorSet = new Set<HexColor>();
		const colorCountMap: ColorCountMap = new Map<HexColor, number>();
		
		for (let i = 0; i < data.length; i += channels) {
			const [r, g, b, a = 255] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
			if (a > 0) {
				nonTransparentPixels++;
				const hex = `#${[r, g, b].map(x => quantize(x).toString(16).padStart(2, '0')).join('')}` as HexColor;
				colorSet.add(hex);
				colorCountMap.set(hex, (colorCountMap.get(hex) || 0) + 1);
			}
		}
		const mergedColors = mergeSimilarColors(Array.from(colorSet), colorCountMap, 40);
		const colorPercentages = mergedColors.map(({color, count}) => ({
			color,
			colorRgb: hexToRgb(color).join(','),
			percentage: parseFloat(((count / nonTransparentPixels) * 100).toFixed(2))
		})).filter(x => x.percentage > 0.001);
		
		
		const uniqueColorsWithMatches = colorPercentages.map(({color, percentage, colorRgb}) => ({
			color,
			percentage,
			colorRgb,
			matches: yarnColorsData ? getClosestColors(color, yarnColorsData) : []
		})).sort((a, b) => b.percentage - a.percentage);
		
		const {widthCm, heightCm, areaCm} = getSquare({width, height, nonTransparentPixels});
		
		return {
			widthPx: width,
			heightPx: height,
			nonTransparentAreaPx: nonTransparentPixels,
			widthCm,
			heightCm,
			nonTransparentAreaCm: areaCm,
			uniqueColors: uniqueColorsWithMatches,
		};
	}
	
	private async getImageData(imagePath: string): Promise<ImageData> {
		return this.platform === 'server' ? await this.getImageDataServer(imagePath) : await this.getImageDataBrowser(imagePath);
	}
	
	private async getImageDataBrowser(imagePath: string): Promise<ImageData> {
		if (!isBrowser) {
			throw new Error('Browser environment is required for getImageDataBrowser');
		}
		
		return new Promise((resolve, reject) => {
			// Безопасный доступ к глобальным объектам браузера
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
	
	private async getImageDataServer(imagePath: string): Promise<ImageData> {
		if (isBrowser) {
			throw new Error('Server environment is required for getImageDataServer');
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
	
}


// async function test() {
// 	const fiberForge = new FiberForge();
//
//
// 	const _path = '/tmp'
// 	const output = 'yarnColors.json'
//
// 	await FileStore.ensureFileExists(output, _path).catch(err => {
// 		console.error(`Error ensuring file exists: ${err.message}`);
// 		process.exit(1);
// 	})
//
// 	const store = new FileStore(output, _path);
// 	const items = await store.getItems() as YarnColorsData
// 	const result = await fiberForge.parseImage('./sketch/target.png', items)
// }
//
// test()

export default FiberForge;
